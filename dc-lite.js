// Лёгкий исполнитель прототипов: шаблон <x-dc> с {{дырками}}, <sc-if>, <sc-for>
// и класс Component extends DCLogic поверх Preact.
(function () {
  var preact = window.preact;
  var h = preact.h;
  var WHOLE = /^\s*\{\{([^}]+)\}\}\s*$/;
  var ANY = /\{\{([^}]+)\}\}/g;
  var TABLE_TAGS = /<(\/?)(table|thead|tbody|tfoot|tr|td|th)(?=[\s>])/gi;

  function lookup(path, scopes) {
    path = path.trim();
    if (path === 'true') return true;
    if (path === 'false') return false;
    if (path === 'null') return null;
    if (/^-?\d+(\.\d+)?$/.test(path)) return Number(path);
    var parts = path.split('.');
    for (var i = scopes.length - 1; i >= 0; i--) {
      var scope = scopes[i];
      if (scope != null && parts[0] in Object(scope)) {
        var v = scope;
        for (var j = 0; j < parts.length; j++) {
          if (v == null) return undefined;
          v = v[parts[j]];
        }
        return v;
      }
    }
    return undefined;
  }

  function value(str, scopes) {
    var m = str.match(WHOLE);
    if (m) return lookup(m[1], scopes);
    return str.replace(ANY, function (_, p) {
      var v = lookup(p, scopes);
      return v == null ? '' : String(v);
    });
  }

  function renderNodes(nodes, scopes) {
    var out = [];
    for (var i = 0; i < nodes.length; i++) {
      var r = renderNode(nodes[i], scopes);
      if (Array.isArray(r)) out.push.apply(out, r);
      else if (r != null) out.push(r);
    }
    return out;
  }

  function renderNode(n, scopes) {
    if (n.nodeType === 3) {
      if (n.data.indexOf('{{') < 0) return n.data;
      var t = value(n.data, scopes);
      return t == null ? '' : String(t);
    }
    if (n.nodeType !== 1) return null;
    var tag = n.localName;
    var kids = Array.prototype.slice.call(n.childNodes);
    if (tag === 'sc-if') {
      return value(n.getAttribute('value') || '', scopes) ? renderNodes(kids, scopes) : null;
    }
    if (tag === 'sc-for') {
      var list = value(n.getAttribute('list') || '', scopes) || [];
      var as = n.getAttribute('as') || 'item';
      var res = [];
      list.forEach(function (item, index) {
        var local = { $index: index };
        local[as] = item;
        res.push.apply(res, renderNodes(kids, scopes.concat([local])));
      });
      return res;
    }
    if (tag.indexOf('dc-') === 0) tag = tag.slice(3);
    var props = {};
    for (var i = 0; i < n.attributes.length; i++) {
      var a = n.attributes[i];
      if (a.name.indexOf('hint-') === 0) continue;
      props[a.name] = a.value.indexOf('{{') < 0 ? a.value : value(a.value, scopes);
    }
    return h.apply(null, [tag, props].concat(renderNodes(kids, scopes)));
  }

  function DCLogic(props) {
    preact.Component.call(this, props);
  }
  DCLogic.prototype = Object.create(preact.Component.prototype);
  DCLogic.prototype.constructor = DCLogic;
  DCLogic.prototype.render = function () {
    return h('div', null, renderNodes(this.__template, [this.renderVals() || {}]));
  };

  function start() {
    fetch(location.href)
      .then(function (r) { return r.text(); })
      .then(function (source) {
        var body = source.split('<x-dc>')[1].split('</x-dc>')[0];
        // Таблицы переименовываются до разбора: иначе парсер HTML выносит
        // <sc-for> из <tbody> и строки теряются.
        var holder = document.createElement('div');
        holder.innerHTML = body.replace(TABLE_TAGS, '<$1dc-$2');
        var helmet = holder.querySelector('helmet');
        if (helmet) {
          Array.prototype.slice.call(helmet.children).forEach(function (c) {
            document.head.appendChild(c);
          });
          helmet.remove();
        }
        var script = document.querySelector('script[data-dc-script]');
        var Cls = new Function('DCLogic', script.textContent + '\n;return Component;')(DCLogic);
        Cls.prototype.__template = Array.prototype.slice.call(holder.childNodes);
        var mountPoint = document.getElementById('dc-root');
        preact.render(h(Cls, {}), mountPoint);
      });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();

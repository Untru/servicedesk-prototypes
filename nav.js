// Верхняя полоса переключения прототипов: наборы, вкладки текущего набора и стрелки по всему списку.
(function () {
  var SETS = [
    { title: 'Рабочее место · 25.10', short: 'Рабочее место', pages: [
      ['a-buttons.html', 'А', 'Панель действий'], ['b-buttons.html', 'Б', 'Меню «Ещё»'], ['c-buttons.html', 'В', 'Действия в строке'],
      ['p1-filters.html', '1', 'Фильтры и вкладки'], ['p2-focus.html', '2', 'Очередь'], ['p3-kanban.html', '3', 'Канбан'],
      ['p4-sheet.html', '4', 'Боковая карточка'], ['p5-day.html', '5', 'Мой день']] },
    { title: 'Фильтры и сортировка · 27.10', short: 'Фильтры', pages: [
      ['f1-chips.html', 'Ф1', 'Фильтры-чипсы'], ['f2-facets.html', 'Ф2', 'Фасеты слева'], ['f3-query.html', 'Ф3', 'Строка запроса'],
      ['plan.html', 'План', 'Большие объёмы']] },
    { title: 'Форма заявки · 27.10', short: 'Форма заявки', pages: [
      ['m1-two-columns.html', 'У1', 'Две колонки'], ['m2-tabs.html', 'У2', 'Вкладки по делу'], ['m3-status-bar.html', 'У3', 'Шаги статуса'],
      ['m4-read-mode.html', 'У4', 'Просмотр → правка'], ['m5-feed.html', 'У5', 'Лента справа'],
      ['h1-tracker.html', 'H1', 'Как в трекере'], ['h2-drawer.html', 'H2', 'Выезжающая панель'], ['h3-timeline.html', 'H3', 'Таймлайн'],
      ['h4-dashboard.html', 'H4', 'Дашборд заявки'], ['h5-chat.html', 'H5', 'Диалог с заказчиком']] }
  ];
  var css = '.pnav{position:sticky;top:0;z-index:50;display:flex;align-items:center;gap:8px;padding:8px 12px;background:#1C1C1A;font-family:Inter,system-ui,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,.18)}'
    + '.pnav a{color:#FFFFFF;text-decoration:none;font-size:14px;white-space:nowrap;border-radius:20px;display:inline-flex;align-items:center;min-height:40px;padding:0 14px}'
    + '.pnav a:hover{background:#3D3D3A}.pnav a:focus-visible{outline:2px solid #FFD23F;outline-offset:2px}'
    + '.pnav a[aria-current=page]{background:#FFD23F;color:#1C1C1A;font-weight:600}'
    + '.pnav .sets{flex:none;display:flex;gap:2px;padding:2px;border-radius:22px;background:#2E2E2B}'
    + '.pnav .sets a{min-height:36px;padding:0 12px;color:#D8D8D4}.pnav .sets a.is-set{background:#4A4A46;color:#FFFFFF;font-weight:600}'
    + '.pnav .tabs{flex:1;min-width:0;display:flex;align-items:center;gap:4px;overflow-x:auto;scrollbar-width:thin}'
    + '.pnav .key{font-weight:700;margin-right:6px}'
    + '.pnav .arrow{flex:none;width:40px;justify-content:center;padding:0;font-size:20px;background:#2E2E2B}'
    + '@media(max-width:820px){.pnav{flex-wrap:wrap}.pnav .sets{order:1;width:100%;overflow-x:auto}.pnav .sets a{flex:1;justify-content:center}}';
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var nav = document.getElementById('pnav');
  if (!nav) return;
  var file = location.pathname.split('/').pop() || 'index.html';
  var flat = [], current = -1, currentSet = -1;
  SETS.forEach(function (set, s) {
    set.pages.forEach(function (p) {
      if (p[0] === file) { current = flat.length; currentSet = s; }
      flat.push(p);
    });
  });
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var html = '<a href="./" aria-label="Все прототипы">☰ Все</a><div class="sets" role="group" aria-label="Наборы прототипов">';
  SETS.forEach(function (set, s) {
    html += '<a href="' + set.pages[0][0] + '" title="' + esc(set.title) + '"' + (s === currentSet ? ' class="is-set"' : '') + '>' + esc(set.short) + '</a>';
  });
  html += '</div>';
  if (current >= 0) {
    var prev = flat[(current - 1 + flat.length) % flat.length], next = flat[(current + 1) % flat.length];
    html += '<a class="arrow" href="' + prev[0] + '" aria-label="Предыдущий прототип">‹</a><div class="tabs">';
    SETS[currentSet].pages.forEach(function (p) {
      html += '<a href="' + p[0] + '"' + (p[0] === file ? ' aria-current="page"' : '') + '><span class="key">' + esc(p[1]) + '</span>' + esc(p[2]) + '</a>';
    });
    html += '</div><a class="arrow" href="' + next[0] + '" aria-label="Следующий прототип">›</a>';
  }
  nav.innerHTML = html;
  var active = nav.querySelector('[aria-current=page]');
  if (active) active.scrollIntoView({ inline: 'center', block: 'nearest' });
  window.PROTOTYPE_SETS = SETS;
})();

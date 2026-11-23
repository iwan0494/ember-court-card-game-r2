/* Ember Court — DOM rendering. All visuals live here. */
'use strict';

function el(tag, cls, html) {
  var e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}

/* One card element. Header band art differs per suit (gradient + glyph + pattern
   via .suit-* classes in styles.css). COMBO stamp sits on the band corner,
   never over the flavor text below. */
function cardElement(card, opts) {
  opts = opts || {};
  var suit = SUITS[card.suit];
  var c = el('button', 'card suit-' + card.suit + (opts.selectable === false ? '' : ' playable'));
  c.type = 'button';
  c.setAttribute('data-card-id', card.id);
  if (opts.selected) c.classList.add('selected');
  if (opts.unaffordable) c.classList.add('unaffordable');

  var band = el('div', 'band');
  band.appendChild(el('span', 'band-glyph', suit.glyph));
  band.appendChild(el('span', 'band-name', suit.name + (card.court ? ' · Court' : '')));
  c.appendChild(band);

  var body = el('div', 'card-body');
  body.appendChild(el('div', 'card-name', card.name));
  if (card.court) body.appendChild(el('span', 'card-court', 'Court Card · x2'));
  body.appendChild(el('div', 'card-flavor', card.flavor));
  c.appendChild(body);

  var foot = el('div', 'card-foot');
  foot.appendChild(el('span', 'card-cost', '◆ ' + card.cost + ' energy'));
  foot.appendChild(el('span', 'card-power', card.power + '<small> dmg</small>'));
  c.appendChild(foot);

  if (opts.combo) c.appendChild(el('span', 'combo-stamp', 'COMBO ×2'));
  return c;
}

function showScreen(id) {
  ['screen-title', 'screen-table', 'screen-end'].forEach(function (s) {
    document.getElementById(s).classList.toggle('hidden', s !== id);
  });
}

function applyPhase(state) {
  var body = document.body;
  body.classList.remove('phase-title', 'phase-table', 'phase-win', 'phase-loss');
  body.classList.add('phase-' + (state.phase === 'win' ? 'win' : state.phase === 'loss' ? 'loss'
    : state.phase === 'table' ? 'table' : 'title'));
}

function renderTitleFan() {
  var fan = document.getElementById('title-fan');
  if (!fan || fan.children.length) return;
  /* Fan preview: one card per suit + one Court card, fanned out. */
  fan.appendChild(cardElement(cardById('ember-2'), { selectable: false }));
  fan.appendChild(cardElement(cardById('ember-c'), { selectable: false }));
  fan.appendChild(cardElement(cardById('tide-2'), { selectable: false }));
}

function renderTable(state) {
  /* Fighters */
  document.getElementById('cinder-life-fill').style.width = (state.cinderLife / 30 * 100) + '%';
  document.getElementById('cinder-life-text').textContent = state.cinderLife + ' / 30';
  document.getElementById('cinder-hand-count').textContent = state.cinderHand.length;
  document.getElementById('player-life-fill').style.width = (state.playerLife / 30 * 100) + '%';
  document.getElementById('player-life-text').textContent = state.playerLife + ' / 30';
  document.getElementById('player-energy').textContent = state.playerEnergy;
  document.getElementById('turn-count').textContent = state.turn;
  document.getElementById('turn-banner').textContent = 'YOUR TURN · ' + state.playerEnergy + ' ENERGY';

  /* Played rows — centered, dense; empty state fills the middle instead of a bare left edge. */
  renderPlayedRow(document.getElementById('played-cinder'), state.playedCinder, 'Cinder has not played yet.');
  renderPlayedRow(document.getElementById('played-player'), state.playedPlayer, 'Play a card — it lands here, at the heart of the table.');

  /* Log */
  var log = document.getElementById('duel-log');
  log.innerHTML = '';
  state.log.forEach(function (line) { log.appendChild(el('li', null, line)); });

  /* Hand */
  var hand = document.getElementById('player-hand');
  hand.innerHTML = '';
  state.playerHand.forEach(function (card, i) {
    var c = cardElement(card, {
      selected: state.selected === i,
      unaffordable: card.cost > state.playerEnergy
    });
    c.addEventListener('click', function () { window.__emberSelect(i); });
    hand.appendChild(c);
  });
  document.getElementById('btn-end-turn').disabled = false;
}

function renderPlayedRow(container, played, emptyText) {
  container.innerHTML = '';
  if (!played.length) {
    container.appendChild(el('div', 'played-empty', emptyText));
    return;
  }
  played.forEach(function (p) {
    container.appendChild(cardElement(p.card, { selectable: false, combo: p.combo }));
  });
}

function renderEnd(state) {
  var win = state.phase === 'win';
  /* Compact layout: the full end screen (emblem + title + key cards + stats +
     buttons) must fit a 1280x800 viewport without cutting the buttons. */
  document.getElementById('screen-end').classList.add('end-compact');
  document.getElementById('end-emblem-glyph').textContent = win ? '\u2726' : '\u2744';
  document.getElementById('end-kicker').textContent = win ? 'Victory' : 'Defeat';
  document.getElementById('end-title').textContent = win ? 'The Court Is Yours' : 'The Embers Fade';
  document.getElementById('end-earned').textContent = win
    ? 'Title earned: Court Champion'
    : 'Title earned: Fallen Challenger';
  document.getElementById('end-story').textContent = win
    ? 'Lady Cinder bows her burning crown. The court, the suits, the smoke — all of it answers to you now.'
    : 'Lady Cinder gathers the embers back into her crown. The court keeps its queen — for now. Duel again and take it.';

  /* Key cards: last three decisive cards, newest first. */
  var keys = document.getElementById('end-keycards');
  keys.innerHTML = '';
  var ids = state.keyCards.slice(-3).reverse();
  if (!ids.length) ids = win ? ['ember-c', 'ember-3', 'tide-c'] : ['ember-2', 'thorn-2', 'gale-2'];
  ids.forEach(function (id) {
    var card = cardById(id);
    if (card) keys.appendChild(cardElement(card, { selectable: false }));
  });

  var s = state.stats;
  var stats = document.getElementById('end-stats');
  stats.innerHTML = '';
  [
    [s.turns || state.turn, 'Turns'],
    [s.damageDealt, 'Damage dealt'],
    [s.damageTaken, 'Damage taken'],
    [s.cardsPlayed, 'Cards played'],
    [s.combos, 'Combos'],
    [s.courts, 'Court cards']
  ].forEach(function (pair) {
    var d = el('div', 'end-stat');
    d.appendChild(el('b', null, String(pair[0])));
    d.appendChild(el('span', null, pair[1]));
    stats.appendChild(d);
  });
}

function render(state) {
  applyPhase(state);
  if (state.phase === 'title') { showScreen('screen-title'); renderTitleFan(); }
  else if (state.phase === 'table') { showScreen('screen-table'); renderTable(state); }
  else { showScreen('screen-end'); renderEnd(state); }
}

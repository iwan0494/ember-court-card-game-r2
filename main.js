/* Ember Court — wiring: input, keyboard, deterministic ?shot= presets. */
'use strict';

var state = newGame(20261123);

function selectCard(i) {
  if (state.phase !== 'table') return;
  state.selected = (state.selected === i) ? -1 : i;
  render(state);
}

function confirmPlay() {
  if (state.phase !== 'table' || state.selected < 0) return;
  var card = state.playerHand[state.selected];
  if (!card) return;
  if (card.cost > state.playerEnergy) {
    logLine(state, 'Not enough energy for <b>' + card.name + '</b> (' + card.cost + ' needed).');
    render(state);
    return;
  }
  state.selected = -1;
  playCard(state, 'player', state.playerHand.indexOf(card));
  render(state);
}

window.__emberSelect = function (i) {
  if (state.selected === i) { confirmPlay(); return; }
  selectCard(i);
};

function restart() {
  state = newGame(20261123 + state.turn);
  startDuel(state);
  render(state);
}

function backToTitle() {
  state = newGame(20261123);
  render(state);
}

/* Deterministic screenshot states: ?shot=title|table|win|loss */
function applyShotPreset() {
  var shot = new URLSearchParams(window.location.search).get('shot');
  if (!shot) return;
  if (shot === 'title') { state.phase = 'title'; return; }

  startDuel(state);
  if (shot === 'table') {
    /* Mid-duel: Cinder at 18, player at 22, 2 energy left, combo on the table. */
    state.turn = 3;
    state.playerLife = 22;
    state.cinderLife = 18;
    state.playerEnergy = 2;
    state.playerHand = [cardById('ember-3'), cardById('tide-2'), cardById('thorn-c'), cardById('gale-1'), cardById('ember-1')];
    state.cinderHand = [cardById('tide-3'), cardById('gale-2'), cardById('thorn-1'), cardById('ember-2'), cardById('tide-1')];
    state.playedPlayer = [
      { card: cardById('ember-2'), combo: false, court: false },
      { card: cardById('ember-c'), combo: true, court: true }
    ];
    state.playedCinder = [{ card: cardById('tide-2'), combo: false, court: false }];
    state.stats = { turns: 3, damageDealt: 12, damageTaken: 8, cardsPlayed: 4, combos: 1, courts: 1 };
    state.keyCards = ['ember-2', 'ember-c', 'tide-2'];
    state.log = [
      'You play <b>Queen of Embers</b> — <span class="dmg">16 damage</span> (Court x2 + COMBO x2) to Cinder.',
      'You play <b>Flame Lash</b> — <span class="dmg">4 damage</span> to Cinder.',
      'Cinder plays <b>Crashing Wave</b> — <span class="dmg">4 damage</span> to you.',
      'Turn <b>3</b>. Energy restored to <b>3</b>.'
    ];
    return;
  }
  if (shot === 'win') {
    state.cinderLife = 0;
    state.playerLife = 14;
    state.turn = 6;
    state.stats = { turns: 6, damageDealt: 34, damageTaken: 16, cardsPlayed: 9, combos: 2, courts: 2 };
    state.keyCards = ['ember-c', 'ember-3', 'thorn-c'];
    state.phase = 'win';
    return;
  }
  if (shot === 'loss') {
    state.playerLife = 0;
    state.cinderLife = 9;
    state.turn = 5;
    state.stats = { turns: 5, damageDealt: 21, damageTaken: 30, cardsPlayed: 8, combos: 1, courts: 1 };
    state.keyCards = ['tide-3', 'gale-c', 'ember-3'];
    state.phase = 'loss';
    return;
  }
}

document.addEventListener('DOMContentLoaded', function () {
  applyShotPreset();
  render(state);

  document.getElementById('btn-start').addEventListener('click', function () {
    state = newGame(Date.now() % 2147483647);
    startDuel(state);
    render(state);
  });
  document.getElementById('btn-how').addEventListener('click', function () {
    document.getElementById('howto').classList.toggle('hidden');
  });
  document.getElementById('btn-end-turn').addEventListener('click', function () {
    endPlayerTurn(state); render(state);
  });
  document.getElementById('btn-restart').addEventListener('click', restart);
  document.getElementById('btn-again').addEventListener('click', restart);
  document.getElementById('btn-title').addEventListener('click', backToTitle);

  document.addEventListener('keydown', function (e) {
    if (state.phase === 'title') {
      if (e.key === 'Enter') document.getElementById('btn-start').click();
      return;
    }
    if (state.phase === 'win' || state.phase === 'loss') {
      if (e.key === 'r' || e.key === 'R') restart();
      if (e.key === 'Escape') backToTitle();
      return;
    }
    if (e.key >= '1' && e.key <= '5') selectCard(parseInt(e.key, 10) - 1);
    else if (e.key === 'Enter') confirmPlay();
    else if (e.key === 'Escape') { state.selected = -1; render(state); }
    else if (e.key === 'e' || e.key === 'E') { endPlayerTurn(state); render(state); }
    else if (e.key === 'r' || e.key === 'R') restart();
  });
});

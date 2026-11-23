/* Ember Court — game state & rules. Plain JS, no dependencies. */
'use strict';

var SUITS = {
  ember: { name: 'Ember', glyph: '\u2726', verb: 'burns' },
  tide:  { name: 'Tide',  glyph: '\u224B', verb: 'drowns' },
  thorn: { name: 'Thorn', glyph: '\u273F', verb: 'snares' },
  gale:  { name: 'Gale',  glyph: '\u2756', verb: 'rends' }
};

/* Deck: 4 suits x (3 commons + 1 court). Court cards deal double damage. */
var DECK = [
  { id: 'ember-1', name: 'Ember Spark',   suit: 'ember', cost: 1, power: 2, court: false, flavor: 'A coal wakes in the dark.' },
  { id: 'ember-2', name: 'Flame Lash',    suit: 'ember', cost: 2, power: 4, court: false, flavor: 'The whip cracks, the air ignites.' },
  { id: 'ember-3', name: 'Inferno Roar',  suit: 'ember', cost: 3, power: 6, court: false, flavor: 'The court itself catches fire.' },
  { id: 'ember-c', name: 'Queen of Embers', suit: 'ember', cost: 3, power: 4, court: true, flavor: 'Her crown is a living flame.' },
  { id: 'tide-1',  name: 'Tide Pull',     suit: 'tide',  cost: 1, power: 2, court: false, flavor: 'The sea takes back its own.' },
  { id: 'tide-2',  name: 'Crashing Wave', suit: 'tide',  cost: 2, power: 4, court: false, flavor: 'A wall of water, no shore in sight.' },
  { id: 'tide-3',  name: 'Abyssal Surge', suit: 'tide',  cost: 3, power: 6, court: false, flavor: 'Something old stirs below.' },
  { id: 'tide-c',  name: 'King of Tides', suit: 'tide',  cost: 3, power: 4, court: true,  flavor: 'His tide answers to no moon.' },
  { id: 'thorn-1', name: 'Thorn Snare',   suit: 'thorn', cost: 1, power: 2, court: false, flavor: 'Roots rise where you stand.' },
  { id: 'thorn-2', name: 'Briar Volley',  suit: 'thorn', cost: 2, power: 4, court: false, flavor: 'A hundred thorns, one target.' },
  { id: 'thorn-3', name: 'Wildwood Wrath', suit: 'thorn', cost: 3, power: 6, court: false, flavor: 'The forest remembers every cut.' },
  { id: 'thorn-c', name: 'Queen of Thorns', suit: 'thorn', cost: 3, power: 4, court: true, flavor: 'Her garden bites back.' },
  { id: 'gale-1',  name: 'Gale Gust',     suit: 'gale',  cost: 1, power: 2, court: false, flavor: 'The wind finds every crack.' },
  { id: 'gale-2',  name: 'Storm Shear',   suit: 'gale',  cost: 2, power: 4, court: false, flavor: 'The sky itself is a blade.' },
  { id: 'gale-3',  name: 'Tempest Howl',  suit: 'gale',  cost: 3, power: 6, court: false, flavor: 'Thunder answers the challenge.' },
  { id: 'gale-c',  name: 'King of Gales', suit: 'gale',  cost: 3, power: 4, court: true,  flavor: 'He wears the storm as a cloak.' }
];

function cardById(id) {
  for (var i = 0; i < DECK.length; i++) if (DECK[i].id === id) return DECK[i];
  return null;
}

/* Small seeded RNG so ?shot= states are deterministic. */
function mulberry32(seed) {
  var a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(arr, rand) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(rand() * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

function newGame(seed) {
  var rand = mulberry32(seed || (Date.now() % 2147483647));
  return {
    seed: seed || 0,
    rand: rand,
    turn: 1,
    phase: 'title',           /* title | table | win | loss */
    playerLife: 30, cinderLife: 30,
    playerEnergy: 3, cinderEnergy: 3,
    playerDeck: shuffle(DECK, rand),
    cinderDeck: shuffle(DECK, rand),
    playerHand: [], cinderHand: [],
    playedPlayer: [],         /* cards played this turn, player side */
    playedCinder: [],
    lastSuitPlayer: null,     /* suit of last card played this turn (combo check) */
    log: [],
    selected: -1,
    stats: { turns: 0, damageDealt: 0, damageTaken: 0, cardsPlayed: 0, combos: 0, courts: 0 },
    keyCards: []              /* ids of decisive cards for the end screen */
  };
}

function drawUpTo(state, who, n) {
  var hand = who === 'player' ? state.playerHand : state.cinderHand;
  var deck = who === 'player' ? state.playerDeck : state.cinderDeck;
  while (hand.length < n && deck.length) hand.push(deck.shift());
  if (!deck.length) { /* reshuffle discard pile: reuse deck */
    var fresh = shuffle(DECK, state.rand);
    if (who === 'player') state.playerDeck = fresh; else state.cinderDeck = fresh;
    while (hand.length < n && (who === 'player' ? state.playerDeck : state.cinderDeck).length)
      hand.push((who === 'player' ? state.playerDeck : state.cinderDeck).shift());
  }
}

function startDuel(state) {
  state.phase = 'table';
  state.turn = 1;
  state.playerEnergy = 3;
  drawUpTo(state, 'player', 5);
  drawUpTo(state, 'cinder', 5);
  logLine(state, '<b>The duel begins.</b> Lady Cinder smiles through the smoke.');
  logLine(state, 'Draw 5 cards. You have <b>3 energy</b>.');
}

function logLine(state, html) {
  state.log.unshift(html);
  if (state.log.length > 8) state.log.length = 8;
}

/* Damage rules: base power; Court x2; same-suit combo x2 on the 2nd+ card. */
function computeDamage(state, card, who) {
  var dmg = card.power, mods = [];
  if (card.court) { dmg *= 2; mods.push('Court x2'); }
  var lastSuit = who === 'player' ? state.lastSuitPlayer : state.lastSuitCinder;
  if (lastSuit === card.suit) { dmg *= 2; mods.push('COMBO x2'); }
  return { dmg: dmg, combo: lastSuit === card.suit, mods: mods };
}

function playCard(state, who, handIndex) {
  var hand = who === 'player' ? state.playerHand : state.cinderHand;
  var card = hand[handIndex];
  if (!card) return null;
  var energy = who === 'player' ? state.playerEnergy : state.cinderEnergy;
  if (card.cost > energy) return null;

  var res = computeDamage(state, card, who);
  hand.splice(handIndex, 1);
  if (who === 'player') {
    state.playerEnergy -= card.cost;
    state.playedPlayer.push({ card: card, combo: res.combo, court: card.court });
    state.lastSuitPlayer = card.suit;
    state.cinderLife = Math.max(0, state.cinderLife - res.dmg);
    state.stats.damageDealt += res.dmg;
    state.stats.cardsPlayed++;
    if (res.combo) state.stats.combos++;
    if (card.court) state.stats.courts++;
    state.keyCards.push(card.id);
    logLine(state, 'You play <b>' + card.name + '</b> — <span class="dmg">' + res.dmg + ' damage</span>' +
      (res.mods.length ? ' (' + res.mods.join(' + ') + ')' : '') + ' to Cinder.');
  } else {
    state.cinderEnergy -= card.cost;
    state.playedCinder.push({ card: card, combo: res.combo, court: card.court });
    state.lastSuitCinder = card.suit;
    state.playerLife = Math.max(0, state.playerLife - res.dmg);
    state.stats.damageTaken += res.dmg;
    logLine(state, 'Cinder plays <b>' + card.name + '</b> — <span class="dmg">' + res.dmg + ' damage</span>' +
      (res.mods.length ? ' (' + res.mods.join(' + ') + ')' : '') + ' to you.');
  }
  checkEnd(state);
  return res;
}

/* Cinder AI: play the strongest affordable cards while she has energy. */
function cinderTurn(state) {
  state.cinderEnergy = 3;
  state.playedCinder = [];
  state.lastSuitCinder = null;
  var guard = 0;
  while (state.cinderEnergy > 0 && guard++ < 8) {
    var best = -1, bestPower = -1;
    for (var i = 0; i < state.cinderHand.length; i++) {
      var c = state.cinderHand[i];
      if (c.cost <= state.cinderEnergy && c.power > bestPower) { best = i; bestPower = c.power; }
    }
    if (best < 0) break;
    playCard(state, 'cinder', best);
    if (state.phase === 'win' || state.phase === 'loss') return;
  }
  if (state.playedCinder.length === 0) logLine(state, 'Cinder holds her hand, watching you.');
}

function endPlayerTurn(state) {
  if (state.phase !== 'table') return;
  state.stats.turns = state.turn;
  logLine(state, '— You end your turn. Cinder answers. —');
  cinderTurn(state);
  if (state.phase === 'win' || state.phase === 'loss') return;
  state.turn++;
  state.playerEnergy = 3;
  state.playedPlayer = [];
  state.playedCinder = [];
  state.lastSuitPlayer = null;
  state.lastSuitCinder = null;
  drawUpTo(state, 'player', 5);
  drawUpTo(state, 'cinder', 5);
  logLine(state, 'Turn <b>' + state.turn + '</b>. Energy restored to <b>3</b>.');
}

function checkEnd(state) {
  if (state.cinderLife <= 0 && state.phase === 'table') {
    state.phase = 'win';
    logLine(state, '<b>Cinder falls.</b> The court is yours.');
  } else if (state.playerLife <= 0 && state.phase === 'table') {
    state.phase = 'loss';
    logLine(state, '<b>You fall.</b> The embers dim.');
  }
}

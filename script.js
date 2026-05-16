// ──────────────────────────────────────────
//  CONSTANTS
// ──────────────────────────────────────────
const SUITS     = ['♠','♥','♦','♣'];
const VALUES    = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const RANKS     = [14, 2,  3,  4,  5,  6,  7,  8,  9,  10,  11, 12, 13];
const CHIP_VALS = [11, 2,  3,  4,  5,  6,  7,  8,  9,  10,  10, 10, 10];

const BLIND_NAMES   = ['Small Blind','Big Blind','Boss Blind'];
const BLIND_TARGETS = [
  [300,   450,   600],
  [800,   1200,  1600],
  [2000,  3000,  4000],
  [5000,  8000,  11000],
  [13000, 20000, 28000],
  [35000, 50000, 70000],
  [50000, 75000, 100000],
  [80000, 120000, 160000],
];

const BOSS_EFFECTS = [
  null,
  {name:'The Wall', desc:'Punteggio target ×4', mod: (t)=>t*4},
  {name:'The Hook', desc:'Perdi 1 scarto', debuff:'discards'},
  {name:'The Eye', desc:'Ogni mano deve essere diversa', debuff:'unique'},
  {name:'The Tooth', desc:'Perdi $1 ogni carta giocata', debuff:'tooth'},
  {name:'The Arm', desc:'I Joker perdono efficacia', debuff:'arm'},
];

const HAND_BASE = {
  'High Card':       {ch:5,   m:1},
  'Pair':            {ch:10,  m:2},
  'Two Pair':        {ch:20,  m:2},
  'Three of a Kind': {ch:30,  m:3},
  'Straight':        {ch:30,  m:4},
  'Flush':           {ch:35,  m:4},
  'Full House':      {ch:40,  m:4},
  'Four of a Kind':  {ch:60,  m:7},
  'Straight Flush':  {ch:100, m:8},
  'Royal Flush':     {ch:100, m:8},
  'Five of a Kind':  {ch:120, m:12},
};

const JOKER_POOL = [
  // COMMON
  {id:'j1',  name:'Joker',          type:'Common', cost:4, desc:'+4 Mult', apply:()=>({m:4})},
  {id:'j2',  name:'Greedy Joker',   type:'Common', cost:5, desc:'+3 Mult per ♦', apply:(c)=>({m:c.filter(x=>x.suit==='♦').length*3})},
  {id:'j3',  name:'Lusty Joker',    type:'Common', cost:5, desc:'+3 Mult per ♥', apply:(c)=>({m:c.filter(x=>x.suit==='♥').length*3})},
  {id:'j4',  name:'Wrathful Joker', type:'Common', cost:5, desc:'+3 Mult per ♠', apply:(c)=>({m:c.filter(x=>x.suit==='♠').length*3})},
  {id:'j5',  name:'Gluttonous',     type:'Common', cost:5, desc:'+3 Mult per ♣', apply:(c)=>({m:c.filter(x=>x.suit==='♣').length*3})},
  {id:'j6',  name:'Scary Face',     type:'Common', cost:4, desc:'+30 Chips per figura', apply:(c)=>({ch:c.filter(x=>['J','Q','K'].includes(x.value)).length*30})},
  {id:'j7',  name:'Banner',         type:'Common', cost:5, desc:'+30 Chips per scarto', apply:(_,_2,_3,_4,_5,gs)=>({ch:gs.discardsLeft*30})},
  {id:'j8',  name:'Ice Cream',      type:'Common', cost:4, desc:'+100 Chips, -5 per mano', apply:(_,_2,_3,_4,_5,gs)=>({ch:Math.max(0,100-gs.handsPlayed*5)})},
  
  // UNCOMMON
  {id:'j9',  name:'Jolly Joker',    type:'Uncommon', cost:6, desc:'+8 Mult se Coppia', apply:(_,h)=>({m:['Pair','Two Pair','Full House'].includes(h)?8:0})},
  {id:'j10', name:'Zany Joker',     type:'Uncommon', cost:6, desc:'+12 Mult se Tris', apply:(_,h)=>({m:['Three of a Kind','Full House'].includes(h)?12:0})},
  {id:'j11', name:'Mad Joker',      type:'Uncommon', cost:6, desc:'+10 Mult se Doppia Coppia', apply:(_,h)=>({m:h==='Two Pair'?10:0})},
  {id:'j12', name:'Crazy Joker',    type:'Uncommon', cost:6, desc:'+12 Mult se Scala', apply:(_,h)=>({m:['Straight','Straight Flush','Royal Flush'].includes(h)?12:0})},
  {id:'j13', name:'Droll Joker',    type:'Uncommon', cost:6, desc:'+10 Mult se Colore', apply:(_,h)=>({m:['Flush','Straight Flush','Royal Flush'].includes(h)?10:0})},
  {id:'j14', name:'Sly Joker',      type:'Uncommon', cost:5, desc:'+50 Chips se Coppia', apply:(_,h)=>({ch:['Pair','Two Pair','Full House'].includes(h)?50:0})},
  {id:'j15', name:'Wily Joker',     type:'Uncommon', cost:6, desc:'+100 Chips se Tris', apply:(_,h)=>({ch:['Three of a Kind','Full House'].includes(h)?100:0})},
  {id:'j16', name:'Half Joker',     type:'Uncommon', cost:6, desc:'+20 Mult se ≤3 carte', apply:(c)=>({m:c.length<=3?20:0})},
  {id:'j17', name:'Scholar',        type:'Uncommon', cost:6, desc:'+20 Chips +4 Mult se Asso', apply:(c)=>({ch:c.find(x=>x.value==='A')?20:0,m:c.find(x=>x.value==='A')?4:0})},
  {id:'j18', name:'Bull',           type:'Uncommon', cost:7, desc:'+2 Chips per $', apply:(_,_2,_3,_4,_5,gs)=>({ch:gs.money*2})},
  {id:'j19', name:'Flash Card',     type:'Uncommon', cost:6, desc:'+15 Mult prima mano', apply:(_,_2,_3,_4,_5,gs)=>({m:gs.handsPlayed===0?15:0})},
  
  // RARE
  {id:'j20', name:'Abstract Joker', type:'Rare', cost:8, desc:'+3 Mult per Joker', apply:(_,_2,_3,_4,jks)=>({m:jks.length*3})},
  {id:'j21', name:'Four Fingers',   type:'Rare', cost:7, desc:'Scala/Colore con 4 carte', apply:()=>({})},
  
  // LEGENDARY
  {id:'j22', name:'Triboulet',      type:'Legendary', cost:12, desc:'Re/Regina: ×2 Mult', apply:(c)=>({m:Math.pow(2,c.filter(x=>['K','Q'].includes(x.value)).length)-1,multType:'x'})},
  {id:'j23', name:'Canio',          type:'Legendary', cost:12, desc:'Figure: ×3 Mult', apply:(c)=>({m:c.filter(x=>['J','Q','K'].includes(x.value)).length*2,multType:'x'})},
  {id:'j24', name:'Yorick',         type:'Legendary', cost:12, desc:'+1 Mult per scarto fatto', apply:(_,_2,_3,_4,_5,gs)=>({m:(gs.totalDiscards||0)})},
];

// Planet cards - migliorano le mani
const PLANET_CARDS = [
  {id:'p1', name:'Pluto',   hand:'High Card',       desc:'Migliora Carta Alta',      cost:3},
  {id:'p2', name:'Mercury', hand:'Pair',            desc:'Migliora Coppia',          cost:3},
  {id:'p3', name:'Uranus',  hand:'Two Pair',        desc:'Migliora Doppia Coppia',   cost:3},
  {id:'p4', name:'Venus',   hand:'Three of a Kind', desc:'Migliora Tris',            cost:3},
  {id:'p5', name:'Saturn',  hand:'Straight',        desc:'Migliora Scala',           cost:3},
  {id:'p6', name:'Jupiter', hand:'Flush',           desc:'Migliora Colore',          cost:3},
  {id:'p7', name:'Earth',   hand:'Full House',      desc:'Migliora Full House',      cost:3},
  {id:'p8', name:'Mars',    hand:'Four of a Kind',  desc:'Migliora Poker',           cost:4},
  {id:'p9', name:'Neptune', hand:'Straight Flush',  desc:'Migliora Straight Flush',  cost:4},
  {id:'p10',name:'Pluto X', hand:'Royal Flush',     desc:'Migliora Royal Flush',     cost:5},
];

// Tarot cards - effetti immediati
const TAROT_CARDS = [
  {id:'t1', name:'The Fool',       desc:'Copia un Joker casuale',              cost:4, effect:'copy_joker'},
  {id:'t2', name:'The Magician',   desc:'Trasforma 2 carte in ♠',              cost:3, effect:'transform_suit', suit:'♠'},
  {id:'t3', name:'High Priestess', desc:'Trasforma 2 carte in ♥',              cost:3, effect:'transform_suit', suit:'♥'},
  {id:'t4', name:'The Empress',    desc:'Trasforma 2 carte in ♦',              cost:3, effect:'transform_suit', suit:'♦'},
  {id:'t5', name:'The Emperor',    desc:'Trasforma 2 carte in ♣',              cost:3, effect:'transform_suit', suit:'♣'},
  {id:'t6', name:'The Hierophant', desc:'Potenziamento casuale a 2 carte',     cost:4, effect:'enhance_random'},
  {id:'t7', name:'The Lovers',     desc:'Trasforma 1 carta in Asso ♥',         cost:4, effect:'create_lovers'},
  {id:'t8', name:'The Chariot',    desc:'+30 Chips alla prossima mano',        cost:4, effect:'temp_chips'},
  {id:'t9', name:'Justice',        desc:'+10 Mult alla prossima mano',         cost:4, effect:'temp_mult'},
  {id:'t10',name:'The Hermit',     desc:'Guadagni $6 immediatamente',          cost:3, effect:'money', value:6},
  {id:'t11',name:'Wheel of Fortune',desc:'25%: edizione speciale a un Joker',  cost:5, effect:'wheel'},
  {id:'t12',name:'Strength',       desc:'Aumenta rango di 2 carte',            cost:4, effect:'rank_up'},
  {id:'t13',name:'The Hanged Man', desc:'Distruggi le carte selezionate',      cost:4, effect:'destroy_selected'},
  {id:'t14',name:'Death',          desc:'Trasforma 2 carte in K ♠',            cost:5, effect:'create_death'},
  {id:'t15',name:'Temperance',     desc:'+$3 per Joker posseduto',             cost:4, effect:'money_per_joker'},
  {id:'t16',name:'The Devil',      desc:'Trasforma 3 carte in figure casuali', cost:5, effect:'random_faces'},
  {id:'t17',name:'The Tower',      desc:'+50 Chips, perdi 1 scarto',           cost:4, effect:'tower'},
  {id:'t18',name:'The Star',       desc:'Tutte le carte diventano ♦',          cost:5, effect:'all_same_suit', suit:'♦'},
  {id:'t19',name:'The Moon',       desc:'+2 mani extra per questo round',      cost:4, effect:'extra_hands'},
  {id:'t20',name:'The Sun',        desc:'+25 Mult alla prossima mano',         cost:5, effect:'big_mult'},
  {id:'t21',name:'Judgement',      desc:'Crea un Joker casuale (se slot libero)',cost:6, effect:'random_joker'},
  {id:'t22',name:'The World',      desc:'Vinci immediatamente questo Blind',   cost:8, effect:'win_blind'},
];

// ──────────────────────────────────────────
//  STATE
// ──────────────────────────────────────────
let G = {};

function newGame() {
  G = {
    phase:'blind_select',
    ante:1, blind:0,
    score:0, target:BLIND_TARGETS[0][0],
    handsLeft:4, discardsLeft:3,
    maxHands:4, maxDiscards:3,
    money:4,
    deck:[], hand:[], discardPile:[],
    selected:new Set(),
    jokers:[],
    consumables:[],
    shopItems:[],
    shopRerolls:0,
    scoring:null,
    reward:'',
    busy:false,
    handsPlayed:0,
    handsThisRound:[],
    totalDiscards:0,
    planetLevels:{},
    tempChips:0,
    tempMult:0,
    bossEffect:null,
    round:1,
    handSize:8,
    sortMode:'none', // 'none', 'rank', 'suit'
    animatingCards:[],
  };
  Object.keys(HAND_BASE).forEach(h=>G.planetLevels[h]=1);
  G.deck = mkDeck();
  generateBossEffect();
  render();
}

function generateBossEffect() {
  if (G.blind === 2) {
    G.bossEffect = BOSS_EFFECTS[Math.floor(Math.random()*BOSS_EFFECTS.length)];
    if (G.bossEffect?.debuff==='discards') G.maxDiscards = Math.max(1, G.maxDiscards-1);
  } else {
    G.bossEffect = null;
    G.maxDiscards = 3;
  }
}

// ──────────────────────────────────────────
//  DECK
// ──────────────────────────────────────────
function mkDeck() {
  const d = [];
  let id = 0;
  for (let s=0;s<4;s++)
    for (let v=0;v<13;v++)
      d.push({
        id:id++,
        suit:SUITS[s],
        value:VALUES[v],
        rank:RANKS[v],
        cv:CHIP_VALS[v],
        enhancement:null,
        seal:null,
        edition:null,
      });
  return shuffle(d);
}

function shuffle(a) {
  a = [...a];
  for (let i=a.length-1;i>0;i--) {
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

function sortHand() {
  if (G.sortMode==='none') {
    G.sortMode='rank';
    G.hand.sort((a,b)=>b.rank-a.rank);
  } else if (G.sortMode==='rank') {
    G.sortMode='suit';
    const suitOrder = {'♠':0,'♥':1,'♦':2,'♣':3};
    G.hand.sort((a,b)=>suitOrder[a.suit]-suitOrder[b.suit]||b.rank-a.rank);
  } else {
    G.sortMode='none';
    // Non ordinare, lascia com'è
  }
  render();
}

function draw(n=G.handSize) {
  while (G.hand.length < n) {
    if (!G.deck.length) {
      if (!G.discardPile.length) break;
      G.deck = shuffle(G.discardPile);
      G.discardPile = [];
    }
    const card = G.deck.pop();
    card.justDrawn = true; // Per animazione
    G.hand.push(card);
  }
  // Pulisci animazione dopo un po'
  setTimeout(()=>{
    G.hand.forEach(c=>c.justDrawn=false);
    render();
  },500);
}

// ──────────────────────────────────────────
//  HAND EVALUATION
// ──────────────────────────────────────────
function evalHand(cards) {
  if (!cards.length) return 'High Card';
  const ff = G.jokers.some(j=>j.id==='j21');
  const min = ff ? 4 : 5;

  const rc = {};
  cards.forEach(c => rc[c.rank]=(rc[c.rank]||0)+1);
  const counts = Object.values(rc).sort((a,b)=>b-a);
  const uRanks = [...new Set(cards.map(c=>c.rank))].sort((a,b)=>a-b);

  const isFlush = cards.length>=min && cards.every(c=>c.suit===cards[0].suit||c.enhancement==='wild');

  let isStraight = false;
  if (uRanks.length>=min && counts[0]===1) {
    for (let i=0;i<=uRanks.length-min;i++) {
      const w=uRanks.slice(i,i+min);
      if (w[min-1]-w[0]===min-1){isStraight=true;break}
    }
    if (!isStraight && uRanks.includes(14)) {
      const al=[1,...uRanks.filter(r=>r!==14)].sort((a,b)=>a-b);
      for (let i=0;i<=al.length-min;i++) {
        const w=al.slice(i,i+min);
        if (w[min-1]-w[0]===min-1){isStraight=true;break}
      }
    }
  }

  if (counts[0]===5) return 'Five of a Kind';
  if ([14,13,12,11,10].every(r=>uRanks.includes(r))&&isFlush) return 'Royal Flush';
  if (isFlush&&isStraight) return 'Straight Flush';
  if (counts[0]===4) return 'Four of a Kind';
  if (counts[0]===3&&counts[1]===2) return 'Full House';
  if (isFlush) return 'Flush';
  if (isStraight) return 'Straight';
  if (counts[0]===3) return 'Three of a Kind';
  if (counts[0]===2&&counts[1]===2) return 'Two Pair';
  if (counts[0]===2) return 'Pair';
  return 'High Card';
}

function calcScore(cards) {
  const hn = evalHand(cards);
  const level = G.planetLevels[hn] || 1;
  const base = HAND_BASE[hn];
  let ch = base.ch + (level-1)*10 + cards.reduce((s,c)=>{
    let val = c.cv;
    if (c.enhancement==='bonus') val += 30;
    if (c.edition==='foil') val += 50;
    return s + val;
  },0) + G.tempChips;
  
  let m  = base.m + (level-1)*1 + G.tempMult;
  
  // Boss: The Arm riduce i bonus
  const armReduction = G.bossEffect?.debuff==='arm' ? 0.5 : 1;
  
  let xMult = 1;
  for (const j of G.jokers) {
    const r = j.apply(cards,hn,ch,m,G.jokers,G);
    if (r.multType==='x') {
      xMult *= (1 + (r.m||0));
    } else {
      ch += Math.floor((r.ch||0)*armReduction);
      m  += Math.floor((r.m||0)*armReduction);
    }
  }
  
  // Carte giocate
  cards.forEach(c=>{
    if (c.enhancement==='mult') m += 4;
    if (c.enhancement==='glass') xMult *= 2;
    if (c.enhancement==='lucky' && Math.random()<0.2) m += 20;
    if (c.enhancement==='lucky' && Math.random()<0.2) G.money += 20;
    if (c.edition==='holo') m += 10;
    if (c.edition==='polychrome') xMult *= 1.5;
  });
  
  // Steel in mano
  G.hand.forEach(c=>{
    if (c.enhancement==='steel' && !cards.includes(c)) xMult *= 1.5;
  });
  
  const total = Math.floor(ch * m * xMult);
  return {hn,ch,m,xMult,total};
}

// ──────────────────────────────────────────
//  ANIMATIONS
// ──────────────────────────────────────────
function animateCards(className, duration=400) {
  const cards = document.querySelectorAll('.card');
  cards.forEach((card,i)=>{
    setTimeout(()=>{
      card.classList.add(className);
      setTimeout(()=>card.classList.remove(className), duration);
    }, i*50);
  });
}

// ──────────────────────────────────────────
//  ACTIONS
// ──────────────────────────────────────────
function startRound() {
  G.score=0; G.handsLeft=G.maxHands; G.discardsLeft=G.maxDiscards;
  G.hand=[]; G.discardPile=[]; G.selected=new Set(); G.scoring=null;
  G.handsPlayed=0; G.handsThisRound=[]; G.totalDiscards=0;
  G.tempChips=0; G.tempMult=0;
  G.target = BLIND_TARGETS[Math.min(G.ante-1,BLIND_TARGETS.length-1)][G.blind];
  if (G.bossEffect?.mod) G.target = G.bossEffect.mod(G.target);
  G.phase='playing';
  draw(G.handSize);
  setTimeout(()=>animateCards('card-draw',500),100);
  render();
}

function toggleCard(id) {
  if (G.busy) return;
  if (G.selected.has(id)) G.selected.delete(id);
  else if (G.selected.size<5) G.selected.add(id);
  render();
}

function playHand() {
  if (G.busy||G.selected.size===0||G.handsLeft<=0) return;
  
  if (G.bossEffect?.debuff==='unique') {
    const played = G.hand.filter(c=>G.selected.has(c.id));
    const hn = evalHand(played);
    if (G.handsThisRound.includes(hn)) {
      alert('⚠ The Eye: Devi giocare una mano diversa!');
      return;
    }
    G.handsThisRound.push(hn);
  }
  
  if (G.bossEffect?.debuff==='tooth') {
    const played = G.hand.filter(c=>G.selected.has(c.id));
    G.money = Math.max(0, G.money - played.length);
  }
  
  const played = G.hand.filter(c=>G.selected.has(c.id));
  const result = calcScore(played);
  G.scoring=result;
  G.score+=result.total;
  G.handsLeft--;
  G.handsPlayed++;
  G.hand=G.hand.filter(c=>!G.selected.has(c.id));
  G.discardPile.push(...played);
  G.selected=new Set();
  G.busy=true;
  
  G.tempChips=0;
  G.tempMult=0;
  
  // Gold in hand
  G.hand.forEach(c=>{
    if (c.enhancement==='gold') G.money += 3;
  });
  
  render();
  setTimeout(()=>animateCards('card-play',400),50);
  
  const sv = document.querySelector('.score-val');
  if (sv) { sv.classList.remove('bump'); void sv.offsetWidth; sv.classList.add('bump'); }

  setTimeout(()=>{
    G.busy=false;
    if (G.score>=G.target){winRound();return}
    if (G.handsLeft<=0){G.phase='game_over';render();return}
    G.scoring=null;
    draw(G.handSize);
    setTimeout(()=>animateCards('card-draw',500),100);
    render();
  },1600);
}

function discardCards() {
  if (G.busy||G.selected.size===0||G.discardsLeft<=0) return;
  
  // Animazione scarto
  const discardedIds = [...G.selected];
  animateCards('card-discard',400);
  
  G.discardPile.push(...G.hand.filter(c=>G.selected.has(c.id)));
  G.hand=G.hand.filter(c=>!G.selected.has(c.id));
  G.selected=new Set();
  G.discardsLeft--;
  G.totalDiscards++;
  
  setTimeout(()=>{
    draw(G.handSize);
    setTimeout(()=>animateCards('card-draw',500),100);
    render();
  },300);
  
  render();
}

// ──────────────────────────────────────────
//  CONSUMABILI (TAROT & PLANET)
// ──────────────────────────────────────────
function useConsumable(index) {
  if (G.busy) return;
  const item = G.consumables[index];
  if (!item) return;
  
  if (item.type==='Planet') {
    // Planet: potenzia la mano corrispondente
    G.planetLevels[item.hand] = (G.planetLevels[item.hand]||1) + 1;
    G.consumables.splice(index,1);
    showNotification(`🌟 ${item.hand} potenziata al livello ${G.planetLevels[item.hand]}!`);
    render();
  } else if (item.type==='Tarot' && G.phase==='playing') {
    // Tarot: effetto immediato
    applyTarotEffect(item);
    G.consumables.splice(index,1);
    render();
  } else if (item.type==='Tarot') {
    showNotification('I Tarocchi possono essere usati solo durante il gioco');
  }
}

function applyTarotEffect(item) {
  switch(item.effect) {
    case 'money':
      G.money += (item.value||5);
      showNotification(`💰 +$${item.value||5}!`);
      break;
      
    case 'transform_suit':
      for (let i=0;i<Math.min(2,G.hand.length);i++) {
        const idx = Math.floor(Math.random()*G.hand.length);
        G.hand[idx].suit = item.suit;
      }
      showNotification(`✨ 2 carte trasformate in ${item.suit}!`);
      break;
      
    case 'enhance_random':
      const enhs = ['bonus','mult','wild','glass','steel','gold','lucky'];
      for (let i=0;i<Math.min(2,G.hand.length);i++) {
        const idx = Math.floor(Math.random()*G.hand.length);
        G.hand[idx].enhancement = enhs[Math.floor(Math.random()*enhs.length)];
      }
      showNotification('✨ 2 carte potenziate!');
      break;
      
    case 'create_lovers':
      if (G.hand.length>0) {
        const idx = Math.floor(Math.random()*G.hand.length);
        G.hand[idx].value = 'A';
        G.hand[idx].rank = 14;
        G.hand[idx].cv = 11;
        G.hand[idx].suit = '♥';
      }
      showNotification('❤️ Creata carta Lovers!');
      break;
      
    case 'temp_chips':
      G.tempChips += 30;
      showNotification('⚔️ +30 Chips alla prossima mano!');
      break;
      
    case 'temp_mult':
      G.tempMult += 10;
      showNotification('⚖️ +10 Mult alla prossima mano!');
      break;
      
    case 'big_mult':
      G.tempMult += 25;
      showNotification('☀️ +25 Mult alla prossima mano!');
      break;
      
    case 'wheel':
      if (Math.random()<0.25 && G.jokers.length>0) {
        const eds = ['foil','holo','polychrome'];
        const j = G.jokers[Math.floor(Math.random()*G.jokers.length)];
        j.edition = eds[Math.floor(Math.random()*eds.length)];
        showNotification(`🎡 ${j.name} è diventato ${j.edition}!`);
      } else {
        showNotification('🎡 Ruota della fortuna: Nope!');
      }
      break;
      
    case 'rank_up':
      for (let i=0;i<Math.min(2,G.hand.length);i++) {
        const idx = Math.floor(Math.random()*G.hand.length);
        const card = G.hand[idx];
        const valIdx = VALUES.indexOf(card.value);
        if (valIdx>0 && card.value!=='A') {
          card.value = VALUES[valIdx-1];
          card.rank = RANKS[valIdx-1];
          card.cv = CHIP_VALS[valIdx-1];
        }
      }
      showNotification('💪 Rango di 2 carte aumentato!');
      break;
      
    case 'destroy_selected':
      if (G.selected.size>0) {
        const toDestroy = G.hand.filter(c=>G.selected.has(c.id));
        G.discardPile.push(...toDestroy);
        G.hand = G.hand.filter(c=>!G.selected.has(c.id));
        G.selected = new Set();
        draw(G.handSize);
        showNotification('💀 Carte distrutte!');
      } else {
        showNotification('Seleziona le carte da distruggere prima');
        G.consumables.push({...item}); // Rimetto la carta
      }
      break;
      
    case 'create_death':
      for (let i=0;i<Math.min(2,G.hand.length);i++) {
        const idx = Math.floor(Math.random()*G.hand.length);
        G.hand[idx].value = 'K';
        G.hand[idx].rank = 13;
        G.hand[idx].cv = 10;
        G.hand[idx].suit = '♠';
      }
      showNotification('💀 2 carte trasformate in K ♠!');
      break;
      
    case 'money_per_joker':
      const earned = G.jokers.length * 3;
      G.money += earned;
      showNotification(`💰 +$${earned} (${G.jokers.length} Joker × $3)!`);
      break;
      
    case 'random_faces':
      const faces = ['J','Q','K'];
      for (let i=0;i<Math.min(3,G.hand.length);i++) {
        const idx = Math.floor(Math.random()*G.hand.length);
        const face = faces[Math.floor(Math.random()*3)];
        G.hand[idx].value = face;
        G.hand[idx].rank = RANKS[VALUES.indexOf(face)];
        G.hand[idx].cv = 10;
      }
      showNotification('😈 3 carte trasformate in figure!');
      break;
      
    case 'tower':
      G.tempChips += 50;
      G.discardsLeft = Math.max(0, G.discardsLeft-1);
      showNotification('🗼 +50 Chips, -1 scarto!');
      break;
      
    case 'all_same_suit':
      G.hand.forEach(c=>c.suit=item.suit||'♦');
      showNotification(`⭐ Tutte le carte diventano ${item.suit||'♦'}!`);
      break;
      
    case 'extra_hands':
      G.handsLeft += 2;
      G.maxHands += 2;
      showNotification('🌙 +2 mani extra!');
      break;
      
    case 'random_joker':
      if (G.jokers.length<5) {
        const available = JOKER_POOL.filter(j=>!G.jokers.find(x=>x.id===j.id));
        if (available.length) {
          const newJoker = available[Math.floor(Math.random()*available.length)];
          G.jokers.push({...newJoker});
          showNotification(`⚡ Creato Joker: ${newJoker.name}!`);
        }
      } else {
        showNotification('Slot Joker pieni!');
        G.consumables.push({...item});
      }
      break;
      
    case 'win_blind':
      G.score = G.target;
      showNotification('🌍 The World: Vittoria immediata!');
      setTimeout(()=>winRound(),500);
      break;
      
    case 'copy_joker':
      if (G.jokers.length>0 && G.jokers.length<5) {
        const toCopy = G.jokers[Math.floor(Math.random()*G.jokers.length)];
        G.jokers.push({...toCopy, id:toCopy.id+'_copy_'+Date.now()});
        showNotification(`🃏 Copiato: ${toCopy.name}!`);
      } else if (G.jokers.length>=5) {
        showNotification('Slot Joker pieni!');
        G.consumables.push({...item});
      } else {
        showNotification('Nessun Joker da copiare!');
        G.consumables.push({...item});
      }
      break;
  }
}

function showNotification(msg) {
  const notif = document.createElement('div');
  notif.className = 'notification';
  notif.textContent = msg;
  document.body.appendChild(notif);
  setTimeout(()=>{
    notif.classList.add('show');
    setTimeout(()=>{
      notif.classList.remove('show');
      setTimeout(()=>notif.remove(),300);
    },2000);
  },10);
}

// ──────────────────────────────────────────
//  SHOP
// ──────────────────────────────────────────
function winRound() {
  const hBonus=G.handsLeft;
  const interest=Math.min(5,Math.floor(G.money/5));
  const earned=3+hBonus+interest;
  G.money+=earned;
  G.reward=`+$${earned}  ·  base $3 + $${hBonus} mani + $${interest} interessi`;
  G.blind++;
  if (G.blind>2){G.blind=0;G.ante++;G.round++}
  if (G.ante>8){G.phase='win';render();return}
  G.phase='shop';
  generateBossEffect();
  genShop();
  render();
}

function genShop() {
  const owned=new Set(G.jokers.map(j=>j.id));
  
  // 2 Joker casuali
  const jokers = shuffle(JOKER_POOL.filter(j=>!owned.has(j.id))).slice(0,2);
  
  // 1 Planet casuale + 1 Tarot casuale
  const planets = shuffle(PLANET_CARDS.map(p=>({...p,type:'Planet'}))).slice(0,1);
  const tarots = shuffle(TAROT_CARDS.map(t=>({...t,type:'Tarot'}))).slice(0,1);
  
  G.shopItems = [...jokers, ...planets, ...tarots];
  G.shopRerolls = 2;
}

function buyShopItem(id) {
  const item=G.shopItems.find(j=>j.id===id);
  if (!item||G.money<item.cost) return;
  
  if (item.type==='Tarot'||item.type==='Planet') {
    if (G.consumables.length>=3) {
      showNotification('Slot consumabili pieni (max 3)!');
      return;
    }
    G.money-=item.cost;
    G.consumables.push({...item});
    showNotification(`Acquistato: ${item.name}!`);
  } else {
    if (G.jokers.length>=5) {
      showNotification('Slot Joker pieni (max 5)!');
      return;
    }
    G.money-=item.cost;
    G.jokers.push({...item});
    showNotification(`Acquistato: ${item.name}!`);
  }
  G.shopItems=G.shopItems.filter(j=>j.id!==id);
  render();
}

function rerollShop() {
  if (G.shopRerolls<=0||G.money<2) return;
  G.money -= 2;
  G.shopRerolls--;
  genShop();
  showNotification('🎲 Negozio rerollato!');
  render();
}

function leaveShop(){
  G.reward='';
  G.phase='blind_select';
  render();
}

// ──────────────────────────────────────────
//  UTILITY
// ──────────────────────────────────────────
function toggleRules(){
  const o=document.getElementById('overlay');
  o.style.display=o.style.display==='none'?'flex':'none';
}
function closeOverlay(e){
  if(e.target===document.getElementById('overlay'))
    document.getElementById('overlay').style.display='none';
}

// ──────────────────────────────────────────
//  RENDER
// ──────────────────────────────────────────
function render() {
  const app=document.getElementById('app');
  const map={blind_select:rBlindSelect,playing:rPlaying,shop:rShop,game_over:rGameOver,win:rWin};
  app.innerHTML=(map[G.phase]||rBlindSelect)();
  
  document.querySelectorAll('.card[data-id]').forEach(el=>{
    el.addEventListener('click',()=>toggleCard(+el.dataset.id));
  });
  
  document.querySelectorAll('.consumable-slot').forEach((el,i)=>{
    el.addEventListener('click',()=>useConsumable(i));
  });
}

function cardHTML(c,sel=false) {
  const red=(c.suit==='♥'||c.suit==='♦');
  const enhClass = c.enhancement ? ` enh-${c.enhancement}` : '';
  const editionClass = c.edition ? ` edition-${c.edition}` : '';
  const animClass = c.justDrawn ? ' card-just-drawn' : '';
  return `<div class="card${sel?' sel':''} ${red?'cr':'cb'}${enhClass}${editionClass}${animClass}" data-id="${c.id}" title="${c.enhancement||'Normale'} ${c.edition||''}">
    <div class="cc tl">${c.value}<br>${c.suit}</div>
    <div class="cen">${c.enhancement==='wild'?'★':c.suit}</div>
    <div class="cc br">${c.value}<br>${c.suit}</div>
    ${c.enhancement?`<div class="enh-badge">${c.enhancement[0].toUpperCase()}</div>`:''}
    ${c.edition?`<div class="edition-badge">✦</div>`:''}
  </div>`;
}

function rBlindSelect() {
  const tgs=BLIND_TARGETS[Math.min(G.ante-1,BLIND_TARGETS.length-1)];
  return `<div class="screen">
    <div class="game-logo">🃏 BALATRO</div>
    <div class="ante-label">ANTE ${G.ante} / 8 · ROUND ${G.round}</div>
    ${G.bossEffect&&G.blind===2?`<div class="boss-warning">⚠ ${G.bossEffect.name}: ${G.bossEffect.desc}</div>`:''}
    <div class="blinds-grid">
      ${BLIND_NAMES.map((n,i)=>`
        <div class="blind-tile${i===G.blind?' active':''}${i<G.blind?' done':''}">
          <div class="blind-tile-name">${n}${i===2?' 👑':''}</div>
          <div class="blind-tile-target">${(i===2&&G.bossEffect?.mod?G.bossEffect.mod(tgs[i]):tgs[i]).toLocaleString('it-IT')}</div>
          ${i===G.blind?'<div class="blind-badge">▶ ATTUALE</div>':''}
          ${i<G.blind?'<div class="blind-badge done">✓ FATTO</div>':''}
        </div>`).join('')}
    </div>
    ${G.jokers.length?`
      <div class="sec-title">Joker (${G.jokers.length}/5)</div>
      <div class="jokers-owned">
        ${G.jokers.map(j=>`<div class="joker-card${j.edition?' edition-'+j.edition:''}">
          <div class="joker-card-name">${j.name} ${j.edition?'✦':''}</div>
          <div class="joker-card-desc">${j.desc}</div>
          <div class="joker-type">${j.type||''}</div>
        </div>`).join('')}
      </div>`:''}
    ${G.consumables.length?`
      <div class="sec-title">Consumabili (${G.consumables.length}/3)</div>
      <div class="consumables-bar">
        ${G.consumables.map((c,i)=>`<div class="consumable-chip consumable-slot" data-index="${i}" title="${c.desc}">
          ${c.name} · ${c.type}
        </div>`).join('')}
      </div>`:''}
    <div class="money-big">💰 $${G.money}</div>
    <button class="btn btn-gold" onclick="startRound()">▶ Inizia ${BLIND_NAMES[G.blind]}</button>
  </div>`;
}

function rPlaying() {
  const selCards=G.hand.filter(c=>G.selected.has(c.id));
  const pct=Math.min(100,(G.score/G.target)*100);
  let center='';
  if (G.scoring) {
    center=`<div class="scoring-box">
      <div class="sc-name">${G.scoring.hn} ${G.planetLevels[G.scoring.hn]>1?`(Lv.${G.planetLevels[G.scoring.hn]})`:''}</div>
      <div class="sc-calc">
        <span class="chips-n">${G.scoring.ch}</span>
        <span> × </span><span class="mult-n">${G.scoring.m}</span>
        ${G.scoring.xMult>1?`<span> × </span><span class="xmult-n">${G.scoring.xMult.toFixed(1)}x</span>`:''}
        <span> = </span><span class="total-n">+${G.scoring.total.toLocaleString('it-IT')}</span>
      </div></div>`;
  } else if (selCards.length) {
    const p=calcScore(selCards);
    center=`<div class="preview-box">
      <div class="pv-name">${p.hn} ${G.planetLevels[p.hn]>1?`(Lv.${G.planetLevels[p.hn]})`:''}</div>
      <div class="pv-calc">
        <span class="chips-n">${p.ch}</span> × <span class="mult-n">${p.m}</span>
        ${p.xMult>1?`× ${p.xMult.toFixed(1)}x`:''}
        = ${p.total.toLocaleString('it-IT')}
      </div></div>`;
  } else {
    center=`<div class="hint-text">Seleziona fino a 5 carte</div>`;
  }
  
  return `<div class="screen" style="gap:10px">
    <div class="top-bar">
      <div class="score-section">
        <div class="score-label">Punteggio</div>
        <div class="score-val">${G.score.toLocaleString('it-IT')}</div>
        <div class="score-target">/ ${G.target.toLocaleString('it-IT')}</div>
        <div class="prog-wrap"><div class="prog-fill" style="width:${pct}%"></div></div>
      </div>
      <div class="center-info">${center}</div>
      <div class="stats-section">
        <div class="stat-row"><span class="stat-label">Mani</span><span class="stat-num">${G.handsLeft}</span></div>
        <div class="stat-row"><span class="stat-label">Scarti</span><span class="stat-num">${G.discardsLeft}</span></div>
        <div class="stat-row"><span class="stat-label">Soldi</span><span class="stat-num" style="color:var(--moneyco)">$${G.money}</span></div>
        ${G.tempChips>0||G.tempMult>0?`
        <div class="stat-row">
          <span class="stat-label">Bonus</span>
          <span class="stat-num" style="font-size:12px;color:#ff0">
            ${G.tempChips>0?`+${G.tempChips}ch`:''}${G.tempChips>0&&G.tempMult>0?' ':''}${G.tempMult>0?`+${G.tempMult}mult`:''}
          </span>
        </div>`:''}
      </div>
    </div>
    
    ${G.consumables.length?`
    <div class="consumables-bar">
      ${G.consumables.map((c,i)=>`<div class="consumable-chip consumable-slot" data-index="${i}" title="${c.desc}">
        ${c.type==='Planet'?'🪐':'🃏'} ${c.name}
      </div>`).join('')}
    </div>`:''}
    
    <div class="jokers-bar">
      ${G.jokers.length
        ? G.jokers.map(j=>`<div class="joker-chip${j.edition?' edition-'+j.edition:''}" title="${j.desc}">${j.name}</div>`).join('')
        : `<span style="color:var(--textd);font-style:italic;font-size:13px">Nessun Joker</span>`}
    </div>
    
    <div style="display:flex;gap:8px;align-items:center">
      <button class="btn btn-outline" onclick="sortHand()" style="font-size:11px;padding:4px 8px" title="Ordina carte">
        ⇅ Ordina (${G.sortMode==='none'?'No':G.sortMode==='rank'?'Rank':'Seme'})
      </button>
      <span style="color:var(--textd);font-size:10px">${G.bossEffect?`⚠ ${G.bossEffect.name}`:''}</span>
    </div>
    
    <div class="hand-area">
      ${G.hand.map(c=>cardHTML(c,G.selected.has(c.id))).join('')}
    </div>
    <div class="actions-bar">
      <button class="btn btn-red" onclick="discardCards()"
        ${G.discardsLeft<=0||G.selected.size===0||G.busy?'disabled':''}>
        🗑 Scarta (${G.discardsLeft})
      </button>
      <button class="btn btn-gold" onclick="playHand()"
        ${G.handsLeft<=0||G.selected.size===0||G.busy?'disabled':''}>
        ▶ Gioca (${G.handsLeft})
      </button>
    </div>
  </div>`;
}

function rShop() {
  return `<div class="screen">
    <div class="shop-title">🏪 NEGOZIO</div>
    <div class="shop-sub">Ante ${G.ante} · Prossimo: ${BLIND_NAMES[G.blind]}${G.bossEffect?` (${G.bossEffect.name})`:''}</div>
    ${G.reward?`<div class="reward-banner">${G.reward}</div>`:''}
    <div class="money-big">💰 $${G.money}</div>
    
    <div class="sec-title">Joker (${G.jokers.length}/5)</div>
    <div class="jokers-owned">
      ${G.jokers.length
        ? G.jokers.map(j=>`<div class="joker-card${j.edition?' edition-'+j.edition:''}">
            <div class="joker-card-name">${j.name} ${j.edition?'✦':''}</div>
            <div class="joker-card-desc">${j.desc}</div>
            <div class="joker-type">${j.type||''}</div>
          </div>`).join('')
        : `<div class="empty-msg">Nessun Joker</div>`}
    </div>
    
    ${G.consumables.length?`
    <div class="sec-title">Consumabili (${G.consumables.length}/3)</div>
    <div class="consumables-bar">
      ${G.consumables.map(c=>`<div class="consumable-chip">${c.type==='Planet'?'🪐':'🃏'} ${c.name}</div>`).join('')}
    </div>`:''}
    
    <div class="divider"></div>
    <div class="sec-title">In vendita (Reroll: ${G.shopRerolls} · $2)</div>
    <div class="shop-row">
      ${G.shopItems.length
        ? G.shopItems.map(j=>`<div class="shop-item">
            <div class="shop-item-name">${j.type==='Planet'?'🪐':j.type==='Tarot'?'🃏':''} ${j.name}</div>
            <div class="shop-item-desc">${j.desc}</div>
            <div class="shop-item-type">${j.type||''}</div>
            <div class="shop-item-price">$${j.cost}</div>
            <button class="btn btn-gold" onclick="buyShopItem('${j.id}')"
              ${G.money<j.cost||(j.apply&&G.jokers.length>=5)||((j.type==='Tarot'||j.type==='Planet')&&G.consumables.length>=3)?'disabled':''}>
              Compra
            </button>
          </div>`).join('')
        : `<div class="empty-msg">Negozio vuoto</div>`}
    </div>
    <div style="display:flex;gap:10px">
      <button class="btn btn-outline" onclick="rerollShop()" ${G.shopRerolls<=0||G.money<2?'disabled':''}>🎲 Reroll ($2)</button>
      <button class="btn btn-gold" onclick="leaveShop()">Continua →</button>
    </div>
  </div>`;
}

function rGameOver() {
  return `<div class="screen end-screen">
    <div class="end-title lose">☠ GAME OVER</div>
    <div class="end-sub">Non hai raggiunto il punteggio</div>
    <div class="end-stats">
      <div>Ante ${G.ante} · ${BLIND_NAMES[G.blind]}</div>
      <div>${G.score.toLocaleString('it-IT')} / ${G.target.toLocaleString('it-IT')}</div>
      <div>Joker: ${G.jokers.length} · Soldi: $${G.money}</div>
    </div>
    <button class="btn btn-gold" onclick="newGame()">🔄 Nuova Partita</button>
  </div>`;
}

function rWin() {
  return `<div class="screen end-screen">
    <div class="end-title win">🏆 HAI VINTO!</div>
    <div class="end-sub">Tutti gli 8 Ante completati!</div>
    <button class="btn btn-gold" onclick="newGame()">🔄 Gioca Ancora</button>
  </div>`;
}

// ──────────────────────────────────────────
//  START
// ──────────────────────────────────────────
newGame();
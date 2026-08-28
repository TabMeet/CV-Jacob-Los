/* ============================================================
   WARHAMMER 40,000: WAR OF SIGNAL LOST — game data & templates
   ============================================================ */

const CLASSES = [
  {
    id: "astartes",
    name: "Astartes Battle-Brother",
    tagline: "A genetically-forged warrior of the Adeptus Astartes.",
    description: "Superhuman, fearless, and clad in ancient power armour. Where the Battle-Brother stands, the line holds.",
    stats: { ws: 16, bs: 14, t: 16, wp: 12, int: 10 },
    wounds: 24,
    gear: "Boltgun, combat knife, Mk-X power armour"
  },
  {
    id: "guardsman",
    name: "Cadian Shock Trooper",
    tagline: "A disciplined soldier of the Astra Militarum.",
    description: "Trained from childhood for war, the Cadian trusts their lasgun, their sergeant, and the Emperor — in that order.",
    stats: { ws: 11, bs: 14, t: 12, wp: 11, int: 11 },
    wounds: 14,
    gear: "Lasgun, flak armour, entrenching tool"
  },
  {
    id: "acolyte",
    name: "Inquisitorial Acolyte",
    tagline: "A servant of the Ordo Hereticus, hunter of hidden foes.",
    description: "Sworn to root out heresy, mutation, and the touch of the warp, wherever it hides.",
    stats: { ws: 11, bs: 12, t: 10, wp: 15, int: 14 },
    wounds: 12,
    gear: "Inquisitorial rosette, bolt pistol, dataslate"
  },
  {
    id: "skitarius",
    name: "Skitarii Ranger",
    tagline: "An augmented warrior-priest of the Adeptus Mechanicus.",
    description: "Flesh made subordinate to the Machine God, wired for war and worship in equal measure.",
    stats: { ws: 12, bs: 15, t: 13, wp: 11, int: 15 },
    wounds: 15,
    gear: "Galvanic rifle, omnispex, radiation cloak"
  },
  {
    id: "sororitas",
    name: "Sister of Battle",
    tagline: "A warrior-zealot of the Adepta Sororitas.",
    description: "Faith given a bolter. The Sister's conviction is a weapon no daemon can parry.",
    stats: { ws: 14, bs: 14, t: 12, wp: 16, int: 10 },
    wounds: 16,
    gear: "Boltgun, combat blade, blessed power armour"
  },
  {
    id: "roguetrader",
    name: "Rogue Trader",
    tagline: "A charter-bound explorer at the edge of the Imperium.",
    description: "Licensed by ancient Warrant to trade, explore, and conquer beyond the Astronomican's light.",
    stats: { ws: 12, bs: 13, t: 11, wp: 13, int: 13 },
    wounds: 14,
    gear: "Archeotech pistol, void suit, signet of office"
  }
];

const HOMEWORLDS = [
  { id: "hive", name: "Hive World", desc: "Raised in the stacked, choking megacities of a Hive World — you learned to read a crowd and a knife alike.", bonusStat: "int" },
  { id: "forge", name: "Forge World", desc: "Born under the forge-glow of a Mechanicus world, steeped in litanies of maintenance since birth.", bonusStat: "bs" },
  { id: "death", name: "Death World", desc: "Every day on your homeworld tried to kill you. Most days, you won.", bonusStat: "t" },
  { id: "shrine", name: "Shrine World", desc: "Raised among relics and pilgrims, your faith was forged before your body was.", bonusStat: "wp" },
  { id: "feral", name: "Feral World", desc: "You learned to fight with blade and spear long before you ever saw a lasgun.", bonusStat: "ws" }
];

const PLANETS = [
  "Cadia Secundus", "Vraks Minor", "Gilgamesh IX", "Nighthaven",
  "Scintilla's Shadow", "Baraddun Hive", "Kalidar Reach", "Meridian's Fall",
  "Thracian Primaris", "Voss's End", "Karnak Delta", "Iron Sanctum",
  "Ophelia Tertius", "Dathrax", "Solar Watch Station", "Hyrkan Landing",
  "Perdition's Rest", "Ashvane Reach"
];

const MISSION_TYPES = [
  {
    id: "purge",
    name: "Purge the Infestation",
    objective: "the spawning tunnels beneath the hive",
    threat: "a spreading Tyranid genestealer brood",
    intro: (p) => `Vox-traffic from ${p} has gone to static. Servitor drones report tunnels choked with chitin and the stink of alien pheromones — a genestealer brood is spreading beneath the hive, and someone must burn it out before it surfaces.`
  },
  {
    id: "relic",
    name: "Recover the Relic",
    objective: "the buried archeotech vault",
    threat: "rival scavengers and skittering guardian constructs",
    intro: (p) => `Auger scans of ${p} have located a pre-Imperial vault, sealed for ten thousand years. Rival scavenger crews are already inbound, and ancient guardian constructs are said to still patrol its halls.`
  },
  {
    id: "defend",
    name: "Defend the Outpost",
    objective: "the outpost's void shield generator",
    threat: "a howling Ork Waaagh!",
    intro: (p) => `A green tide has fallen upon ${p}. An Ork Waaagh! rolls toward the last Imperial outpost, and its void shield generator is the only thing standing between the garrison and annihilation.`
  },
  {
    id: "heretic",
    name: "Hunt the Heretic",
    objective: "the heretek cell's hidden shrine",
    threat: "cultists steeped in warp-taint",
    intro: (p) => `Whispers from ${p} speak of a heretek cell operating in the undercroft, their shrine thick with warp-taint and the mutter of forbidden litanies. The Inquisition wants it found — and ended.`
  },
  {
    id: "contact",
    name: "First Contact",
    objective: "a fragile truce with the Aeldari envoys",
    threat: "old blood-debts and deep suspicion",
    intro: (p) => `Aeldari envoys have made contact near ${p}, offering intelligence in exchange for parley. Old blood-debts run deep on both sides, and one wrong word could end the truce — or the mission.`
  },
  {
    id: "warp",
    name: "Warp Anomaly",
    objective: "the fracturing warp rift",
    threat: "daemonic incursions bleeding through",
    intro: (p) => `Astropaths across the sector have woken screaming. A warp rift is fracturing reality itself over ${p}, and daemonic incursions are already bleeding through into realspace.`
  },
  {
    id: "convoy",
    name: "Escort the Convoy",
    objective: "the convoy's safe passage",
    threat: "Dark Eldar raiders in the void",
    intro: (p) => `A supply convoy bound for ${p} has requested escort through a stretch of void notorious for Dark Eldar raiders, who strike from the webway without warning and vanish just as fast.`
  },
  {
    id: "uprising",
    name: "Quell the Uprising",
    objective: "the rebel governor's stronghold",
    threat: "a PDF mutiny armed with stolen weapons",
    intro: (p) => `The planetary governor of ${p} has declared independence from the Imperium. Half the Planetary Defense Force has mutinied with him, and they are armed, entrenched, and desperate.`
  }
];

const APPROACHES = {
  assault: {
    letter: "A",
    label: "Direct Assault",
    icon: "⚔",
    statKey: "combat",
    prompt: "Lead the charge and meet the threat head-on."
  },
  cunning: {
    letter: "B",
    label: "Investigate & Outmaneuver",
    icon: "🔍",
    statKey: "int",
    prompt: "Search for a weakness before committing to a fight."
  },
  faith: {
    letter: "C",
    label: "Stand on Faith & Resolve",
    icon: "✠",
    statKey: "wp",
    prompt: "Trust in the Emperor and steady the line."
  }
};

const OUTCOME_FRAGMENTS = {
  assault: {
    critSuccess: (n, t, o) => `${n} cuts through ${t} with terrifying, almost inhuman precision, securing ${o} without a single misstep. Even hardened veterans stop to watch.`,
    success: (n, t, o) => `${n} fights through ${t}, taking hard knocks but claiming ${o} through sheer aggression and steel.`,
    fail: (n, t, o) => `${n}'s assault falters against ${t}. ${o} slips from reach, and the squad pulls back bleeding.`,
    critFail: (n, t, o) => `${n} is overwhelmed by ${t} — a catastrophic breakdown of the assault that very nearly ends everything right here.`
  },
  cunning: {
    critSuccess: (n, t, o) => `${n} reads the battlefield like scripture, finding the one flaw in ${t} and turning it to claim ${o} with barely a shot fired.`,
    success: (n, t, o) => `${n} outmaneuvers ${t} just enough, using terrain and timing to secure ${o} at an acceptable cost.`,
    fail: (n, t, o) => `${n} misjudges ${t}'s movements. The plan unravels, and ${o} is lost to confusion and bad timing.`,
    critFail: (n, t, o) => `${n} walks straight into a trap laid by ${t} — every clever angle collapses at once.`
  },
  faith: {
    critSuccess: (n, t, o) => `${n}'s faith burns like a beacon against ${t}. It is as if the Emperor Himself steadies the aim, and ${o} is secured in His name.`,
    success: (n, t, o) => `${n} holds the line against ${t}, prayers steadying trembling hands long enough to secure ${o}.`,
    fail: (n, t, o) => `${n}'s resolve wavers before ${t}. Doubt creeps in at the worst moment, and ${o} slips away.`,
    critFail: (n, t, o) => `${n}'s faith cracks entirely before ${t} — and in the silence that follows, something colder rushes in to fill it.`
  }
};

const REST_LINES = [
  "Aboard ship, the medicae servitors work through the night. Wounds are stitched, armour reforged, and the litanies of the Machine God murmured over failing plasma coils.",
  "In the chapel-hold, a chaplain leads a hushed recitation of the Imperial Creed. It does not heal flesh, but it steadies something deeper.",
  "The crew shares recycled rations and stranger stories from further out in the void. For a moment, the war feels far away.",
  "Servo-skulls drift through the corridors, cataloguing damage. Repairs are slow, but the ship — and its crew — holds together."
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rollD20() {
  return 1 + Math.floor(Math.random() * 20);
}

function statModifier(value) {
  return Math.floor((value - 10) / 2);
}

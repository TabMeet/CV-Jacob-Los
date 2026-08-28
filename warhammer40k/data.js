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
    gear: "Boltgun, combat knife, Mk-X power armour",
    icon: "🛡️"
  },
  {
    id: "guardsman",
    name: "Cadian Shock Trooper",
    tagline: "A disciplined soldier of the Astra Militarum.",
    description: "Trained from childhood for war, the Cadian trusts their lasgun, their sergeant, and the Emperor — in that order.",
    stats: { ws: 11, bs: 14, t: 12, wp: 11, int: 11 },
    wounds: 14,
    gear: "Lasgun, flak armour, entrenching tool",
    icon: "🪖"
  },
  {
    id: "acolyte",
    name: "Inquisitorial Acolyte",
    tagline: "A servant of the Ordo Hereticus, hunter of hidden foes.",
    description: "Sworn to root out heresy, mutation, and the touch of the warp, wherever it hides.",
    stats: { ws: 11, bs: 12, t: 10, wp: 15, int: 14 },
    wounds: 12,
    gear: "Inquisitorial rosette, bolt pistol, dataslate",
    icon: "🗡️"
  },
  {
    id: "skitarius",
    name: "Skitarii Ranger",
    tagline: "An augmented warrior-priest of the Adeptus Mechanicus.",
    description: "Flesh made subordinate to the Machine God, wired for war and worship in equal measure.",
    stats: { ws: 12, bs: 15, t: 13, wp: 11, int: 15 },
    wounds: 15,
    gear: "Galvanic rifle, omnispex, radiation cloak",
    icon: "⚙️"
  },
  {
    id: "sororitas",
    name: "Sister of Battle",
    tagline: "A warrior-zealot of the Adepta Sororitas.",
    description: "Faith given a bolter. The Sister's conviction is a weapon no daemon can parry.",
    stats: { ws: 14, bs: 14, t: 12, wp: 16, int: 10 },
    wounds: 16,
    gear: "Boltgun, combat blade, blessed power armour",
    icon: "⚜️"
  },
  {
    id: "roguetrader",
    name: "Rogue Trader",
    tagline: "A charter-bound explorer at the edge of the Imperium.",
    description: "Licensed by ancient Warrant to trade, explore, and conquer beyond the Astronomican's light.",
    stats: { ws: 12, bs: 13, t: 11, wp: 13, int: 13 },
    wounds: 14,
    gear: "Archeotech pistol, void suit, signet of office",
    icon: "🧭"
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

/* Each mission unfolds over three beats: an approach, a complication, and a
   climax. Every beat carries its own situation text and three options
   written for that exact moment, so no two beats in a mission read like
   generic "attack / think / pray" prompts — the option under "assault",
   "cunning" or "faith" still maps to the same underlying stat, but what it
   asks the player to actually do changes with the scene. */
const MISSION_TYPES = [
  {
    id: "purge",
    name: "Purge the Infestation",
    objective: "the spawning tunnels beneath the hive",
    threat: "a spreading Tyranid genestealer brood",
    intro: (p) => `Vox-traffic from ${p} has gone to static. Servitor drones report tunnels choked with chitin and the stink of alien pheromones — a genestealer brood is spreading beneath the hive, and someone must burn it out before it surfaces.`,
    beats: [
      {
        narration: () => `The tunnel mouth exhales a wet, chitinous stench. Motion trackers flicker erratically in the dark ahead.`,
        objective: "a foothold in the tunnel mouth",
        threat: "the first skittering broodlings",
        options: {
          assault: { label: "Push in immediately, weapons ready — better to meet them on your terms." },
          cunning: { label: "Send a servo-skull ahead to scout the tunnel before committing." },
          faith: { label: "Anoint your blade and steady your breathing before the descent." }
        }
      },
      {
        narration: () => `Deeper in, the walls themselves seem to pulse. Something large paces you just out of auspex range, and the tunnel forks three ways.`,
        objective: "the safest fork forward",
        threat: "an unseen shape pacing you in the dark",
        options: {
          assault: { label: "Force the choice — charge down the widest tunnel before it chooses for you." },
          cunning: { label: "Read the claw-marks and bio-residue to pick the fork it favours least." },
          faith: { label: "Trust the Emperor's light will not lead you wrong, and choose without hesitation." }
        }
      },
      {
        narration: () => `The tunnel opens into a cavern lined with pulsing egg-sacs. At its heart, something vast uncoils.`,
        options: {
          assault: { label: "Storm the nest and burn every sac before it hatches." },
          cunning: { label: "Target the broodlord directly — cut off the swarm at its source." },
          faith: { label: "Stand your ground and let faith steel the killing blow." }
        }
      }
    ]
  },
  {
    id: "relic",
    name: "Recover the Relic",
    objective: "the buried archeotech vault",
    threat: "rival scavengers and skittering guardian constructs",
    intro: (p) => `Auger scans of ${p} have located a pre-Imperial vault, sealed for ten thousand years. Rival scavenger crews are already inbound, and ancient guardian constructs are said to still patrol its halls.`,
    beats: [
      {
        narration: () => `The vault door is inscribed with pre-Imperial glyphs, faintly warm to the touch. Rival scavenger chatter crackles over a stolen vox-channel nearby.`,
        objective: "safe passage past the outer wards",
        threat: "old defence wards and prowling rivals",
        options: {
          assault: { label: "Force the outer seal open before the scavengers arrive." },
          cunning: { label: "Trace the glyph-pattern for a hidden, ward-free entry." },
          faith: { label: "Recite the rites of unsealing taught to acolytes of your order." }
        }
      },
      {
        narration: () => `Inside, corridors of dead machinery hum faintly back to life. A guardian construct's optics flare red in the gloom, and the scavengers' voices grow closer.`,
        objective: "a path past the waking guardian",
        threat: "a stirring guardian construct",
        options: {
          assault: { label: "Disable the construct by force before it fully wakes." },
          cunning: { label: "Feed it a false command-code to walk it off your path." },
          faith: { label: "Walk past it calmly — machine-spirits sense fear more than footsteps." }
        }
      },
      {
        narration: () => `The vault's heart lies open, the relic resting on a plinth of dead light, just as the scavengers burst in from the far door.`,
        options: {
          assault: { label: "Grab the relic and cut down anyone who reaches for it first." },
          cunning: { label: "Swap the relic for a decoy and slip out before they notice." },
          faith: { label: "Claim it in the Emperor's name and dare them to defy His will." }
        }
      }
    ]
  },
  {
    id: "defend",
    name: "Defend the Outpost",
    objective: "the outpost's void shield generator",
    threat: "a howling Ork Waaagh!",
    intro: (p) => `A green tide has fallen upon ${p}. An Ork Waaagh! rolls toward the last Imperial outpost, and its void shield generator is the only thing standing between the garrison and annihilation.`,
    beats: [
      {
        narration: () => `Green shapes crest the ridge in their hundreds, banners of scrap and bone held high. The garrison's lasguns are already firing, too late to matter yet.`,
        objective: "the first defensive line",
        threat: "the leading edge of the Waaagh!",
        options: {
          assault: { label: "Take the wall yourself and hold the line by example." },
          cunning: { label: "Redirect the garrison's fire to the weakest point in the advance." },
          faith: { label: "Rally the defenders with a vow that the line will not break." }
        }
      },
      {
        narration: () => `The void shield flickers under sustained bombardment. A warboss bellows orders somewhere in the horde, and a breach opens in the outer perimeter.`,
        objective: "the breach in the perimeter",
        threat: "Orks pouring through the gap",
        options: {
          assault: { label: "Plug the breach personally, blade and bolt against the tide." },
          cunning: { label: "Collapse the breach behind them, trapping the vanguard inside the walls." },
          faith: { label: "Hold the breach with prayer and grit until reinforcements arrive." }
        }
      },
      {
        narration: () => `The generator room shudders under impact after impact. If it falls, so does everyone behind these walls.`,
        options: {
          assault: { label: "Meet the warboss head-on at the generator door." },
          cunning: { label: "Overload the shield in a last, calculated pulse to scatter the horde." },
          faith: { label: "Stand between the generator and the horde, and do not move." }
        }
      }
    ]
  },
  {
    id: "heretic",
    name: "Hunt the Heretic",
    objective: "the heretek cell's hidden shrine",
    threat: "cultists steeped in warp-taint",
    intro: (p) => `Whispers from ${p} speak of a heretek cell operating in the undercroft, their shrine thick with warp-taint and the mutter of forbidden litanies. The Inquisition wants it found — and ended.`,
    beats: [
      {
        narration: () => `The undercroft reeks of counterfeit incense and cold ozone. Faint chanting echoes from somewhere below, wrong in a way that itches behind the eyes.`,
        objective: "the entrance to the undercroft",
        threat: "wards and watchers loyal to the cult",
        options: {
          assault: { label: "Kick in the nearest door before the watchers can raise the alarm." },
          cunning: { label: "Follow the chanting at a careful distance to map the cult's numbers." },
          faith: { label: "Ward yourself with rites of purity before descending further." }
        }
      },
      {
        narration: () => `A cultist watch-post lies ahead, its members murmuring over a cogitator wired with something that should not still be moving.`,
        objective: "the watch-post and its secrets",
        threat: "armed cultists guarding stolen tech",
        options: {
          assault: { label: "Cut the watch-post down before they can warn the shrine." },
          cunning: { label: "Interrogate one quietly to learn the shrine's true defences." },
          faith: { label: "Judge them where they kneel — heresy answered with the Emperor's law." }
        }
      },
      {
        narration: () => `The shrine itself is a wound in reality — wiring fused with flesh, prayers running backward. The cult's leader turns, unsurprised, to greet you.`,
        options: {
          assault: { label: "End it the only way heresy understands — with fire and steel." },
          cunning: { label: "Sever the shrine's power first; a blind cult is a dead cult." },
          faith: { label: "Denounce them in the Emperor's name before you strike." }
        }
      }
    ]
  },
  {
    id: "contact",
    name: "First Contact",
    objective: "a fragile truce with the Aeldari envoys",
    threat: "old blood-debts and deep suspicion",
    intro: (p) => `Aeldari envoys have made contact near ${p}, offering intelligence in exchange for parley. Old blood-debts run deep on both sides, and one wrong word could end the truce — or the mission.`,
    beats: [
      {
        narration: () => `The Aeldari envoy waits at the agreed clearing, alone, unarmed, and utterly still. Your escort shifts uneasily behind you.`,
        objective: "an opening in the negotiation",
        threat: "centuries of mutual distrust",
        options: {
          assault: { label: "Make your strength clear before a word is exchanged." },
          cunning: { label: "Open with the old accords, testing what the envoy still honours." },
          faith: { label: "Speak plainly and trust that honesty needs no translation." }
        }
      },
      {
        narration: () => `The envoy names a price for their intelligence — one your superiors would never sanction. Their kin watch from the treeline, patient as knives.`,
        objective: "a workable counter-offer",
        threat: "a price too steep to pay, and eyes in the trees",
        options: {
          assault: { label: "Refuse outright and dare them to escalate." },
          cunning: { label: "Offer a counter-trade that costs you nothing you'll miss." },
          faith: { label: "Appeal to whatever honour still binds them to the old truce." }
        }
      },
      {
        narration: () => `The moment balances on a blade's edge — one wrong word, gesture, or silence, and the treeline will empty in an instant.`,
        options: {
          assault: { label: "Stand your ground and let your resolve speak for the Imperium." },
          cunning: { label: "Offer the one concession that costs little and means everything to them." },
          faith: { label: "Give your word as bond, and mean it absolutely." }
        }
      }
    ]
  },
  {
    id: "warp",
    name: "Warp Anomaly",
    objective: "the fracturing warp rift",
    threat: "daemonic incursions bleeding through",
    intro: (p) => `Astropaths across the sector have woken screaming. A warp rift is fracturing reality itself over ${p}, and daemonic incursions are already bleeding through into realspace.`,
    beats: [
      {
        narration: () => `Reality bends visibly around the rift, colours running where they shouldn't. Your instruments have stopped making sense.`,
        objective: "steady footing near the rift's edge",
        threat: "the rift's disorienting pull",
        options: {
          assault: { label: "Push forward before the rift widens further." },
          cunning: { label: "Read the warp-flux patterns to find where it's weakest." },
          faith: { label: "Anchor yourself in prayer against the rift's whispering pull." }
        }
      },
      {
        narration: () => `Shapes begin to coalesce from the tear — not yet solid, but watching, hungry, patient.`,
        objective: "a moment before the daemons fully manifest",
        threat: "half-formed daemonic shapes",
        options: {
          assault: { label: "Strike the shapes before they finish taking form." },
          cunning: { label: "Exploit the instant of their formation, when they're weakest." },
          faith: { label: "Hold the line with will alone, denying them purchase." }
        }
      },
      {
        narration: () => `The rift tears fully open. Whatever comes through next will not be turned back by half-measures.`,
        options: {
          assault: { label: "Meet the incursion head-on and give it no ground." },
          cunning: { label: "Collapse the rift at its unstable core before more come through." },
          faith: { label: "Banish it with will and word, as the old rites teach." }
        }
      }
    ]
  },
  {
    id: "convoy",
    name: "Escort the Convoy",
    objective: "the convoy's safe passage",
    threat: "Dark Eldar raiders in the void",
    intro: (p) => `A supply convoy bound for ${p} has requested escort through a stretch of void notorious for Dark Eldar raiders, who strike from the webway without warning and vanish just as fast.`,
    beats: [
      {
        narration: () => `The convoy's engines drone on through empty void. Then the sensor board lights up — webway signatures, closing fast.`,
        objective: "the convoy's exposed flank",
        threat: "the first wave of raiders",
        options: {
          assault: { label: "Move your escort to intercept before they reach the convoy." },
          cunning: { label: "Feed the convoy a false course to buy time to prepare." },
          faith: { label: "Steady the convoy crews — panic will kill them faster than raiders." }
        }
      },
      {
        narration: () => `Raider skimmers weave between the convoy's hulls, faster than anything with a right to be. A boarding pod locks onto the lead freighter.`,
        objective: "the boarded freighter",
        threat: "raiders already inside the hull",
        options: {
          assault: { label: "Board the freighter yourself and clear it corridor by corridor." },
          cunning: { label: "Vent the boarded section to space before they spread further." },
          faith: { label: "Lead a defence at the airlock and hold until it's over." }
        }
      },
      {
        narration: () => `The raiders' flagship decloaks ahead of the convoy's only route to safety — this is the moment that decides everything.`,
        options: {
          assault: { label: "Charge the flagship's flank and break their nerve." },
          cunning: { label: "Bait them into a crossfire between the convoy's escorts." },
          faith: { label: "Hold formation and trust the convoy to survive what you buy them." }
        }
      }
    ]
  },
  {
    id: "uprising",
    name: "Quell the Uprising",
    objective: "the rebel governor's stronghold",
    threat: "a PDF mutiny armed with stolen weapons",
    intro: (p) => `The planetary governor of ${p} has declared independence from the Imperium. Half the Planetary Defense Force has mutinied with him, and they are armed, entrenched, and desperate.`,
    beats: [
      {
        narration: () => `The stronghold gates are barred, mutinous PDF troopers watching from the ramparts. A voice over the vox demands you turn back.`,
        objective: "a way past the gate",
        threat: "mutineers on the ramparts",
        options: {
          assault: { label: "Answer the demand with force and take the gate." },
          cunning: { label: "Find the old maintenance tunnel the garrison forgot to seal." },
          faith: { label: "Call out to the loyalists among them — not all mutinies are willing." }
        }
      },
      {
        narration: () => `Inside, PDF loyalties fracture in real time — some troopers lower their weapons, others dig in around the governor's chambers.`,
        objective: "the wavering loyalists",
        threat: "a garrison split against itself",
        options: {
          assault: { label: "Push through the loyal ranks toward the governor's chambers." },
          cunning: { label: "Turn the wavering troopers before they commit to either side." },
          faith: { label: "Remind them all, loudly, whose oath they swore first." }
        }
      },
      {
        narration: () => `The governor makes his last stand in the chamber ahead, stolen weapons and true believers at his back.`,
        options: {
          assault: { label: "End the mutiny where it started — at the governor's door." },
          cunning: { label: "Cut the chamber's power and take them in the dark." },
          faith: { label: "Offer the governor one chance to surrender in the Emperor's name." }
        }
      }
    ]
  }
];

const CONTINUITY_GOOD = [
  "Momentum is with you. ",
  "That went better than expected. ",
  "So far, so good. "
];
const CONTINUITY_BAD = [
  "The last stumble still stings, but there's no time to dwell on it. ",
  "Shaken, you press on regardless. ",
  "That cost you something, but you press on. "
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

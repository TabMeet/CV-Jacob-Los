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
    icon: "🛡️",
    favoredMissions: ["purge", "defend"]
  },
  {
    id: "guardsman",
    name: "Cadian Shock Trooper",
    tagline: "A disciplined soldier of the Astra Militarum.",
    description: "Trained from childhood for war, the Cadian trusts their lasgun, their sergeant, and the Emperor — in that order.",
    stats: { ws: 11, bs: 14, t: 12, wp: 11, int: 11 },
    wounds: 14,
    gear: "Lasgun, flak armour, entrenching tool",
    icon: "🪖",
    favoredMissions: ["defend", "uprising"]
  },
  {
    id: "acolyte",
    name: "Inquisitorial Acolyte",
    tagline: "A servant of the Ordo Hereticus, hunter of hidden foes.",
    description: "Sworn to root out heresy, mutation, and the touch of the warp, wherever it hides.",
    stats: { ws: 11, bs: 12, t: 10, wp: 15, int: 14 },
    wounds: 12,
    gear: "Inquisitorial rosette, bolt pistol, dataslate",
    icon: "🗡️",
    favoredMissions: ["heretic", "dispute"]
  },
  {
    id: "skitarius",
    name: "Skitarii Ranger",
    tagline: "An augmented warrior-priest of the Adeptus Mechanicus.",
    description: "Flesh made subordinate to the Machine God, wired for war and worship in equal measure.",
    stats: { ws: 12, bs: 15, t: 13, wp: 11, int: 15 },
    wounds: 15,
    gear: "Galvanic rifle, omnispex, radiation cloak",
    icon: "⚙️",
    favoredMissions: ["relic", "chart"]
  },
  {
    id: "sororitas",
    name: "Sister of Battle",
    tagline: "A warrior-zealot of the Adepta Sororitas.",
    description: "Faith given a bolter. The Sister's conviction is a weapon no daemon can parry.",
    stats: { ws: 14, bs: 14, t: 12, wp: 16, int: 10 },
    wounds: 16,
    gear: "Boltgun, combat blade, blessed power armour",
    icon: "⚜️",
    favoredMissions: ["heretic", "confession"]
  },
  {
    id: "roguetrader",
    name: "Rogue Trader",
    tagline: "A charter-bound explorer at the edge of the Imperium.",
    description: "Licensed by ancient Warrant to trade, explore, and conquer beyond the Astronomican's light.",
    stats: { ws: 12, bs: 13, t: 11, wp: 13, int: 13 },
    wounds: 14,
    gear: "Archeotech pistol, void suit, signet of office",
    icon: "🧭",
    favoredMissions: ["contact", "chart"]
  },
  {
    id: "enginseer",
    name: "Tech-Priest Enginseer",
    tagline: "A priest-engineer of the Cult Mechanicus.",
    description: "Part flesh, part machine, wholly devoted to the Omnissiah. Where others see broken wreckage, the Enginseer sees a prayer half-finished.",
    stats: { ws: 9, bs: 11, t: 11, wp: 12, int: 17 },
    wounds: 12,
    gear: "Servo-arm, plasma cutter, cognis signum",
    icon: "🔧",
    favoredMissions: ["relic", "chart"]
  },
  {
    id: "navigator",
    name: "Imperial Navigator",
    tagline: "A mutant-blooded pilot of House Navis.",
    description: "A third eye, warp-sighted, lets you steer a ship through the immaterium. On the ground, that same sight sees threats others miss entirely.",
    stats: { ws: 8, bs: 9, t: 10, wp: 15, int: 14 },
    wounds: 10,
    gear: "Navigator's third eye, void charts, ornate cane",
    icon: "👁️",
    favoredMissions: ["chart", "contact"]
  },
  {
    id: "astropath",
    name: "Astropath Transcendent",
    tagline: "A blinded psyker of the Adeptus Astra Telepathica.",
    description: "Sight was the price of the Emperor's gift. What remains is a mind that can touch minds across the void — and things far worse than minds.",
    stats: { ws: 8, bs: 8, t: 9, wp: 17, int: 13 },
    wounds: 9,
    gear: "Psychic hood, sanctioning collar, warding rod",
    icon: "🔮",
    favoredMissions: ["warp", "commune"]
  },
  {
    id: "confessor",
    name: "Ministorum Confessor",
    tagline: "A fire-and-brimstone priest of the Ecclesiarchy.",
    description: "Part chaplain, part executioner. The Confessor's sermons have started riots and ended them, sometimes in the same breath.",
    stats: { ws: 12, bs: 10, t: 11, wp: 16, int: 10 },
    wounds: 13,
    gear: "Eviscerator, vestments of office, prayer icons",
    icon: "📿",
    favoredMissions: ["confession", "heretic"]
  },
  {
    id: "assassin",
    name: "Officio Assassin",
    tagline: "A conditioned killer of the Officio Assassinorum.",
    description: "Trained since childhood to remove a single target and vanish. Conversation is not the Assassin's preferred tool, but it isn't off the table.",
    stats: { ws: 15, bs: 16, t: 10, wp: 13, int: 12 },
    wounds: 11,
    gear: "Monofilament garrote, needle pistol, chameleoline cloak",
    icon: "🥷",
    favoredMissions: ["heretic", "convoy"]
  },
  {
    id: "ratling",
    name: "Ratling Sharpshooter",
    tagline: "A diminutive marksman of Imperial Guard renown.",
    description: "Small, quiet, and unnervingly good at not being where you shot. What the Ratling lacks in size, a long-las more than makes up for.",
    stats: { ws: 9, bs: 16, t: 9, wp: 10, int: 11 },
    wounds: 10,
    gear: "Long-las, camo cloak, lucky charm",
    icon: "🎯",
    favoredMissions: ["convoy", "purge"]
  },
  {
    id: "ogryn",
    name: "Ogryn Bodyguard",
    tagline: "A gene-bred abhuman of enormous strength.",
    description: "Simple, loyal, and built like a demolition charge. The Ogryn doesn't overthink a fight — mostly because overthinking isn't really an option.",
    stats: { ws: 14, bs: 9, t: 18, wp: 9, int: 6 },
    wounds: 22,
    gear: "Ripper gun, slab shield, sheer brute strength",
    icon: "👊",
    favoredMissions: ["defend", "purge"]
  },
  {
    id: "commissar",
    name: "Commissar",
    tagline: "A political officer of the Astra Militarum.",
    description: "Equal parts inspiration and threat. The Commissar's word can rally a routing company — or end a coward's war on the spot.",
    stats: { ws: 13, bs: 13, t: 11, wp: 14, int: 12 },
    wounds: 14,
    gear: "Bolt pistol, power sabre, storm coat",
    icon: "🎖️",
    favoredMissions: ["uprising", "council"]
  },
  {
    id: "hospitaller",
    name: "Adepta Sororitas Hospitaller",
    tagline: "A battlefield medic of the Order of the Sacred Rose.",
    description: "Faith and field surgery in equal measure. The Hospitaller has pulled more soldiers back from the brink than any chirurgeon in the sector.",
    stats: { ws: 11, bs: 11, t: 11, wp: 15, int: 13 },
    wounds: 13,
    gear: "Blessed medicae kit, sacred chirurgeon's blade",
    icon: "➕",
    favoredMissions: ["triage", "confession"]
  },
  {
    id: "arbite",
    name: "Adeptus Arbites Enforcer",
    tagline: "A precinct officer of Imperial law.",
    description: "Judge, and occasionally jury, on worlds where the Administratum's writ is the only law that matters. The Enforcer has seen every excuse in the book.",
    stats: { ws: 13, bs: 13, t: 13, wp: 11, int: 11 },
    wounds: 14,
    gear: "Combat shotgun, shock maul, riot shield",
    icon: "⚖️",
    favoredMissions: ["dispute", "uprising"]
  }
];

const HOMEWORLDS = [
  { id: "hive", name: "Hive World", desc: "Raised in the stacked, choking megacities of a Hive World — you learned to read a crowd and a knife alike.", bonusStat: "int" },
  { id: "forge", name: "Forge World", desc: "Born under the forge-glow of a Mechanicus world, steeped in litanies of maintenance since birth.", bonusStat: "bs" },
  { id: "death", name: "Death World", desc: "Every day on your homeworld tried to kill you. Most days, you won.", bonusStat: "t" },
  { id: "shrine", name: "Shrine World", desc: "Raised among relics and pilgrims, your faith was forged before your body was.", bonusStat: "wp" },
  { id: "feral", name: "Feral World", desc: "You learned to fight with blade and spear long before you ever saw a lasgun.", bonusStat: "ws" },
  { id: "voidborn", name: "Void Born", desc: "Born and raised between the stars aboard a voidship, gravity and horizons were never things you could take for granted.", bonusStat: "bs" },
  { id: "agri", name: "Agri World", desc: "Endless grain-fields and toil under an open sky taught you patience, and the strength that comes from a lifetime of hard labour.", bonusStat: "t" },
  { id: "mining", name: "Mining World", desc: "Raised beneath the surface in the dark of the mineshafts, you learned to fight in tunnels too cramped for hesitation.", bonusStat: "ws" },
  { id: "fortress", name: "Fortress World", desc: "Grown up behind void shields and gun emplacements, drilled for siege before you could properly hold a lasgun.", bonusStat: "bs" },
  { id: "penal", name: "Penal World", desc: "A childhood spent among the condemned taught you to survive punishment that would break most people outright.", bonusStat: "wp" },
  { id: "schola", name: "Schola Progenium", desc: "Raised as a ward of the Adeptus Terra, drilled in doctrine and discipline from the day you could walk.", bonusStat: "wp" },
  { id: "frontier", name: "Frontier World", desc: "Life on the edge of Imperial space meant making do with what little the Administratum bothered to send.", bonusStat: "int" }
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
  },

  /* ---- Non-combat, intellect/roleplay-driven missions. tone:"social"
     picks the gentler outcome fragments below (no blades, no bleeding),
     and each opens on a noRoll dialogue beat with no dice at all. */
  {
    id: "confession",
    name: "Hear the Confession",
    tone: "social",
    objective: "a just verdict",
    threat: "a confession built on half-truths",
    intro: (p) => `A dying penitent on ${p} has asked for last rites — and for someone to hear what he really has to confess before the end.`,
    beats: [
      {
        noRoll: true,
        narration: () => `A penitent kneels in the confession-box, hands shaking. He says he only wants to speak the truth before he dies. You are not sure you believe him yet.`,
        options: {
          assault: { label: "Demand he stop stalling and confess plainly.", response: "He flinches, and the words come faster — though whether from honesty or fear, it's hard to say." },
          cunning: { label: "Let the silence sit; guilty men often fill it themselves.", response: "He can't bear the quiet. Within moments, details start slipping out that no rehearsed story would include." },
          faith: { label: "Offer him the Emperor's mercy before judgment, not after.", response: "Something in him softens. He starts speaking not to save himself, but because he finally wants to." }
        }
      },
      {
        narration: () => `His story doesn't quite hang together — a date wrong here, a name too convenient there. Somewhere in this confession is the one thread that unravels the rest.`,
        objective: "the one true thread in his story",
        threat: "a confession built half on truth, half on self-preservation",
        dcMod: { cunning: -2 },
        options: {
          assault: { label: "Press him hard on the detail that troubles you most." },
          cunning: { label: "Cross-reference his account against what you already know." },
          faith: { label: "Ask him to swear the account before the Emperor's icon." }
        }
      },
      {
        narration: () => `The truth, when it finally surfaces, is worse than the crime he confessed to — and now you have to decide what judgment actually serves the Emperor here.`,
        options: {
          assault: { label: "Pronounce sentence yourself, swift and final." },
          cunning: { label: "Refer the case upward with the evidence you've assembled." },
          faith: { label: "Grant the absolution he's begging for, and trust the Emperor to judge the rest." }
        }
      }
    ]
  },
  {
    id: "dispute",
    name: "Adjudicate the Dispute",
    tone: "social",
    objective: "a resolution both sides can live with",
    threat: "two factions convinced only violence will settle it",
    intro: (p) => `A dispute among the colonists of ${p} has escalated to the edge of open violence, and the local authority has asked for outside judgment.`,
    beats: [
      {
        noRoll: true,
        narration: () => `Two colonist factions stand on opposite sides of the meeting hall, each certain the other started it. Nobody in the room seems to remember how it actually began.`,
        options: {
          assault: { label: "Silence the room and lay down the terms of order.", response: "The shouting stops, but the resentment doesn't — you've bought quiet, not agreement." },
          cunning: { label: "Ask each side to state their claim, and listen for what they leave out.", response: "Both sides tell a story with a convenient gap in it — and the gaps don't match." },
          faith: { label: "Remind them both whose Imperium they're tearing apart to argue in.", response: "A few heads bow. It doesn't end the dispute, but it takes some heat out of the room." }
        }
      },
      {
        narration: () => `Somewhere between the two accounts is what actually happened, and it matters — whoever you believe first will think this is already decided.`,
        objective: "the version of events that actually holds up",
        threat: "two accounts that can't both be true",
        dcMod: { cunning: -2 },
        options: {
          assault: { label: "Confront the side you suspect is lying, directly." },
          cunning: { label: "Find the one detail only an honest witness would know." },
          faith: { label: "Appeal to whichever side still has something to lose by lying." }
        }
      },
      {
        narration: () => `Both factions want your verdict now, and whatever you decide, someone in this room is going to call it unjust.`,
        options: {
          assault: { label: "Impose a ruling and make clear it isn't up for debate." },
          cunning: { label: "Split the judgment so neither side can claim total victory." },
          faith: { label: "Ask both sides to accept the verdict as the Emperor's will, not yours." }
        }
      }
    ]
  },
  {
    id: "chart",
    name: "Chart the Unknown",
    tone: "social",
    objective: "a viable route through the anomaly",
    threat: "a region of space that doesn't match any chart",
    intro: (p) => `The routes near ${p} have shifted in ways no chart accounts for. Someone needs to work out what's safe to fly through — and what isn't.`,
    beats: [
      {
        noRoll: true,
        narration: () => `The auger readings ahead don't match any chart in the ship's archive. Something out here has reshaped the void itself, and the crew is waiting on you to say which way is safe.`,
        options: {
          assault: { label: "Push the ship forward on instinct and correct course as you go.", response: "Bold, and the crew respects it — though you're all flying blind for now." },
          cunning: { label: "Cross-reference the anomaly against old Rogue Trader logs first.", response: "Half a footnote in a three-hundred-year-old logbook turns out to matter more than you expected." },
          faith: { label: "Trust the Navigator's third eye over the instruments.", response: "The instruments disagree with what the eye sees. You choose to believe the eye." }
        }
      },
      {
        narration: () => `The safe route, if there is one, is hiding in the pattern of the anomaly itself — assuming it has a pattern at all.`,
        objective: "the pattern in the anomaly",
        threat: "a stretch of void that resists every instrument",
        dcMod: { cunning: -2 },
        options: {
          assault: { label: "Commit to a heading and adjust as new readings come in." },
          cunning: { label: "Chart the anomaly's edges before risking the center." },
          faith: { label: "Hold course and trust the ship's own wards to see you through." }
        }
      },
      {
        narration: () => `The anomaly opens ahead into something the charts have no name for — and the ship only gets one attempt at threading it.`,
        options: {
          assault: { label: "Take the ship through at full burn before it closes." },
          cunning: { label: "Thread the narrowest, most calculated path through it." },
          faith: { label: "Commit the crossing to the Navigator's third eye, fully." }
        }
      }
    ]
  },
  {
    id: "commune",
    name: "Commune with the Choir",
    tone: "social",
    objective: "a coherent message from the warp",
    threat: "a psychic signal fractured across a thousand screaming voices",
    intro: (p) => `The Astropathic choir near ${p} has been shrieking the same fragmented warning for three days straight. Someone has to make sense of it before it drives the choir mad.`,
    beats: [
      {
        noRoll: true,
        narration: () => `You open your mind to the Astropathic choir, and for a moment there is only noise — a thousand half-formed voices screaming the same warning in a thousand different words.`,
        options: {
          assault: { label: "Push through the noise toward the strongest signal.", response: "It's louder, but not necessarily clearer — strength and truth aren't the same thing in the warp." },
          cunning: { label: "Listen for the phrase that repeats, buried under the noise.", response: "One fragment recurs, faint but exact, underneath all the rest." },
          faith: { label: "Anchor yourself in prayer before you listen further.", response: "The prayer doesn't quiet the choir, but it quiets you enough to keep listening." }
        }
      },
      {
        narration: () => `Somewhere in the noise is a single coherent sentence. Everything else is the warp's own static, dressed up to sound like meaning.`,
        objective: "the one true sentence in the signal",
        threat: "a warp-choir that wants to be heard, truthfully or not",
        dcMod: { cunning: -2 },
        options: {
          assault: { label: "Force the connection open wider, whatever the cost." },
          cunning: { label: "Isolate the recurring fragment and follow it back to its source." },
          faith: { label: "Let the Emperor's light filter what reaches you." }
        }
      },
      {
        narration: () => `The message resolves at last — and it is either the most important warning you'll ever carry, or something wearing its shape to get inside your mind.`,
        options: {
          assault: { label: "Seize the message whole and worry about its truth later." },
          cunning: { label: "Test it against everything you already know before trusting it." },
          faith: { label: "Judge it by whether it could have come from anywhere but the Emperor's light." }
        }
      }
    ]
  },
  {
    id: "council",
    name: "Council of War",
    tone: "social",
    objective: "a plan the command staff will actually follow",
    threat: "officers more interested in rank than in winning",
    intro: (p) => `The command staff stationed near ${p} can't agree on a plan, and the window to act is closing fast.`,
    beats: [
      {
        noRoll: true,
        narration: () => `The command staff are already arguing before you've even sat down — three competing plans, three commanders convinced theirs is the only sane one.`,
        options: {
          assault: { label: "Cut the arguing short and demand they focus.", response: "It works, for about a minute, before the argument finds a new angle to restart from." },
          cunning: { label: "Let them argue a little longer and note who contradicts themselves.", response: "One commander's plan changes shape twice in five minutes — worth remembering." },
          faith: { label: "Remind them the enemy isn't waiting for this meeting to end.", response: "That lands. The room quiets enough to actually think." }
        }
      },
      {
        narration: () => `Each plan has a flaw nobody's said out loud yet — and whichever one you back is the one this battle will be fought with.`,
        objective: "the plan without a fatal flaw",
        threat: "three plans, each half-right and half-blind",
        dcMod: { cunning: -2 },
        options: {
          assault: { label: "Back the boldest plan and commit fully." },
          cunning: { label: "Pick apart each plan's assumptions before choosing." },
          faith: { label: "Back whichever commander you trust most to adapt when it goes wrong." }
        }
      },
      {
        narration: () => `The council wants your final word. Whatever you decide becomes the battle plan the instant you say it out loud.`,
        options: {
          assault: { label: "Commit to the aggressive plan and own the consequences." },
          cunning: { label: "Present the synthesis you've quietly built from all three." },
          faith: { label: "Trust your officers' judgment over your own, and back their consensus." }
        }
      }
    ]
  },
  {
    id: "triage",
    name: "Tend to the Wounded",
    tone: "social",
    objective: "as many lives saved as the night allows",
    threat: "more wounded than hands to treat them",
    intro: (p) => `Casualties are mounting faster than the aid stations near ${p} can handle. Every choice made in the next hour will decide who makes it through the night.`,
    beats: [
      {
        noRoll: true,
        narration: () => `The aid station is overwhelmed before the fighting has even properly started. More wounded arrive every minute than you have hands to treat.`,
        options: {
          assault: { label: "Start working immediately and triage as you go.", response: "No time to plan — you're already elbow-deep in the first case." },
          cunning: { label: "Take thirty seconds to sort the wounded by who can be saved.", response: "Thirty seconds feels like an eternity, but it buys clarity for everything after." },
          faith: { label: "Say a quiet rite over the station before the work begins.", response: "It costs you nothing but a breath, and the medicae orderlies visibly steady." }
        }
      },
      {
        narration: () => `Two patients, one set of hands free. The choice of who you treat first will matter more than either of them knows.`,
        objective: "the choice that saves the most, not just the loudest",
        threat: "two urgent cases and one pair of hands",
        dcMod: { cunning: -2 },
        options: {
          assault: { label: "Go with your gut and treat whoever looks worse." },
          cunning: { label: "Check vitals properly before deciding who needs you first." },
          faith: { label: "Ask which of them still has people waiting on them." }
        }
      },
      {
        narration: () => `The worst case of the night is laid in front of you, and there's no clean answer left — only the one you can live with.`,
        options: {
          assault: { label: "Commit fully to the emergency procedure, risk and all." },
          cunning: { label: "Buy time with a stabilizing measure while you assess properly." },
          faith: { label: "Do everything you can and leave the rest in the Emperor's hands." }
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

/* Used for tone:"social" missions — the same three approaches, but worded
   for a courtroom, a sickbay, a war council or a confession booth rather
   than a firefight. Nobody bleeds in these; the stakes are trust, truth,
   and judgment instead. */
const OUTCOME_FRAGMENTS_SOCIAL = {
  assault: {
    critSuccess: (n, t, o) => `${n} presses the issue head-on, and it lands with startling force. Whatever ${t} expected, it wasn't this much conviction — and ${o} falls into place.`,
    success: (n, t, o) => `${n} pushes hard on the issue. It's blunt, but against ${t} it's enough to make real headway toward ${o}.`,
    fail: (n, t, o) => `${n}'s direct approach meets real resistance. ${t} doesn't budge, and ${o} slips further out of reach.`,
    critFail: (n, t, o) => `${n} pushes too hard, too fast. ${t} hardens instantly, and whatever ground was left is gone.`
  },
  cunning: {
    critSuccess: (n, t, o) => `${n} reads the situation like an open book, spotting exactly what ${t} was hoping would go unnoticed, and turns it straight toward ${o}.`,
    success: (n, t, o) => `${n} thinks it through carefully. Against ${t}, that's enough to nudge things toward ${o}.`,
    fail: (n, t, o) => `${n} misreads something important about ${t}. The reasoning doesn't hold, and ${o} slips away.`,
    critFail: (n, t, o) => `${n}'s read on ${t} turns out to be badly wrong, and the misstep costs more than expected.`
  },
  faith: {
    critSuccess: (n, t, o) => `${n}'s conviction burns clear and steady against ${t}. It's as if the Emperor Himself is watching, and ${o} is secured in His name.`,
    success: (n, t, o) => `${n} holds firm against ${t}, faith steadying resolve long enough to secure ${o}.`,
    fail: (n, t, o) => `${n}'s resolve wavers before ${t}. Doubt creeps in at the worst moment, and ${o} slips away.`,
    critFail: (n, t, o) => `${n}'s faith cracks entirely before ${t} — and in the silence that follows, something colder moves in to fill it.`
  }
};

/* Slow, low-stakes character beats used every few missions between the
   real encounters — no dice, no combat, just texture and roleplay. */
const DOWNTIME_TEMPLATES = [
  {
    narration: (c) => `In a quiet moment between duties, ${c.name} finds a scrap of parchment and a stub of a stylus. Writing home was never part of the oath, but the urge doesn't care about that.`,
    options: {
      assault: { label: "Write plainly about the fighting — they should know what this costs.", response: "The words come out harder than intended. You fold the letter anyway and tuck it away." },
      cunning: { label: "Write around the truth, sparing them the worst of it.", response: "It isn't quite honest, but it isn't quite a lie either. Some mercies are like that." },
      faith: { label: "Write a prayer instead of a letter, and mean every word.", response: "It isn't addressed to anyone in particular, and somehow that makes it easier to write." }
    }
  },
  {
    narration: (c) => `The mess hall is loud with the kind of talk that fills the space where fear would otherwise sit. Someone waves ${c.name} over to a table.`,
    options: {
      assault: { label: "Trade war stories, and let yours be the loudest.", response: "It's good for morale, even if half of what you said was embellished." },
      cunning: { label: "Listen more than you talk, and learn who's actually holding up.", response: "You learn more from what people don't say than what they do." },
      faith: { label: "Lead a quiet toast to those who didn't make it this far.", response: "The table goes quiet, then someone else adds a name, and then another." }
    }
  },
  {
    narration: (c) => `There's always something that needs fixing, cleaning, or blessing before the next deployment. ${c.name} finds a corner and gets to it.`,
    options: {
      assault: { label: "Drill instead — sharper reflexes matter more than a shinier boltgun.", response: "Your muscles ache afterward in the specific way that means it was worth it." },
      cunning: { label: "Strip your gear down fully and check it piece by piece.", response: "You find a hairline flaw in the mechanism that would have failed at the worst possible moment." },
      faith: { label: "Recite the litanies of maintenance as you work.", response: "The words are as familiar as your own hands by now, and just as steadying." }
    }
  },
  {
    narration: (c) => `Alone for the first time in days, ${c.name} has a moment to sit with a question that's been circling since the last mission: was it worth it?`,
    options: {
      assault: { label: "Push the doubt down. There isn't time for it.", response: "It works, for now. These things have a way of coming back later, though." },
      cunning: { label: "Actually think it through, cost and all.", response: "You don't reach a comfortable answer, but you understand the question a lot better." },
      faith: { label: "Bring the doubt to prayer instead of burying it.", response: "It doesn't disappear, but it feels lighter carried that way." }
    }
  }
];

/* Fragments used when a player types their own action instead of picking
   A/B/C. There's no author-written line for every possible sentence, so
   these fold the player's own words back into a tiered reaction instead. */
const FREEFORM_FRAGMENTS = {
  critSuccess: (n, action, threat, objective) => `${n} tries something nobody planned for — "${action}" — and it works better than anyone could have hoped. Whatever ${threat} expected, it wasn't this, and ${objective} is suddenly within reach.`,
  success: (n, action, threat, objective) => `${n} goes off-script: "${action}." It's unorthodox, but against ${threat} it buys real ground toward ${objective}.`,
  fail: (n, action, threat, objective) => `${n} gambles on something unplanned — "${action}" — but ${threat} doesn't cooperate, and ${objective} slips further away.`,
  critFail: (n, action, threat, objective) => `${n}'s improvisation — "${action}" — backfires badly against ${threat}, and for a moment everything threatens to fall apart.`
};

const FREEFORM_ASSAULT_WORDS = ["attack", "fight", "charge", "kill", "shoot", "strike", "assault", "stab", "punch", "blast", "storm", "smash", "cut down", "gun down", "confront", "demand", "force", "threaten", "push", "shove", "grab", "seize"];
const FREEFORM_CUNNING_WORDS = ["search", "examine", "look", "investigate", "hack", "scan", "sneak", "trick", "hide", "study", "analyze", "analyse", "check", "plan", "listen", "observe", "distract", "think", "reason", "deduce", "question", "ask about", "read", "recall", "remember", "compare", "figure out"];
const FREEFORM_FAITH_WORDS = ["pray", "emperor", "faith", "bless", "chant", "rite", "worship", "litany", "hope", "trust", "vow", "comfort", "forgive", "mercy", "believe", "reassure", "console"];

/* Canned answers for meta/out-of-character questions typed into the
   "Other" box. This is a static game with no live connection to an LLM —
   there is no backend here, and wiring one up would mean shipping an API
   key to every visitor's browser, which this project won't do. Instead,
   input is scored against these topics by keyword overlap (see
   answerQuestion in app.js) and the closest match wins, so multi-part
   questions still land on the most relevant single answer. */
const FAQ_BANK = [
  { keywords: ["return", "come back", "revisit", "go back"], answer: "Once a mission plays out, the fleet moves on — you can't step back into the same encounter. But nothing is forgotten: every world you've fought on stays logged on your Star Map, with the date, the mission, and how it went, so you can always look back on it." },
  { keywords: ["save", "progress", "lose my", "quit", "continue later", "come back later"], answer: "Your campaign saves itself automatically after every choice. Use \"Save & Exit\" to leave safely, then \"Continue Campaign\" from the title screen whenever you're ready to pick up exactly where you left off." },
  { keywords: ["die", "death", "permadeath", "killed"], answer: "If your wounds run out, your story ends there — this campaign is permadeath. You'll see a final summary, and you're free to forge a new character and begin again." },
  { keywords: ["corrupt"], answer: "Corruption creeps up from failed encounters with the warp and heresy. If it ever reaches 100%, your character is lost to it entirely — a different, darker ending than dying in battle." },
  { keywords: ["dice", "d20", "roll", "modifier", "difficulty", " dc"], answer: "Every choice rolls a twenty-sided die and adds a modifier based on your character's relevant stat, then compares it to the difficulty of the moment. Higher is better; a natural 20 or natural 1 always counts as a critical success or failure. Some moments also reward the smart read — an investigative option can lower the difficulty if you're clearly reasoning your way through it." },
  { keywords: ["change my class", "change character", "different origin", "respec", "pick someone else"], answer: "Your archetype and homeworld are locked in once the campaign begins — that's who this character is. If you want to try someone else, start a new campaign from the title screen." },
  { keywords: ["star map", "which planets", "planets have i", "map show"], answer: "The Star Map (reachable from the top bar or the title screen) plots every planet you've visited, connected in the order you reached them, with the date and outcome of each mission." },
  { keywords: ["heal", "rest", "recover wound"], answer: "Your crew gets a short respite roughly every four missions — a quiet character moment, not a fight — that also mends a handful of wounds. Beyond that, wounds only recover between missions." },
  { keywords: ["renown", "reputation"], answer: "Renown only comes from succeeding at the climax of a mission — it's a record of your victories, though it doesn't currently unlock anything beyond bragging rights." },
  { keywords: ["what kind of mission", "what missions", "always a fight", "every mission", "combat every", "kind of campaign"], answer: "Not every mission is a fight. Your archetype leans the campaign toward the kind of trouble that suits them — an Astropath gets pulled into psychic mysteries, a Confessor into moral judgment calls, a Navigator into deciphering the unknown — alongside the straightforward combat missions. Purely social and investigative missions carry no combat at all." },
  { keywords: ["how many missions", "when does it end", "how long is", "does it end"], answer: "There's no fixed ending — the campaign keeps generating new missions for as long as your character survives. It ends only when you die, fall to corruption, or choose to stop." },
  { keywords: ["are you an ai", "are you a real ai", "are you real", "are you actually", "who are you", "what are you", "is this ai", "chatgpt", "gpt", "language model", "following a script", "just a script", "genuine ai", "really an ai"], answer: "There's no live AI narrating this — it's a static page with no server behind it. Questions like this one are matched against a small set of topics by keyword; anything that isn't a recognized question gets treated as an action instead." },
  { keywords: ["what should i do", "give me a hint", "help me decide", "what do you recommend", "advice"], answer: "That one's yours to make — this isn't scripted toward a right answer. Pick whichever option fits how you want to play this character, or type your own approach in the Other box." },
  { keywords: ["how do i play", "how does this work", "controls", "instructions", "how to play"], answer: "Read the story text, then pick A, B, C, or type your own approach under \"Something else...\". Most choices roll a d20 against a difficulty using your character's stats; some quieter moments don't roll at all — they're just about who your character is." },
  { keywords: ["xenos", "play as an ork", "play as chaos", "play as a tyranid", "different faction", "other side"], answer: "Every character here serves the Imperium in some capacity — there's no option to play a xenos or Chaos character. The archetypes vary in how they serve it, from a Battle-Brother to an Astropath to a Rogue Trader." },
  { keywords: ["wounds mean", "what are wounds", "hp", "health"], answer: "Wounds work like a health total — they drop on a failed check and mostly only recover during the rest interludes between missions. Hit zero and your character's story ends there." }
];
const FAQ_FALLBACK = "Some things even the Astropathic choir cannot foresee. The warp keeps its own counsel here — if you want to know for certain, the only way is to act.";

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rollD20() {
  return 1 + Math.floor(Math.random() * 20);
}

function statModifier(value) {
  return Math.floor((value - 10) / 2);
}

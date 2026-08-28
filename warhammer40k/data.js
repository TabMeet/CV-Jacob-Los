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
    intro: (p) => `Vox-traffic from ${p} has gone to static, and the last transmission out of the lower hive was less a report than a scream cut short. Servitor drones sent down after it come back with their hulls scored by claw-marks and their picters full of tunnels choked in chitin and the wet stink of alien pheromones. A genestealer brood is spreading beneath the hive, quietly, the way a fire spreads inside a wall before anyone smells smoke. Someone has to go down and burn it out before it surfaces into the crowded levels above.`,
    beats: [
      {
        narration: () => `The tunnel mouth exhales a wet, chitinous stench that catches at the back of the throat, part slaughterhouse and part something no abattoir ever produced. Rockcrete has been resurfaced from the inside, smoothed by passage into something almost organic, and the motion trackers flicker erratically in the dark ahead — not failing, exactly, just unable to settle on anything they trust. Somewhere below, the hive's usual machine-hum has gone quiet, the way a room goes quiet when something is listening.`,
        objective: "a foothold in the tunnel mouth",
        threat: "the first skittering broodlings",
        options: {
          assault: { label: "Push in immediately, weapons ready — better to meet them on your terms." },
          cunning: { label: "Send a servo-skull ahead to scout the tunnel before committing." },
          faith: { label: "Anoint your blade and steady your breathing before the descent." }
        }
      },
      {
        narration: () => `Deeper in, the walls themselves seem to pulse, a slow tidal rhythm just out of sync with a heartbeat, as if the rock has started breathing along with whatever built these tunnels. Something large paces you just out of auspex range — never quite visible, never quite gone, matching pace whenever you slow down. Ahead, the passage forks three ways, and each one smells exactly the same, which is somehow worse than if one of them smelled different.`,
        objective: "the safest fork forward",
        threat: "an unseen shape pacing you in the dark",
        options: {
          assault: { label: "Force the choice — charge down the widest tunnel before it chooses for you." },
          cunning: { label: "Read the claw-marks and bio-residue to pick the fork it favours least." },
          faith: { label: "Trust the Emperor's light will not lead you wrong, and choose without hesitation." }
        }
      },
      {
        narration: () => `The tunnel opens without warning into a cavern vast enough to swallow the sound of your own footsteps, its walls lined floor to ceiling with pulsing egg-sacs the size of a grown man, translucent skins showing the curled shapes waiting inside. The air here is warmer, wetter, thick with a chemical sweetness that makes the eyes water. At the cavern's heart, in a nest of chewed rockcrete and old bones, something vast uncoils — patient, aware, and entirely unhurried about the fact that you have just walked into its home.`,
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
    intro: (p) => `Auger scans of ${p} have located something the Adeptus Terra's own records don't account for: a pre-Imperial vault, its outer seals untouched since before the founding of the Imperium itself. Ten thousand years of dust have buried the approach, but not the readings — something inside is still drawing power, patient and undiminished. Rival scavenger crews picked up the same signal and are already inbound, and older, worse rumors say the vault's guardian constructs never fully powered down. Whatever gets found down there, it needs to be an Imperial hand that finds it first.`,
    beats: [
      {
        narration: () => `The vault door rises out of the rock like something grown rather than built, its surface a tangle of pre-Imperial glyphs that catch the torchlight strangely, throwing shadows that don't quite match the shapes casting them. The metal is faintly warm to the touch, warmer than ten thousand years of buried stone has any right to be. Somewhere nearby, distorted by rock and distance, rival scavenger chatter crackles over a stolen vox-channel — close enough to hear that they're arguing, too far to make out about what.`,
        objective: "safe passage past the outer wards",
        threat: "old defence wards and prowling rivals",
        options: {
          assault: { label: "Force the outer seal open before the scavengers arrive." },
          cunning: { label: "Trace the glyph-pattern for a hidden, ward-free entry." },
          faith: { label: "Recite the rites of unsealing taught to acolytes of your order." }
        }
      },
      {
        narration: () => `Beyond the threshold, corridors of dead machinery line both walls, their surfaces dulled by age until, one by one, they hum faintly back to life as something registers your presence and decides you're worth waking for. Deeper in, a guardian construct's optics flare red in the gloom — a slow, deliberate red, the kind that suggests thought rather than reflex. Behind you, echoing off stone that has carried sound for ten millennia, the scavengers' voices are getting closer.`,
        objective: "a path past the waking guardian",
        threat: "a stirring guardian construct",
        options: {
          assault: { label: "Disable the construct by force before it fully wakes." },
          cunning: { label: "Feed it a false command-code to walk it off your path." },
          faith: { label: "Walk past it calmly — machine-spirits sense fear more than footsteps." }
        }
      },
      {
        narration: () => `The vault's heart lies open at last, a chamber untouched by time in a way that feels less like preservation and more like waiting. The relic rests on a plinth of dead light at the room's center, humming with a presence that has nothing to do with the machinery around it. There is no time to study it properly — the scavengers burst in from the far door at exactly the wrong moment, weapons already up, faces lit by the same pale glow that's pulling at everyone in the room.`,
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
    intro: (p) => `A green tide has fallen upon ${p}, and it did not arrive quietly. Ork landers came down in their dozens across the northern approach, disgorging warbands that have been steadily eating the distance toward the last Imperial outpost ever since. The garrison commander's last vox before the relay went down was short and to the point: hold the void shield generator, or hold nothing at all. Everyone behind those walls is now betting their lives on whoever gets there first.`,
    beats: [
      {
        narration: () => `Green shapes crest the ridge in their hundreds, a ragged, roaring wall of scrap armor and crude blades, banners of bone and looted metal held high enough to catch the wind. The noise arrives before they do — a wall of sound built from engines, war-horns, and voices that seem to enjoy the screaming as much as the fighting. The garrison's lasguns are already firing, a thin stuttering line of las-fire that drops a few in the front rank without so much as slowing the rest down.`,
        objective: "the first defensive line",
        threat: "the leading edge of the Waaagh!",
        options: {
          assault: { label: "Take the wall yourself and hold the line by example." },
          cunning: { label: "Redirect the garrison's fire to the weakest point in the advance." },
          faith: { label: "Rally the defenders with a vow that the line will not break." }
        }
      },
      {
        narration: () => `The void shield flickers under sustained bombardment, its usual steady hum breaking into something ragged and uneven, like a held note starting to crack. Somewhere out in the smoke and wreckage, a warboss bellows orders in a voice built for exactly this kind of chaos, and the defenders' worst fear becomes real a moment later: a breach opens in the outer perimeter, rockcrete and razorwire blown outward in a spray of debris, and green shapes are already pouring toward the gap.`,
        objective: "the breach in the perimeter",
        threat: "Orks pouring through the gap",
        options: {
          assault: { label: "Plug the breach personally, blade and bolt against the tide." },
          cunning: { label: "Collapse the breach behind them, trapping the vanguard inside the walls." },
          faith: { label: "Hold the breach with prayer and grit until reinforcements arrive." }
        }
      },
      {
        narration: () => `The generator room shudders under impact after impact, dust sifting down from the ceiling in a slow, constant rain, every hit driving the shield's hum a half-tone lower than it was a minute before. Through the reinforced viewport, the horde is visible now as more than noise — a churning mass of green pressing against the last real obstacle between them and the outpost's soft interior. If the generator falls, so does everyone standing behind these walls, and there will be no third line to fall back to.`,
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
    intro: (p) => `Whispers from ${p} have been circulating for weeks before anyone in authority took them seriously — talk of a heretek cell operating somewhere in the undercroft beneath the administratum district, of workers who stopped showing up for shift and were never reported missing, of a smell like burnt copper drifting up through the ventilation grates at odd hours. What finally got the Inquisition's attention was a fragment of intercepted vox: a litany, recognizably a prayer in structure, running in a direction no sanctioned prayer ever runs. It wants finding. It wants ending.`,
    beats: [
      {
        narration: () => `The undercroft reeks of counterfeit incense and cold ozone, a combination that shouldn't exist together and somehow does, layered over the older, more honest smell of damp stone. Faint chanting echoes from somewhere below, the cadence almost familiar — almost a prayer you'd recognize — until the ear catches the places where it turns wrong, syllables bending in directions no sanctioned litany ever bends. The passage ahead narrows into shadow long before any doorway explains where the light went.`,
        objective: "the entrance to the undercroft",
        threat: "wards and watchers loyal to the cult",
        options: {
          assault: { label: "Kick in the nearest door before the watchers can raise the alarm." },
          cunning: { label: "Follow the chanting at a careful distance to map the cult's numbers." },
          faith: { label: "Ward yourself with rites of purity before descending further." }
        }
      },
      {
        narration: () => `A cultist watch-post occupies what was once a maintenance alcove, its members clustered around a cogitator that has been wired into something that should not still be moving — cabling threaded through what looks disturbingly like sinew, screens flickering with characters that resolve, if stared at too long, into something almost readable. Their murmured conversation isn't guard-duty small talk; it's closer to prayer, low and reverent, directed at the machine rather than at each other.`,
        objective: "the watch-post and its secrets",
        threat: "armed cultists guarding stolen tech",
        options: {
          assault: { label: "Cut the watch-post down before they can warn the shrine." },
          cunning: { label: "Interrogate one quietly to learn the shrine's true defences." },
          faith: { label: "Judge them where they kneel — heresy answered with the Emperor's law." }
        }
      },
      {
        narration: () => `The shrine itself is a wound in reality dressed up as a room — wiring fused with what was once flesh, banks of votive candles burning a color no honest flame produces, prayers stitched into the walls running backward, letter by letter, as if reality itself flinched while they were being carved. At the center of it all, the cult's leader turns to greet you with the calm, unsurprised expression of someone who has been expecting this moment for a very long time and is, in some genuinely unsettling way, relieved it has finally arrived.`,
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
    intro: (p) => `Aeldari envoys have made contact near ${p}, through channels so old and so quiet that whoever received the signal almost dismissed it as static. The offer, once decoded, was simple enough: intelligence, freely given, in exchange for a parley under the old forms. What isn't simple is the history behind it — centuries of blood spent on both sides, debts nobody has bothered to forgive and nobody has quite finished collecting. One wrong word here could end considerably more than just the mission.`,
    beats: [
      {
        narration: () => `The Aeldari envoy waits at the agreed clearing exactly as promised — alone, unarmed as far as any augur can tell, and utterly still in a way that reads less like calm and more like patience honed over a lifespan the Imperium has no real word for. The escort shifts uneasily at your back, weapons not raised but not quite lowered either, every one of them acutely aware of how many places an ambush could be hiding in a clearing this size.`,
        objective: "an opening in the negotiation",
        threat: "centuries of mutual distrust",
        options: {
          assault: { label: "Make your strength clear before a word is exchanged." },
          cunning: { label: "Open with the old accords, testing what the envoy still honours." },
          faith: { label: "Speak plainly and trust that honesty needs no translation." }
        }
      },
      {
        narration: () => `The envoy names a price for their intelligence, delivered in the same unhurried tone as everything else they've said — a price your superiors would never sanction, phrased in a way that makes refusal sound almost impolite. Somewhere beyond the clearing's edge, their kin watch from the treeline, patient as knives left waiting on a table, visible only as the occasional suggestion of movement where the light shouldn't be moving at all.`,
        objective: "a workable counter-offer",
        threat: "a price too steep to pay, and eyes in the trees",
        options: {
          assault: { label: "Refuse outright and dare them to escalate." },
          cunning: { label: "Offer a counter-trade that costs you nothing you'll miss." },
          faith: { label: "Appeal to whatever honour still binds them to the old truce." }
        }
      },
      {
        narration: () => `The moment balances on a blade's edge now, every second stretching a little longer than the last. One wrong word, one gesture read as an insult, one silence held a beat too long, and the treeline will empty in an instant — the envoy has made that much clear without ever raising their voice. Whatever gets said next will decide whether this ends as a truce or a body count.`,
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
    intro: (p) => `Astropaths across the sector have woken screaming, every one of them independently, every one of them describing the same tearing sensation at the same instant. A warp rift is fracturing reality itself somewhere over ${p}, and the readings coming out of the affected zone don't behave like readings so much as suggestions — numbers that change depending on who's looking at them. Reports of daemonic incursions bleeding through into realspace followed within the hour. Whatever is coming through that tear, it is not waiting for anyone's permission.`,
    beats: [
      {
        narration: () => `Reality bends visibly around the rift, colours running where they shouldn't — shadows falling toward the light instead of away from it, sound arriving faintly ahead of the movement that should have caused it. The instruments stopped making sense some distance back, their needles spinning through readings that mean nothing, and the closer you get, the more the eye starts doing the same thing the instruments are doing: reporting things that can't be quite right, and can't be quite wrong either.`,
        objective: "steady footing near the rift's edge",
        threat: "the rift's disorienting pull",
        options: {
          assault: { label: "Push forward before the rift widens further." },
          cunning: { label: "Read the warp-flux patterns to find where it's weakest." },
          faith: { label: "Anchor yourself in prayer against the rift's whispering pull." }
        }
      },
      {
        narration: () => `Shapes begin to coalesce from the tear itself — not yet solid, closer to a held breath given form, half-visible things that flicker in and out of a shape the mind refuses to properly hold onto. They are not yet strong enough to fully cross, but they are watching, hungry in a way that has nothing to do with food, and patient in the specific way that only things with no schedule and no mortality can afford to be.`,
        objective: "a moment before the daemons fully manifest",
        threat: "half-formed daemonic shapes",
        options: {
          assault: { label: "Strike the shapes before they finish taking form." },
          cunning: { label: "Exploit the instant of their formation, when they're weakest." },
          faith: { label: "Hold the line with will alone, denying them purchase." }
        }
      },
      {
        narration: () => `The rift tears fully open with a sound less like thunder than like something enormous exhaling, and the light on the other side is the wrong color entirely — not black, not any color with a name, just wrong. Whatever comes through next will not be turned back by half-measures, and there is no more time left to plan for it; the only choice left is what to do in the handful of seconds before it's standing in front of you.`,
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
    intro: (p) => `A supply convoy bound for ${p} has requested escort through a stretch of void with a reputation nobody on the crew manifest is happy about — a notorious hunting ground for Dark Eldar raiders, who strike from the webway without warning and vanish just as fast, leaving behind nothing but wreckage and the occasional survivor wishing they weren't. The convoy carries cargo the sector genuinely cannot afford to lose. Losing the crew would be worse.`,
    beats: [
      {
        narration: () => `The convoy's engines drone on through empty void, a low, steady hum that has, for the last several hours, been the most reassuring sound in the universe. Then, without any warning worth the name, the sensor board lights up all at once — webway signatures blooming across the display like ink dropped in water, closing fast from an angle nobody was watching closely enough.`,
        objective: "the convoy's exposed flank",
        threat: "the first wave of raiders",
        options: {
          assault: { label: "Move your escort to intercept before they reach the convoy." },
          cunning: { label: "Feed the convoy a false course to buy time to prepare." },
          faith: { label: "Steady the convoy crews — panic will kill them faster than raiders." }
        }
      },
      {
        narration: () => `Raider skimmers weave between the convoy's hulls at a speed that shouldn't be survivable, let alone controllable, flickers of blade-black metal that are gone again before a targeting lock can settle on them. A boarding pod slams into the lead freighter's flank hard enough to ring through the whole ship, and the vox crackles with the first panicked reports of raiders already loose inside the hull.`,
        objective: "the boarded freighter",
        threat: "raiders already inside the hull",
        options: {
          assault: { label: "Board the freighter yourself and clear it corridor by corridor." },
          cunning: { label: "Vent the boarded section to space before they spread further." },
          faith: { label: "Lead a defence at the airlock and hold until it's over." }
        }
      },
      {
        narration: () => `The raiders' flagship decloaks directly ahead of the convoy's only route to safety, sliding into visibility the way a blade slides out of a sheath — smooth, certain, and clearly not there by accident. There is no way around it and no time to find one. Whatever happens in the next few minutes decides whether this convoy reaches its destination or becomes a story other captains tell each other about this stretch of void.`,
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
    intro: (p) => `The planetary governor of ${p} has declared independence from the Imperium, in a broadcast that went out on every public channel simultaneously — evidently prepared well in advance, and evidently not something he expects to be talked out of. Half the Planetary Defense Force mutinied with him, taking their equipment and their armories with them, and the ones who stayed loyal describe a man who was popular enough, once, that this didn't come entirely out of nowhere. Armed, entrenched, and with nothing left to lose, the mutiny needs ending before it spreads to the rest of the sector.`,
    beats: [
      {
        narration: () => `The stronghold gates stand barred against a force that, until very recently, would have opened them without a second thought. Mutinous PDF troopers line the ramparts above, weapons trained but not yet fired, watching with the particular tension of people who have committed to something and are still, quietly, hoping it doesn't come to shooting. A voice over the vox — steady, official, clearly rehearsed — demands you turn back before this becomes something nobody can walk away from.`,
        objective: "a way past the gate",
        threat: "mutineers on the ramparts",
        options: {
          assault: { label: "Answer the demand with force and take the gate." },
          cunning: { label: "Find the old maintenance tunnel the garrison forgot to seal." },
          faith: { label: "Call out to the loyalists among them — not all mutinies are willing." }
        }
      },
      {
        narration: () => `Inside the walls, PDF loyalties are fracturing in real time, visibly and audibly, in a way no briefing prepared anyone for. Some troopers lower their weapons the moment they get a clear look at who's actually walked through the gate, faces caught somewhere between relief and shame. Others dig in harder around the governor's chambers, shouting louder to drown out the ones wavering beside them — a garrison at war with itself before it's even finished being at war with you.`,
        objective: "the wavering loyalists",
        threat: "a garrison split against itself",
        options: {
          assault: { label: "Push through the loyal ranks toward the governor's chambers." },
          cunning: { label: "Turn the wavering troopers before they commit to either side." },
          faith: { label: "Remind them all, loudly, whose oath they swore first." }
        }
      },
      {
        narration: () => `The governor makes his last stand in the chamber ahead, flanked by the small core of true believers who never wavered, all of them armed with weapons stripped from the very armories they were meant to guard. He does not look like a man expecting to win. He looks like a man who has already decided how this ends and is simply choosing, with whatever time remains, exactly how loudly.`,
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
    intro: (p) => `A dying penitent on ${p} has asked for last rites, which is ordinary enough — the Ecclesiarchy processes a hundred such requests a week without incident. What made this one different was the addendum, scrawled in a shaking hand on the request slate itself: he doesn't want absolution, not yet. He wants someone to actually hear what he has to confess before the end, and he specifically asked that it not be a member of his own household who comes to hear it.`,
    beats: [
      {
        noRoll: true,
        narration: () => `The confession-box is a cramped, airless little booth, its wood dark with age and the accumulated weight of ten thousand whispered sins that came before this one. A penitent kneels on the far side of the grille, hands visibly shaking in the candlelight, breath coming shallow. "I only want to speak the truth before the end," he says, and the words sound rehearsed in a way that makes you want to believe him less rather than more.`,
        options: {
          assault: { label: "Demand he stop stalling and confess plainly.", response: "He flinches, and the words come faster — though whether from honesty or fear, it's hard to say." },
          cunning: { label: "Let the silence sit; guilty men often fill it themselves.", response: "He can't bear the quiet. Within moments, details start slipping out that no rehearsed story would include." },
          faith: { label: "Offer him the Emperor's mercy before judgment, not after.", response: "Something in him softens. He starts speaking not to save himself, but because he finally wants to." }
        }
      },
      {
        narration: () => `His story, once it gets going, doesn't quite hang together the way a true one should — a date that's a season off, a name introduced too smoothly, a detail repeated twice in almost but not quite the same words. Somewhere woven through this confession is a single thread that, pulled correctly, unravels everything else he's said. He clearly hasn't noticed he's left it exposed.`,
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
        narration: () => `The truth, when it finally surfaces, arrives all at once and is considerably worse than the crime he originally confessed to — not one sin but a chain of them, each one a justification for the last, stretching back years further than anyone suspected. He is weeping now, openly, and the candlelight makes it impossible to tell whether it's grief or relief. Whatever judgment gets pronounced here, it has to actually mean something.`,
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
    intro: (p) => `A dispute among the colonists of ${p} has escalated well past the point where the local authority can pretend it will resolve itself. What began, by most accounts, as an argument over water rights or grazing land or some similarly mundane grievance has metastasized over months into something closer to a blood feud, complete with burned storehouses and at least one death nobody will discuss openly. The local magistrate, out of options and out of patience, has asked for outside judgment before this becomes a full uprising instead of a dispute.`,
    beats: [
      {
        noRoll: true,
        narration: () => `Two colonist factions occupy opposite sides of the meeting hall, arranged with the deliberate, wary spacing of people who have been in the same room as each other too many times recently and none of them pleasantly. Each side is absolutely certain the other one started it, and both accounts are delivered with the total conviction of people who have told this story to themselves so many times it's stopped feeling like a story. Nobody, notably, actually explains how any of this began.`,
        options: {
          assault: { label: "Silence the room and lay down the terms of order.", response: "The shouting stops, but the resentment doesn't — you've bought quiet, not agreement." },
          cunning: { label: "Ask each side to state their claim, and listen for what they leave out.", response: "Both sides tell a story with a convenient gap in it — and the gaps don't match." },
          faith: { label: "Remind them both whose Imperium they're tearing apart to argue in.", response: "A few heads bow. It doesn't end the dispute, but it takes some heat out of the room." }
        }
      },
      {
        narration: () => `Somewhere between the two accounts is what actually happened, buried under layers of grievance and self-justification thick enough that even the people telling the story may not fully remember the truth of it anymore. It matters more than either side realizes: whoever gets believed first will treat this as already decided, and act accordingly, long before any formal verdict is read out.`,
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
        narration: () => `Both factions want your verdict now, crowding closer than is entirely comfortable, and the air in the hall has the charged, brittle quality of a room where everyone is one wrong word away from something worse than shouting. Whatever gets decided here, someone in this room is going to walk out convinced it's unjust — the only real question left is whether they'll accept it anyway.`,
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
    intro: (p) => `The routes near ${p} have shifted in ways no chart accounts for, and not gradually — the last cartographic survey of this region is barely a decade old, and it might as well describe a different stretch of void entirely. Merchant convoys have started quietly rerouting around the whole sector rather than risk it, which is its own kind of warning. Someone needs to actually go out there, work out what's safe to fly through and what isn't, and bring back a chart worth trusting.`,
    beats: [
      {
        noRoll: true,
        narration: () => `The auger readings ahead don't match any chart in the ship's archive, and worse, they don't agree with each other from one sweep to the next — distances that shrink and stretch, gravitic anomalies that appear and vanish on subsequent passes. Something out here has reshaped the void itself, quietly and without explanation, and the bridge crew is watching you with the particular stillness of people who have run out of instruments to trust and are down to trusting a person instead.`,
        options: {
          assault: { label: "Push the ship forward on instinct and correct course as you go.", response: "Bold, and the crew respects it — though you're all flying blind for now." },
          cunning: { label: "Cross-reference the anomaly against old Rogue Trader logs first.", response: "Half a footnote in a three-hundred-year-old logbook turns out to matter more than you expected." },
          faith: { label: "Trust the Navigator's third eye over the instruments.", response: "The instruments disagree with what the eye sees. You choose to believe the eye." }
        }
      },
      {
        narration: () => `The safe route, if one exists at all, is hiding somewhere in the pattern of the anomaly itself — assuming the anomaly is actually patterned and not simply chaotic in a way that punishes anyone looking for meaning in it. The readings keep almost resolving into something coherent before slipping away again, like a word on the tip of the tongue that won't quite surface.`,
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
        narration: () => `The anomaly opens ahead into something the charts have no name for at all — a fold in the visible sky where the stars behind it don't line up with the stars around it, subtly wrong in a way that makes the eyes ache if you look too long. The ship gets one attempt at threading it, and the window, whatever it actually is, will not stay open for a second try.`,
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
    intro: (p) => `The Astropathic choir stationed near ${p} has been shrieking the same fragmented warning for three days straight, in a state the duty officers describe, with visible discomfort, as somewhere between a seizure and a prayer. Two junior astropaths have already been pulled from the chamber catatonic. Whatever the choir is trying to say, it wants very badly to be heard, and someone with the training to survive listening needs to go in and actually receive the message before it costs anyone else their mind.`,
    beats: [
      {
        noRoll: true,
        narration: () => `You open your mind to the Astropathic choir, and for one endless moment there is only noise — a thousand half-formed voices screaming the same warning in a thousand different words, overlapping and colliding until the noise stops sounding like language at all. It presses against the inside of the skull like something physical, insistent, desperate to be understood by anyone willing to listen long enough.`,
        options: {
          assault: { label: "Push through the noise toward the strongest signal.", response: "It's louder, but not necessarily clearer — strength and truth aren't the same thing in the warp." },
          cunning: { label: "Listen for the phrase that repeats, buried under the noise.", response: "One fragment recurs, faint but exact, underneath all the rest." },
          faith: { label: "Anchor yourself in prayer before you listen further.", response: "The prayer doesn't quiet the choir, but it quiets you enough to keep listening." }
        }
      },
      {
        narration: () => `Somewhere buried in all that noise is a single coherent sentence, whole and unbroken, and everything else is the warp's own static dressed up convincingly enough to sound like meaning. Finding it means holding perfectly still inside a storm of borrowed panic without letting any of it become your own — a discipline that gets harder, not easier, the longer this goes on.`,
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
        narration: () => `The message resolves at last, all at once, the way a held breath finally releases — and what arrives is either the single most important warning you will ever carry for the rest of your life, or something wearing the shape of a warning specifically to get past your guard and inside your mind. There is no third option, and precious little time left to decide which one it actually is.`,
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
    intro: (p) => `The command staff stationed near ${p} have been locked in the same strategy session for the better part of a day and have, by all accounts, gotten precisely nowhere. Three senior officers, three incompatible plans, and a window to actually act on any of them that is closing by the hour. Someone with enough rank or enough nerve needs to walk into that room and get a decision made before the enemy makes the decision for everyone instead.`,
    beats: [
      {
        noRoll: true,
        narration: () => `The command staff are already arguing before you've even fully sat down, voices overlapping across a strategy table cluttered with three separate sets of markers representing three separate versions of the same battlefield. Each commander is utterly convinced their plan is the only sane one on offer, and each has apparently decided that repeating it louder counts as a rebuttal to the other two.`,
        options: {
          assault: { label: "Cut the arguing short and demand they focus.", response: "It works, for about a minute, before the argument finds a new angle to restart from." },
          cunning: { label: "Let them argue a little longer and note who contradicts themselves.", response: "One commander's plan changes shape twice in five minutes — worth remembering." },
          faith: { label: "Remind them the enemy isn't waiting for this meeting to end.", response: "That lands. The room quiets enough to actually think." }
        }
      },
      {
        narration: () => `Each of the three plans has a flaw nobody has said out loud yet, buried under confident phrasing and careful omission, and whichever plan gets backed in the next few minutes is the one this entire battle will actually be fought with. There will be no time afterward to notice the flaw and fix it.`,
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
        narration: () => `The council has gone quiet at last, all three commanders turned toward you now, waiting. The strategy table's holographic markers hang motionless, three futures suspended in the same square meter of light. Whatever gets decided in the next few seconds stops being a proposal and becomes the actual battle plan the instant it's said out loud.`,
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
    intro: (p) => `Casualties are mounting faster than the aid stations near ${p} can process them, and the fighting that caused this hasn't even fully stopped yet — new wounded keep arriving on stretchers, in wheelbarrows, carried over shoulders by whoever was standing closest when they went down. Every choice made in the next hour, made calmly or made in a panic, will decide who is still breathing by morning and who isn't.`,
    beats: [
      {
        noRoll: true,
        narration: () => `The aid station is overwhelmed before the fighting has even properly finished, cots doubled up and then tripled up, the floor between them slick in places nobody has had time to clean. More wounded arrive every single minute than there are hands free to treat them, each new stretcher adding to a queue that was already too long five minutes ago.`,
        options: {
          assault: { label: "Start working immediately and triage as you go.", response: "No time to plan — you're already elbow-deep in the first case." },
          cunning: { label: "Take thirty seconds to sort the wounded by who can be saved.", response: "Thirty seconds feels like an eternity, but it buys clarity for everything after." },
          faith: { label: "Say a quiet rite over the station before the work begins.", response: "It costs you nothing but a breath, and the medicae orderlies visibly steady." }
        }
      },
      {
        narration: () => `Two patients lie side by side now, both clearly urgent, and there is exactly one set of hands free to treat either of them. Neither one is in any state to argue their own case, which somehow makes the choice heavier rather than lighter — whoever gets picked won't know how close it was, and whoever doesn't may never know at all.`,
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
        narration: () => `The worst case of the night is finally laid out on the table in front of you, past the point where any textbook procedure offers a clean answer. The orderlies have gone quiet, waiting on a call only you're positioned to make, and there is no option left here that isn't a gamble of some kind — only the version of the gamble you can live with afterward.`,
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
    critSuccess: (n, t, o) => `${n} cuts through ${t} with terrifying, almost inhuman precision, securing ${o} without a single misstep. Even hardened veterans stop what they're doing to watch, and for a long moment afterward nobody nearby says anything at all.`,
    success: (n, t, o) => `${n} fights through ${t}, taking hard knocks but claiming ${o} through sheer aggression and steel. It isn't clean, and it isn't quiet, but it holds — and right now, that's the only standard that matters.`,
    fail: (n, t, o) => `${n}'s assault falters against ${t}. ${o} slips from reach, and the squad pulls back bleeding, dragging the wounded and leaving behind more equipment than anyone wanted to.`,
    critFail: (n, t, o) => `${n} is overwhelmed by ${t} — a catastrophic breakdown of the assault that very nearly ends everything right here, and leaves everyone still standing painfully aware of how close "nearly" actually was.`
  },
  cunning: {
    critSuccess: (n, t, o) => `${n} reads the battlefield like scripture, finding the one flaw in ${t} and turning it to claim ${o} with barely a shot fired. It looks, from the outside, almost effortless — which is exactly how good tactical instinct is supposed to look.`,
    success: (n, t, o) => `${n} outmaneuvers ${t} just enough, using terrain and timing to secure ${o} at an acceptable cost. Nobody would call it elegant, but it works, and working is worth more than elegant right now.`,
    fail: (n, t, o) => `${n} misjudges ${t}'s movements. The plan unravels faster than it can be corrected, and ${o} is lost to confusion and bad timing that nobody had the leisure to plan around.`,
    critFail: (n, t, o) => `${n} walks straight into a trap laid by ${t} — every clever angle collapses at once, and what was meant to be the smart play turns out to be the one that costs the most.`
  },
  faith: {
    critSuccess: (n, t, o) => `${n}'s faith burns like a beacon against ${t}. It is as if the Emperor Himself steadies the aim, and ${o} is secured in His name — the kind of moment that gets repeated as a story for years after, growing a little in the telling each time.`,
    success: (n, t, o) => `${n} holds the line against ${t}, prayers steadying trembling hands long enough to secure ${o}. It costs something to hold that steady for that long, but it holds.`,
    fail: (n, t, o) => `${n}'s resolve wavers before ${t}. Doubt creeps in at the worst possible moment, and ${o} slips away along with whatever certainty carried this far.`,
    critFail: (n, t, o) => `${n}'s faith cracks entirely before ${t} — and in the silence that follows, something colder rushes in to fill the space it left behind.`
  }
};

/* Used for tone:"social" missions — the same three approaches, but worded
   for a courtroom, a sickbay, a war council or a confession booth rather
   than a firefight. Nobody bleeds in these; the stakes are trust, truth,
   and judgment instead. */
const OUTCOME_FRAGMENTS_SOCIAL = {
  assault: {
    critSuccess: (n, t, o) => `${n} presses the issue head-on, and it lands with startling force. Whatever ${t} expected, it wasn't this much conviction — and ${o} falls into place with a suddenness that leaves the room visibly recalibrating.`,
    success: (n, t, o) => `${n} pushes hard on the issue. It's blunt, and it costs a little goodwill along the way, but against ${t} it's enough to make real headway toward ${o}.`,
    fail: (n, t, o) => `${n}'s direct approach meets real resistance. ${t} doesn't budge an inch, and ${o} slips further out of reach, along with some of the patience everyone started this with.`,
    critFail: (n, t, o) => `${n} pushes too hard, too fast, and it shows. ${t} hardens instantly into something far less workable, and whatever ground was left to stand on is gone.`
  },
  cunning: {
    critSuccess: (n, t, o) => `${n} reads the situation like an open book, spotting exactly what ${t} was hoping would go unnoticed, and turns it straight toward ${o} before anyone else in the room has caught up.`,
    success: (n, t, o) => `${n} thinks it through carefully, weighing what's said against what's left unsaid. Against ${t}, that patience is enough to nudge things toward ${o}.`,
    fail: (n, t, o) => `${n} misreads something important about ${t} — a small thing, but the wrong small thing. The reasoning doesn't hold, and ${o} slips away before the mistake is even fully understood.`,
    critFail: (n, t, o) => `${n}'s read on ${t} turns out to be badly, embarrassingly wrong, and the misstep costs more than expected — the kind of error that gets remembered long after the specifics are forgotten.`
  },
  faith: {
    critSuccess: (n, t, o) => `${n}'s conviction burns clear and steady against ${t}. It's as if the Emperor Himself is watching, and ${o} is secured in His name — the sort of moment that quietly changes how people speak to ${n} afterward.`,
    success: (n, t, o) => `${n} holds firm against ${t}, faith steadying resolve long enough to secure ${o}. It isn't dramatic. It's just enough.`,
    fail: (n, t, o) => `${n}'s resolve wavers before ${t}. Doubt creeps in at the worst possible moment, and ${o} slips away along with the certainty that was supposed to carry this through.`,
    critFail: (n, t, o) => `${n}'s faith cracks entirely before ${t} — and in the silence that follows, something colder moves in to fill the space it left behind.`
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
  critSuccess: (n, action, threat, objective) => `${n} tries something nobody planned for — "${action}" — and it works better than anyone could have hoped. Whatever ${threat} expected, it wasn't this, and ${objective} is suddenly, almost absurdly, within reach.`,
  success: (n, action, threat, objective) => `${n} goes off-script: "${action}." It's unorthodox enough that nobody nearby quite knows how to react, but against ${threat} it buys real ground toward ${objective}.`,
  fail: (n, action, threat, objective) => `${n} gambles on something unplanned — "${action}" — but ${threat} doesn't cooperate, and ${objective} slips further away than it was before the gamble was even made.`,
  critFail: (n, action, threat, objective) => `${n}'s improvisation — "${action}" — backfires badly against ${threat}, and for a long, ugly moment everything threatens to fall apart at once.`
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
  { keywords: ["wounds mean", "what are wounds", "hp", "health"], answer: "Wounds work like a health total — they drop on a failed check and mostly only recover during the rest interludes between missions. Hit zero and your character's story ends there." },
  { keywords: ["light-year", "light year", "how far", "distance", "travel time", "how long does it take"], answer: "Every world is some distance away, measured in light-years, and the warp doesn't cross that distance at a fixed rate — the same jump can take a few days or several weeks depending on how the currents run. Time spent travelling still counts: it's what makes your character grow stronger over the campaign." },
  { keywords: ["grow stronger", "level up", "experience", "get stronger", "improve my stats", "gain a level"], answer: "There's no experience points to spend — instead, roughly every 30 Terran Standard days that pass (mostly from travel between worlds), your character improves at whatever they've leaned on most: fight hard enough and Weapon or Ballistic Skill rises, reason your way through enough problems and Intelligence rises, and so on." },
  { keywords: ["remember", "recognize", "familiar", "faced before", "done this before"], answer: "Yes — your character remembers the missions they've lived through. Facing a kind of trouble you've handled before makes the difficulty a little easier, and the story will say so." }
];
const FAQ_FALLBACK = "Some things even the Astropathic choir cannot foresee. The warp keeps its own counsel here — if you want to know for certain, the only way is to act.";

/* ============================================================
   TIME, DISTANCE & TRAVEL — the warp doesn't care about your
   schedule. Distance is in light-years; transit time in Terran
   Standard days, at a variable rate to keep every jump uncertain.
   ============================================================ */
const TRAVEL_DEPART = [
  (from) => `The <em>Emperor's Wrath</em> breaks orbit from ${from}, gellar field flaring to life as it noses toward the nearest warp threshold.`,
  (from) => `Leaving ${from} behind, the ship's Navigator retreats to the sanctum, third eye already straining against the veil ahead.`,
  (from) => `${from} falls away behind the void shields as the crew braces for translation into the immaterium.`,
  (from) => `The last tenders from ${from} are barely clear of the hull before the engines begin their long, uneasy build toward the jump.`
];
const TRAVEL_DEPART_FIRST = [
  `The <em>Emperor's Wrath</em> slips free of its berth for the first time this tour, gellar field flaring to life as it noses toward the warp threshold.`,
  `With the crew barely settled, the ship's Navigator retreats to the sanctum, third eye already straining against the veil ahead.`,
  `Orders in hand, the ship commits to the warp before half the crew has finished stowing their gear.`
];
const TRAVEL_TRANSIT = [
  (days, ly) => `The crossing spans some ${ly} light-years, and the warp is in no hurry about it — ${days} Terran Standard days pass before the Astropathic choir reports steady bearings again.`,
  (days, ly) => `${ly} light-years of hostile immaterium stand between here and the destination; ${days} days of shuddering bulkheads and half-sleep follow.`,
  (days, ly) => `It is a modest ${ly} light-year hop as these things go, but even a short leash through the warp costs ${days} days nobody gets back.`,
  (days, ly) => `${ly} light-years, and every one of the ${days} days it takes feels a little longer than the last.`
];
const TRAVEL_MICRO = [
  (c) => `${c.name} spends part of the transit reviewing the cost of the last mission, and what it bought.`,
  (c) => `Somewhere in the drifting days, ${c.name} loses count of how long they've actually been awake.`,
  (c) => `The ship's chapel sees more visitors than usual during the crossing.`,
  (c) => `Rumors move faster than the ship does; by the time realspace returns, half the crew already has a theory about where they're headed.`,
  (c) => `${c.name} sharpens a blade that doesn't need sharpening, mostly to have something to do with the waiting.`,
  (c) => `The warp presses strange half-dreams against the hull the whole crossing. Nobody sleeps especially well.`,
  (c) => `${c.name} rereads the mission dataslate more times than there's new information to justify.`
];
const TRAVEL_ARRIVE = [
  (p) => `Realspace resolves around the ship in a wash of returning starlight, and ${p} hangs ahead, waiting.`,
  (p) => `The gellar field drops. ${p} fills the forward oculus, indifferent to how long it took to get here.`,
  (p) => `Translation completes without incident — a small mercy — and ${p} comes into view.`,
  (p) => `The warp releases the ship almost gently, and ${p} is simply there, as if it had been the whole time.`
];

const GROWTH_LINES = [
  (c, stat) => `Standard weeks fold into months. ${c.name} has changed in ways only field experience teaches — ${stat} sharper than it was.`,
  (c, stat) => `Time in the Emperor's service leaves its mark. ${c.name}'s ${stat} has grown, forged by repetition nobody would call comfortable.`,
  (c, stat) => `Another month gone. ${c.name} doesn't feel any different day to day, but the dataslate's numbers say ${stat} has improved.`,
  (c, stat) => `It isn't training so much as survival, repeated often enough to leave a mark: ${c.name}'s ${stat} has risen.`
];

/* Every mission opens by naming, out loud, whether this is the kind of
   work this character's role is actually for — so a Navigator getting
   sent into a vault reads as a deliberate, acknowledged stretch of the
   assignment rather than the game silently forgetting who's playing. */
function withArticle(noun) {
  return (/^[aeiou]/i.test(noun) ? "an " : "a ") + noun;
}
const FRAMING_MATCH_LINES = [
  (c, m) => `This is exactly the kind of work ${withArticle(c.className)} exists for.`,
  (c, m) => `Whatever else this assignment turns out to be, it plays to ${c.name}'s actual training.`,
  (c, m) => `Command didn't have to think twice about who to send — ${withArticle(c.className)} was the obvious choice for this.`,
  (c, m) => `This is squarely ${c.name}'s kind of trouble.`
];
const FRAMING_MISMATCH_LINES = [
  (c, m) => `It isn't the kind of work ${withArticle(c.className)} expects, but the Imperium rarely asks twice.`,
  (c, m) => `${c.name} is not, by training, the obvious choice for this — but the roster is thin, and orders are orders.`,
  (c, m) => `This falls well outside what ${withArticle(c.className)} usually trains for. Command's justification, when pressed, was simply "you were closest."`,
  (c, m) => `${c.name} reads the orders twice, half-expecting a correction that doesn't come. This is not the usual work.`
];
function buildFramingLine(character, missionType, isFavored) {
  const bank = isFavored ? FRAMING_MATCH_LINES : FRAMING_MISMATCH_LINES;
  return pickRandom(bank)(character, missionType);
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rollD20() {
  return 1 + Math.floor(Math.random() * 20);
}

function statModifier(value) {
  return Math.floor((value - 10) / 2);
}

/* ============================================================
   WARHAMMER 40,000: WAR OF SIGNAL LOST — game engine & UI
   ============================================================ */

const SAVE_KEY = "wh40k_save_v2"; // v2: adds the calendar/travel/growth/memory systems

let state = null;          // active campaign state
let charSel = { classId: null, homeworldId: null };
let mapReturnView = "title";
let mapPlanetOrderCache = null;

const CLASS_SUBSET_SIZE = 4;
const HOMEWORLD_SUBSET_SIZE = 4;
let classSubset = [];      // ids shown by default each new campaign
let homeworldSubset = [];
let classFilter = "";
let homeworldFilter = "";

/* ---------------- calendar, distance & growth ----------------
   Distance between any two worlds is a fixed light-year figure derived
   from a hash of the pair (so it's stable across the campaign, and the
   same both directions). Travel time from that distance is NOT fixed —
   the warp is famously indifferent to schedules — so the same jump can
   take very different numbers of Terran Standard days each time. Those
   days accumulate into an in-game calendar, and enough of them passing
   is what makes a character grow stronger, independent of any single
   mission's outcome. */
const CAMPAIGN_START_YEAR = 999;
const CAMPAIGN_START_MILLENNIUM = 41;
const GROWTH_INTERVAL_DAYS = 30;

function distanceBetweenPlanets(a, b) {
  if (!a) return 4 + Math.random() * 6; // short final approach for the very first deployment
  const key = [a, b].sort().join("::");
  const h = hashStr(key);
  return 8 + (h % 4200) / 100; // 8.00 - 50.00 light-years, stable per pair
}

function travelDaysFor(distanceLy) {
  const ratePerLy = 0.35 + Math.random() * 0.35; // warp currents: never the same rate twice
  return Math.max(2, Math.round(distanceLy * ratePerLy));
}

function formatImperialDate(daysSinceStart) {
  const yearsElapsed = Math.floor(daysSinceStart / 365);
  const dayOfYear = daysSinceStart % 365;
  let year = CAMPAIGN_START_YEAR + yearsElapsed;
  let millennium = CAMPAIGN_START_MILLENNIUM;
  while (year > 999) { year -= 1000; millennium += 1; }
  const text = `${String(dayOfYear).padStart(3, "0")}.${String(year).padStart(3, "0")}.M${millennium}`;
  return { text, millennium };
}

function buildTravelNarration(fromPlanet, toPlanet, days, distanceLy, character) {
  const depart = fromPlanet ? pickRandom(TRAVEL_DEPART)(fromPlanet) : pickRandom(TRAVEL_DEPART_FIRST);
  const transit = pickRandom(TRAVEL_TRANSIT)(days, distanceLy.toFixed(1));
  const micro = pickRandom(TRAVEL_MICRO)(character);
  const arrive = pickRandom(TRAVEL_ARRIVE)(toPlanet);
  return `${depart} ${transit} ${micro} ${arrive}`;
}

function advanceCalendar(days) {
  state.daysSinceStart += days;
  const info = formatImperialDate(state.daysSinceStart);
  if (info.millennium > state.lastMillenniumSeen) {
    pushLog("narration", `<em>Somewhere in the reckoning of it all, the calendar turns. For the first time in ten thousand years, the count rolls from M${state.lastMillenniumSeen} into M${info.millennium}. Nothing about the war changes. The number does, and somehow that feels like it should mean something.</em>`);
    state.lastMillenniumSeen = info.millennium;
  }
  checkGrowth();
}

function checkGrowth() {
  while (state.daysSinceStart - state.lastGrowthDay >= GROWTH_INTERVAL_DAYS) {
    state.lastGrowthDay += GROWTH_INTERVAL_DAYS;
    applyGrowth();
  }
}

function applyGrowth() {
  const usage = state.approachUsage;
  let key = Object.keys(usage).reduce((a, b) => (usage[b] > usage[a] ? b : a), "assault");
  const s = state.character.stats;
  let statLabel;
  if (key === "assault") {
    if (s.ws <= s.bs) { s.ws += 1; statLabel = "Weapon Skill"; } else { s.bs += 1; statLabel = "Ballistic Skill"; }
  } else if (key === "cunning") {
    s.int += 1; statLabel = "Intelligence";
  } else {
    s.wp += 1; statLabel = "Willpower";
  }
  state.growthCount = (state.growthCount || 0) + 1;
  if (state.growthCount % 2 === 0) {
    state.maxWounds += 1;
    state.wounds = Math.min(state.maxWounds, state.wounds + 1);
  }
  pushLog("narration", `<em>${pickRandom(GROWTH_LINES)(state.character, statLabel)}</em>`);
  updateHud();
}

function buildRecollectionLine(missionType, memory, character) {
  const label = missionType.name.toLowerCase();
  if (memory.count === 1) {
    return `This isn't ${character.name}'s first ${label} — ${memory.lastPlanet} left lessons that haven't faded.`;
  }
  return `${character.name} has faced a ${label} more than once now. Whatever this world throws up, it won't be entirely unfamiliar.`;
}

/* ---------------- viewport height fix ----------------
   Mobile browsers and embedded webviews often disagree on what 100vh
   means (address bars, dynamic toolbars, preview chrome). Measuring the
   real height in JS and exposing it as a custom property is the reliable
   way to make the game view actually fill the visible screen. */
function setAppHeight() {
  const h = (window.visualViewport && window.visualViewport.height) || window.innerHeight;
  document.documentElement.style.setProperty("--app-height", h + "px");
}
setAppHeight();
window.addEventListener("resize", setAppHeight);
window.addEventListener("orientationchange", setAppHeight);
if (window.visualViewport) window.visualViewport.addEventListener("resize", setAppHeight);

/* ---------------- helpers ---------------- */
function qs(id) { return document.getElementById(id); }
function randInt(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) >>> 0; }
  return h;
}
function planetPos(name) {
  const h1 = hashStr(name + "::x");
  const h2 = hashStr(name + "::y");
  return { x: 10 + (h1 % 8000) / 100, y: 12 + (h2 % 7600) / 100 };
}

function showView(name) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  qs("view-" + name).classList.add("active");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function shuffleSample(arr, n) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(n, copy.length));
}

/* ---------------- save / load ---------------- */
function saveState() {
  if (state) localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}
function loadState() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (e) { return null; }
}
function deleteSave() {
  localStorage.removeItem(SAVE_KEY);
  state = null;
}

/* ---------------- title screen ---------------- */
function refreshTitleButtons() {
  const saved = loadState();
  const hasSave = !!saved;
  qs("btn-continue-campaign").classList.toggle("hidden", !hasSave || saved.ended);
  qs("btn-title-map").classList.toggle("hidden", !hasSave || saved.visitedOrder.length === 0);
  qs("btn-delete-save").classList.toggle("hidden", !hasSave);
}

qs("btn-new-campaign").addEventListener("click", () => {
  charSel = { classId: null, homeworldId: null };
  qs("input-name").value = "";
  classFilter = "";
  homeworldFilter = "";
  qs("search-class").value = "";
  qs("search-homeworld").value = "";
  classSubset = shuffleSample(CLASSES.map(c => c.id), CLASS_SUBSET_SIZE);
  homeworldSubset = shuffleSample(HOMEWORLDS.map(h => h.id), HOMEWORLD_SUBSET_SIZE);
  renderClassCards();
  renderHomeworldCards();
  qs("stat-preview").classList.add("hidden");
  validateBeginButton();
  showView("charcreate");
});

qs("btn-continue-campaign").addEventListener("click", () => {
  const saved = loadState();
  if (!saved) return;
  state = saved;
  enterGameView(true);
});

qs("btn-title-map").addEventListener("click", () => {
  const saved = loadState();
  if (!saved) return;
  state = saved;
  mapReturnView = "title";
  renderMap();
  showView("map");
});

qs("btn-delete-save").addEventListener("click", () => {
  if (!confirm("Delete your saved campaign? This cannot be undone.")) return;
  deleteSave();
  refreshTitleButtons();
});

/* ---------------- character creator ---------------- */
function renderClassCards() {
  const wrap = qs("class-cards");
  wrap.innerHTML = "";
  const filter = classFilter.trim().toLowerCase();
  const list = filter
    ? CLASSES.filter(c => `${c.name} ${c.tagline} ${c.description}`.toLowerCase().includes(filter))
    : classSubset.map(id => CLASSES.find(c => c.id === id)).filter(Boolean);

  if (list.length === 0) {
    wrap.innerHTML = `<p class="no-results">No origins match "${escapeHtml(classFilter)}".</p>`;
    return;
  }
  list.forEach(c => {
    const div = document.createElement("div");
    div.className = "pick-card" + (charSel.classId === c.id ? " selected" : "");
    div.innerHTML = `<h4>${c.name}</h4><p class="card-tagline">${c.tagline}</p><p>${c.description}</p>`;
    div.addEventListener("click", () => {
      charSel.classId = c.id;
      renderClassCards();
      updateStatPreview();
      validateBeginButton();
    });
    wrap.appendChild(div);
  });
}

function renderHomeworldCards() {
  const wrap = qs("homeworld-cards");
  wrap.innerHTML = "";
  const filter = homeworldFilter.trim().toLowerCase();
  const list = filter
    ? HOMEWORLDS.filter(h => `${h.name} ${h.desc}`.toLowerCase().includes(filter))
    : homeworldSubset.map(id => HOMEWORLDS.find(h => h.id === id)).filter(Boolean);

  if (list.length === 0) {
    wrap.innerHTML = `<p class="no-results">No homeworlds match "${escapeHtml(homeworldFilter)}".</p>`;
    return;
  }
  list.forEach(h => {
    const div = document.createElement("div");
    div.className = "pick-card" + (charSel.homeworldId === h.id ? " selected" : "");
    div.innerHTML = `<h4>${h.name}</h4><p>${h.desc}</p>`;
    div.addEventListener("click", () => {
      charSel.homeworldId = h.id;
      renderHomeworldCards();
      updateStatPreview();
      validateBeginButton();
    });
    wrap.appendChild(div);
  });
}

qs("search-class").addEventListener("input", (e) => {
  classFilter = e.target.value;
  renderClassCards();
});
qs("search-homeworld").addEventListener("input", (e) => {
  homeworldFilter = e.target.value;
  renderHomeworldCards();
});
qs("btn-shuffle-class").addEventListener("click", () => {
  classSubset = shuffleSample(CLASSES.map(c => c.id), CLASS_SUBSET_SIZE);
  charSel.classId = null;
  renderClassCards();
  updateStatPreview();
  validateBeginButton();
});
qs("btn-shuffle-homeworld").addEventListener("click", () => {
  homeworldSubset = shuffleSample(HOMEWORLDS.map(h => h.id), HOMEWORLD_SUBSET_SIZE);
  charSel.homeworldId = null;
  renderHomeworldCards();
  updateStatPreview();
  validateBeginButton();
});

function computeStats() {
  const cls = CLASSES.find(c => c.id === charSel.classId);
  if (!cls) return null;
  const stats = Object.assign({}, cls.stats);
  const hw = HOMEWORLDS.find(h => h.id === charSel.homeworldId);
  if (hw) stats[hw.bonusStat] += 1;
  return { stats, wounds: cls.wounds, gear: cls.gear, className: cls.name };
}

const STAT_NAMES = { ws: "Weapon Skill", bs: "Ballistic Skill", t: "Toughness", wp: "Willpower", int: "Intelligence" };

function updateStatPreview() {
  const result = computeStats();
  const box = qs("stat-preview");
  if (!result) { box.classList.add("hidden"); return; }
  box.classList.remove("hidden");
  let html = `<div class="stat-row"><span class="stat-name">Wounds</span><span class="stat-val">${result.wounds}</span></div>`;
  Object.keys(STAT_NAMES).forEach(k => {
    html += `<div class="stat-row"><span class="stat-name">${STAT_NAMES[k]}</span><span class="stat-val">${result.stats[k]}</span></div>`;
  });
  html += `<div class="stat-row"><span class="stat-name">Starting Gear</span><span class="stat-val">${result.gear}</span></div>`;
  box.innerHTML = html;
}

function validateBeginButton() {
  const name = qs("input-name").value.trim();
  qs("btn-begin").disabled = !(name && charSel.classId && charSel.homeworldId);
}
qs("input-name").addEventListener("input", validateBeginButton);
qs("btn-back-title").addEventListener("click", () => { refreshTitleButtons(); showView("title"); });

qs("btn-begin").addEventListener("click", () => {
  const name = qs("input-name").value.trim();
  const built = computeStats();
  if (!name || !built) return;

  state = {
    character: {
      name,
      classId: charSel.classId,
      className: built.className,
      homeworldId: charSel.homeworldId,
      stats: built.stats,
      gear: built.gear
    },
    maxWounds: built.wounds,
    wounds: built.wounds,
    corruption: 0,
    renown: 0,
    missionCount: 0,
    lastMissionTypeId: null,
    visitedPlanets: {},
    visitedOrder: [],
    log: [],
    currentScene: null,
    awaitingContinue: false,
    pendingDowntime: false,
    lastDowntimeAt: 0,
    daysSinceStart: 0,
    lastGrowthDay: 0,
    growthCount: 0,
    lastMillenniumSeen: CAMPAIGN_START_MILLENNIUM,
    approachUsage: { assault: 0, cunning: 0, faith: 0 },
    currentPlanet: null,
    totalLightYears: 0,
    missionMemory: {},
    ended: false,
    endReason: null
  };

  const hw = HOMEWORLDS.find(h => h.id === charSel.homeworldId);
  clearLogDom();
  pushLog("narration", `${name}, ${built.className.toLowerCase()}, stands ready aboard the frigate <em>Emperor's Wrath</em>. ${hw.desc}`);
  pushLog("narration", `The bridge officer hands over a data-slate. A new mission awaits.`);
  saveState();
  enterGameView(false);
  nextMission();
});

/* ---------------- game view / HUD ---------------- */
function enterGameView(rebuildLog) {
  showView("game");
  if (rebuildLog) rebuildLogDom();
  updateHud();
  renderPortrait();
  if (state.awaitingContinue) {
    qs("choices").classList.add("hidden");
    qs("continue-wrap").classList.remove("hidden");
  } else if (state.pendingDowntime) {
    const template = DOWNTIME_TEMPLATES[state.downtimeTemplateIndex] || DOWNTIME_TEMPLATES[0];
    renderDowntimeChoices(template);
  } else if (state.currentScene) {
    const missionType = MISSION_TYPES.find(m => m.id === state.currentScene.missionTypeId);
    const beat = missionType.beats[state.currentScene.beatIndex];
    renderChoiceButtons(missionType, beat);
  }
}

function renderPortrait() {
  const el = qs("hud-portrait");
  const cls = CLASSES.find(c => c.id === state.character.classId);
  const hue = hashStr(state.character.name + state.character.classId) % 360;
  el.style.background = `radial-gradient(circle at 35% 30%, hsl(${hue},48%,30%), hsl(${hue},55%,12%) 75%)`;
  el.textContent = cls.icon;
}

function updateHud() {
  const c = state.character;
  qs("hud-name").textContent = c.name;
  qs("hud-class").textContent = c.className;
  const woundPct = Math.max(0, Math.round((state.wounds / state.maxWounds) * 100));
  qs("bar-wounds").style.width = woundPct + "%";
  qs("bar-wounds-text").textContent = `${Math.max(0, state.wounds)}/${state.maxWounds}`;
  const corPct = Math.max(0, Math.min(100, state.corruption));
  qs("bar-corruption").style.width = corPct + "%";
  qs("bar-corruption-text").textContent = corPct + "%";
  qs("hud-mission-count").textContent = state.missionCount;
  qs("hud-renown").textContent = state.renown;
  qs("hud-day").textContent = state.daysSinceStart;
}

function clearLogDom() { qs("story-log").innerHTML = ""; }
function rebuildLogDom() {
  clearLogDom();
  const wrap = qs("story-log");
  state.log.forEach(entry => {
    if (entry.cls === "divider") {
      wrap.appendChild(document.createElement("hr")).className = "log-divider";
      return;
    }
    const p = document.createElement("p");
    p.className = "log-" + entry.cls;
    p.innerHTML = entry.html;
    wrap.appendChild(p);
  });
  wrap.scrollTop = wrap.scrollHeight;
}
function pushLog(cls, html) {
  state.log.push({ cls, html });
  const p = document.createElement("p");
  p.className = "log-" + cls;
  p.innerHTML = html;
  const wrap = qs("story-log");
  wrap.appendChild(p);
  wrap.scrollTop = wrap.scrollHeight;
}
function pushDivider() {
  state.log.push({ cls: "divider", html: "" });
  const wrap = qs("story-log");
  const hr = document.createElement("hr");
  hr.className = "log-divider";
  wrap.appendChild(hr);
}

qs("btn-game-title").addEventListener("click", () => { saveState(); refreshTitleButtons(); showView("title"); });
qs("btn-game-map").addEventListener("click", () => { mapReturnView = "game"; renderMap(); showView("map"); });

/* ---------------- mission engine ---------------- */
function pickPlanet() {
  const unvisited = PLANETS.filter(p => !state.visitedPlanets[p]);
  if (unvisited.length > 0) return pickRandom(unvisited);
  return pickRandom(PLANETS);
}
function pickMissionType() {
  const cls = CLASSES.find(c => c.id === state.character.classId);
  const favored = (cls && cls.favoredMissions) || [];
  const pool = MISSION_TYPES.filter(m => m.id !== state.lastMissionTypeId);
  const weighted = [];
  pool.forEach(m => {
    const weight = favored.includes(m.id) ? 3 : 1;
    for (let i = 0; i < weight; i++) weighted.push(m);
  });
  return pickRandom(weighted);
}
function currentDC() {
  let dc = 11 + Math.floor(state.missionCount / 5);
  if (state.corruption >= 80) dc += 2; else if (state.corruption >= 50) dc += 1;
  return Math.min(dc, 18);
}
function beatDC(beatIndex) {
  const base = currentDC();
  const reduction = beatIndex === 0 ? 3 : beatIndex === 1 ? 1 : 0;
  return Math.max(8, base - reduction);
}
function effectiveDC(beat, scene, approachKey) {
  let dc = scene.dc;
  if (approachKey) dc += (beat.dcMod && beat.dcMod[approachKey]) || 0;
  if (scene.beatIndex >= 2) {
    dc -= Math.max(-2, Math.min(2, scene.momentum || 0));
  }
  dc -= (scene.memoryDiscount || 0);
  return Math.max(5, dc);
}
function statValueFor(approachKey) {
  const s = state.character.stats;
  if (approachKey === "assault") return Math.max(s.ws, s.bs);
  return s[APPROACHES[approachKey].statKey];
}

function nextMission() {
  const planet = pickPlanet();
  const missionType = pickMissionType();
  state.lastMissionTypeId = missionType.id;

  const distance = distanceBetweenPlanets(state.currentPlanet, planet);
  const days = travelDaysFor(distance);
  state.totalLightYears += distance;

  pushDivider();
  pushLog("narration", buildTravelNarration(state.currentPlanet, planet, days, distance, state.character));
  advanceCalendar(days);
  state.currentPlanet = planet;

  const memory = state.missionMemory[missionType.id];
  const memoryDiscount = memory ? Math.min(2, memory.count) : 0;
  if (memory) pushLog("narration", `<em>${buildRecollectionLine(missionType, memory, state.character)}</em>`);

  state.currentScene = { planet, missionTypeId: missionType.id, beatIndex: 0, dc: 0, lastTier: null, momentum: 0, memoryDiscount };
  saveState();

  pushLog("narration", `<strong>${missionType.name}</strong> — ${planet}`);
  pushLog("narration", missionType.intro(planet));
  qs("continue-wrap").classList.add("hidden");
  startBeat(0);
}

function startBeat(beatIndex) {
  const scene = state.currentScene;
  scene.beatIndex = beatIndex;
  scene.dc = beatDC(beatIndex);
  const missionType = MISSION_TYPES.find(m => m.id === scene.missionTypeId);
  const beat = missionType.beats[beatIndex];

  let text = beat.narration(scene.planet);
  if (beatIndex > 0 && scene.lastTier) {
    const good = scene.lastTier === "success" || scene.lastTier === "critSuccess";
    text = pickRandom(good ? CONTINUITY_GOOD : CONTINUITY_BAD) + text;
  }
  pushLog("narration", text);
  state.awaitingContinue = false;
  saveState();
  renderChoiceButtons(missionType, beat);
  updateHud();
}

function renderChoiceButtons(missionType, beat) {
  const wrap = qs("choices");
  wrap.innerHTML = "";
  wrap.classList.remove("hidden");
  qs("continue-wrap").classList.add("hidden");
  qs("freeform-wrap").classList.add("hidden");
  Object.keys(APPROACHES).forEach(key => {
    const a = APPROACHES[key];
    const opt = beat.options[key];
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.innerHTML = `<span class="choice-letter">${a.letter}</span><span class="choice-text">${a.icon} ${opt.label}</span>`;
    btn.addEventListener("click", () => onChoiceClick(key, missionType, beat));
    wrap.appendChild(btn);
  });

  const otherBtn = document.createElement("button");
  otherBtn.className = "choice-btn choice-other";
  otherBtn.innerHTML = `<span class="choice-letter">?</span><span class="choice-text">💬 Something else&hellip; (type an action, or ask a question)</span>`;
  otherBtn.addEventListener("click", () => {
    wrap.classList.add("hidden");
    const input = qs("freeform-input");
    input.value = "";
    qs("freeform-wrap").classList.remove("hidden");
    input.focus();
  });
  wrap.appendChild(otherBtn);
}

qs("btn-freeform-cancel").addEventListener("click", () => {
  qs("freeform-wrap").classList.add("hidden");
  qs("choices").classList.remove("hidden");
});

function getCurrentMissionAndBeat() {
  const scene = state.currentScene;
  if (!scene) return null;
  const missionType = MISSION_TYPES.find(m => m.id === scene.missionTypeId);
  const beat = missionType.beats[scene.beatIndex];
  return { missionType, beat, scene };
}

function isQuestion(raw) {
  const trimmed = raw.trim();
  if (trimmed.endsWith("?")) return true;
  const firstWord = (trimmed.split(/\s+/)[0] || "").toLowerCase().replace(/[^a-z']/g, "");
  const starters = ["who", "what", "when", "where", "why", "how", "is", "are", "can", "could", "will", "would", "do", "does", "did", "should", "am"];
  return starters.includes(firstWord);
}

/* Scores every FAQ topic by keyword overlap rather than stopping at the
   first match, so a question that touches two topics ("if I die does my
   save disappear?") lands on whichever topic it actually overlaps with
   most, instead of whichever happens to be listed first. This is the
   "certain level of AI thinking" available without a live model: real
   intent scoring over a fixed topic set, not a hardcoded lookup. */
function answerQuestion(raw) {
  const lower = raw.toLowerCase();
  let best = null;
  let bestScore = 0;
  FAQ_BANK.forEach(entry => {
    const score = entry.keywords.reduce((sum, k) => sum + (lower.includes(k) ? k.split(" ").length : 0), 0);
    if (score > bestScore) { bestScore = score; best = entry; }
  });
  return best ? best.answer : FAQ_FALLBACK;
}

/* Same idea for custom actions: score the text against three word banks
   (bold/direct, investigative, devotional) weighted by how much of the
   phrasing actually matches, rather than a single keyword hit deciding
   everything. Ties and no-match text fall back to a neutral average of
   all three stats, so an oddly-phrased action isn't unfairly penalized. */
function freeformApproach(raw) {
  const lower = raw.toLowerCase();
  const hits = {
    assault: FREEFORM_ASSAULT_WORDS.filter(w => lower.includes(w)).length,
    cunning: FREEFORM_CUNNING_WORDS.filter(w => lower.includes(w)).length,
    faith: FREEFORM_FAITH_WORDS.filter(w => lower.includes(w)).length
  };
  const best = Object.keys(hits).reduce((a, b) => (hits[b] > hits[a] ? b : a), "assault");
  return hits[best] > 0 ? best : null;
}
function freeformRoll(raw) {
  const approach = freeformApproach(raw);
  if (approach) return { mod: statModifier(statValueFor(approach)), approach };
  const avg = (statModifier(statValueFor("assault")) + statModifier(statValueFor("cunning")) + statModifier(statValueFor("faith"))) / 3;
  return { mod: Math.round(avg), approach: null };
}
const FREEFORM_READ_AS = { assault: "a direct, forceful approach", cunning: "a careful, reasoned approach", faith: "an approach rooted in faith and resolve" };

qs("btn-freeform-submit").addEventListener("click", () => {
  const raw = qs("freeform-input").value.trim();
  if (!raw) return;
  const ctx = getCurrentMissionAndBeat();
  if (!ctx) return;

  qs("freeform-wrap").classList.add("hidden");
  pushLog("choice", `You: "${escapeHtml(raw)}"`);

  if (isQuestion(raw)) {
    pushLog("narration", `<em>${answerQuestion(raw)}</em>`);
    renderChoiceButtons(ctx.missionType, ctx.beat);
    return;
  }

  if (ctx.beat.noRoll) {
    resolveNoRollBeat(ctx.missionType, ctx.beat, ctx.scene, `You go with your own instinct here. It isn't one of the paths anyone suggested, but it's yours.`);
    return;
  }

  const { mod, approach } = freeformRoll(raw);
  const dc = effectiveDC(ctx.beat, ctx.scene, approach);
  if (approach) pushLog("roll", `Reading that as ${FREEFORM_READ_AS[approach]}.`);
  runDiceAnimation(mod, dc, (roll, total, tier) => {
    resolveFreeformOutcome(raw, approach, ctx.missionType, ctx.beat, ctx.scene, dc, roll, mod, total, tier);
  });
});

function onChoiceClick(approachKey, missionType, beat) {
  const scene = state.currentScene;
  if (!scene) return;
  const approach = APPROACHES[approachKey];
  const opt = beat.options[approachKey];

  document.querySelectorAll(".choice-btn").forEach(b => b.disabled = true);
  pushLog("choice", `You choose: ${approach.icon} "${opt.label}"`);

  if (beat.noRoll) {
    resolveNoRollBeat(missionType, beat, scene, opt.response);
    return;
  }

  const statVal = statValueFor(approachKey);
  const mod = statModifier(statVal);
  const dc = effectiveDC(beat, scene, approachKey);

  runDiceAnimation(mod, dc, (roll, total, tier) => {
    resolveBeatOutcome(approachKey, missionType, beat, scene, dc, roll, mod, total, tier);
  });
}

function resolveNoRollBeat(missionType, beat, scene, responseText) {
  pushLog("narration", responseText);
  qs("choices").classList.add("hidden");
  qs("freeform-wrap").classList.add("hidden");

  scene.lastTier = "success";
  scene.beatIndex += 1;
  state.awaitingContinue = true;
  saveState();
  qs("continue-wrap").classList.remove("hidden");
}

function tierLabel(tier) {
  return { critSuccess: "CRITICAL SUCCESS", success: "SUCCESS", fail: "FAILURE", critFail: "CATASTROPHIC FAILURE" }[tier];
}

function runDiceAnimation(mod, dc, onDone) {
  const overlay = qs("dice-overlay");
  const face = qs("dice-face");
  const resultBox = qs("dice-result");
  overlay.classList.remove("hidden");
  face.classList.remove("settled");
  resultBox.textContent = "";

  let ticks = 0;
  const maxTicks = 12;
  const interval = setInterval(() => {
    face.textContent = randInt(1, 20);
    ticks++;
    if (ticks >= maxTicks) {
      clearInterval(interval);
      const roll = randInt(1, 20);
      face.textContent = roll;
      face.classList.add("settled");
      const total = roll + mod;
      let tier;
      if (roll === 20) tier = "critSuccess";
      else if (roll === 1) tier = "critFail";
      else if (total >= dc) tier = "success";
      else tier = "fail";

      resultBox.innerHTML = `Roll ${roll} + ${mod} = ${total} vs DC ${dc}<br><span class="tier-${tier}">${tierLabel(tier)}</span>`;
      setTimeout(() => {
        overlay.classList.add("hidden");
        onDone(roll, total, tier);
      }, 1200);
    }
  }, 90);
}

function applyOutcomeEffects(tier, missionType) {
  const warpish = missionType.id === "warp" || missionType.id === "heretic";
  let woundLoss = 0, corruptionDelta = 0, renownDelta = 0;
  const scale = Math.floor(state.missionCount / 8);
  switch (tier) {
    case "critSuccess": renownDelta = 3; corruptionDelta = warpish ? -3 : 0; break;
    case "success": renownDelta = 1; corruptionDelta = 0; break;
    case "fail": woundLoss = randInt(1, 4) + scale; corruptionDelta = warpish ? randInt(3, 6) : 1; break;
    case "critFail": woundLoss = randInt(4, 8) + scale; corruptionDelta = warpish ? randInt(6, 10) : 2; break;
  }
  return { woundLoss, corruptionDelta, renownDelta };
}

function applyMinorEffects(tier, missionType) {
  const warpish = missionType.id === "warp" || missionType.id === "heretic";
  let woundLoss = 0, corruptionDelta = 0;
  switch (tier) {
    case "critSuccess": corruptionDelta = warpish ? -1 : 0; break;
    case "success": break;
    case "fail": woundLoss = randInt(0, 2); corruptionDelta = warpish ? randInt(1, 2) : 0; break;
    case "critFail": woundLoss = randInt(1, 3); corruptionDelta = warpish ? randInt(2, 4) : 1; break;
  }
  return { woundLoss, corruptionDelta };
}

function logEffects(effects) {
  if (effects.woundLoss > 0) pushLog("roll", `${state.character.name} suffers ${effects.woundLoss} wound${effects.woundLoss === 1 ? "" : "s"}.`);
  if (effects.corruptionDelta > 0) pushLog("roll", `A whisper of corruption takes hold. (+${effects.corruptionDelta} corruption)`);
  if (effects.corruptionDelta < 0) pushLog("roll", `The taint recedes, if only a little. (${effects.corruptionDelta} corruption)`);
}

function resolveBeatOutcome(approachKey, missionType, beat, scene, dc, roll, mod, total, tier) {
  pushLog("roll", `d20 roll: ${roll} + ${mod} (modifier) = ${total} vs Difficulty ${dc} — <strong>${tierLabel(tier)}</strong>`);
  const objective = beat.objective || missionType.objective;
  const threat = beat.threat || missionType.threat;
  const fragments = missionType.tone === "social" ? OUTCOME_FRAGMENTS_SOCIAL : OUTCOME_FRAGMENTS;
  const text = fragments[approachKey][tier](state.character.name, threat, objective);
  state.approachUsage[approachKey] += 1;
  finalizeBeatResolution(missionType, scene, tier, text);
}

function resolveFreeformOutcome(raw, approach, missionType, beat, scene, dc, roll, mod, total, tier) {
  pushLog("roll", `d20 roll: ${roll} + ${mod} (modifier) = ${total} vs Difficulty ${dc} — <strong>${tierLabel(tier)}</strong>`);
  const objective = beat.objective || missionType.objective;
  const threat = beat.threat || missionType.threat;
  const text = FREEFORM_FRAGMENTS[tier](state.character.name, escapeHtml(raw), threat, objective);
  if (approach) state.approachUsage[approach] += 1;
  finalizeBeatResolution(missionType, scene, tier, text);
}

function finalizeBeatResolution(missionType, scene, tier, text) {
  const outcomeCls = (tier === "success" || tier === "critSuccess") ? "outcome-success" : "outcome-fail";
  pushLog(outcomeCls, text);

  scene.lastTier = tier;
  qs("choices").classList.add("hidden");
  qs("freeform-wrap").classList.add("hidden");

  const isClimax = scene.beatIndex >= 2;
  const effects = isClimax ? applyOutcomeEffects(tier, missionType) : applyMinorEffects(tier, missionType);
  state.wounds = Math.max(0, state.wounds - effects.woundLoss);
  state.corruption = Math.max(0, Math.min(100, state.corruption + effects.corruptionDelta));
  if (isClimax) {
    state.renown += effects.renownDelta;
    state.missionCount += 1;
    recordPlanetVisit(scene.planet, missionType, tier, text);
    const mem = state.missionMemory[missionType.id] || { count: 0, lastPlanet: null };
    mem.count += 1;
    mem.lastPlanet = scene.planet;
    state.missionMemory[missionType.id] = mem;
  } else {
    const swing = tier === "critSuccess" ? 2 : tier === "success" ? 1 : tier === "critFail" ? -2 : -1;
    scene.momentum = (scene.momentum || 0) + swing;
  }
  logEffects(effects);
  updateHud();

  if (state.wounds <= 0) { endCampaign("death"); return; }
  if (state.corruption >= 100) { endCampaign("corruption"); return; }

  if (isClimax) {
    state.currentScene = null;
  } else {
    scene.beatIndex += 1;
  }
  state.awaitingContinue = true;
  saveState();
  qs("continue-wrap").classList.remove("hidden");
}

function recordPlanetVisit(planetName, missionType, tier, summary) {
  const now = formatImperialDate(state.daysSinceStart).text;
  if (!state.visitedPlanets[planetName]) {
    state.visitedPlanets[planetName] = { name: planetName, firstVisited: now, visits: [] };
    state.visitedOrder.push(planetName);
  }
  state.visitedPlanets[planetName].visits.push({
    date: now,
    missionType: missionType.name,
    tier,
    summary,
    missionNumber: state.missionCount
  });
}

qs("btn-continue-journey").addEventListener("click", () => {
  qs("continue-wrap").classList.add("hidden");
  if (state.currentScene) {
    startBeat(state.currentScene.beatIndex);
    return;
  }
  if (state.missionCount > 0 && state.missionCount % 4 === 0 && state.lastDowntimeAt !== state.missionCount) {
    state.pendingDowntime = true;
    saveState();
    startDowntimeScene();
    return;
  }
  nextMission();
});

/* A slow, no-dice character beat dropped in every few missions — the
   deliberate counterweight to the encounters, and proof "the game" isn't
   only ever a fight. The chosen template is saved to state so that a
   resume (Continue Campaign, or a mid-scene reload) rebuilds the exact
   same choices instead of re-narrating a freshly re-rolled one. */
function startDowntimeScene() {
  const idx = Math.floor(Math.random() * DOWNTIME_TEMPLATES.length);
  state.downtimeTemplateIndex = idx;
  const template = DOWNTIME_TEMPLATES[idx];
  pushDivider();
  pushLog("narration", `<em>${template.narration(state.character)}</em>`);
  state.awaitingContinue = false;
  saveState();
  renderDowntimeChoices(template);
}

function renderDowntimeChoices(template) {
  const wrap = qs("choices");
  wrap.innerHTML = "";
  wrap.classList.remove("hidden");
  qs("continue-wrap").classList.add("hidden");
  qs("freeform-wrap").classList.add("hidden");
  Object.keys(APPROACHES).forEach(key => {
    const a = APPROACHES[key];
    const opt = template.options[key];
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.innerHTML = `<span class="choice-letter">${a.letter}</span><span class="choice-text">${a.icon} ${opt.label}</span>`;
    btn.addEventListener("click", () => finishDowntimeScene(opt));
    wrap.appendChild(btn);
  });
}

function finishDowntimeScene(opt) {
  qs("choices").classList.add("hidden");
  pushLog("choice", `You choose: ${opt.label}`);
  pushLog("narration", opt.response);
  const healed = randInt(2, 5);
  state.wounds = Math.min(state.maxWounds, state.wounds + healed);
  pushLog("roll", `${state.character.name} recovers ${healed} wound${healed === 1 ? "" : "s"}. (${state.wounds}/${state.maxWounds})`);
  advanceCalendar(randInt(2, 5));
  updateHud();
  state.pendingDowntime = false;
  state.lastDowntimeAt = state.missionCount;
  saveState();
  nextMission();
}

/* ---------------- game over ---------------- */
function endCampaign(reason) {
  state.ended = true;
  state.endReason = reason;
  state.currentScene = null;
  state.awaitingContinue = false;
  saveState();

  const title = reason === "death" ? "YOUR STORY ENDS HERE" : "DAMNED";
  const text = reason === "death"
    ? `${state.character.name} has fallen in the Emperor's service. Their name will be inscribed among the honoured dead.`
    : `${state.character.name}'s soul has been consumed by the warp. What walks the ship's corridors now wears their face, but answers to darker masters.`;

  qs("gameover-title").textContent = title;
  qs("gameover-text").textContent = text;
  qs("gameover-stats").innerHTML = `
    <p><strong>${state.character.name}</strong> — ${state.character.className}</p>
    <p>Missions completed: ${state.missionCount}</p>
    <p>Renown earned: ${state.renown}</p>
    <p>Planets visited: ${state.visitedOrder.length}</p>
    <p>Final corruption: ${state.corruption}%</p>
    <p>Campaign date reached: ${formatImperialDate(state.daysSinceStart).text} (Day ${state.daysSinceStart})</p>
    <p>Light-years travelled: ${Math.round(state.totalLightYears)}</p>
    <p>Times grown stronger: ${state.growthCount || 0}</p>
  `;
  showView("gameover");
}

qs("btn-gameover-newcampaign").addEventListener("click", () => {
  qs("btn-new-campaign").click();
});
qs("btn-gameover-map").addEventListener("click", () => {
  mapReturnView = "gameover";
  renderMap();
  showView("map");
});

/* ---------------- star map ---------------- */
function renderMap() {
  const empty = qs("map-empty");
  const wrapEl = qs("map-canvas-wrap");
  const nodesEl = qs("map-nodes");
  const linesEl = qs("map-lines");
  qs("map-detail").classList.add("hidden");
  nodesEl.innerHTML = "";
  linesEl.innerHTML = "";

  const order = (state && state.visitedOrder) || [];
  if (order.length === 0) {
    empty.classList.remove("hidden");
    wrapEl.classList.add("hidden");
    return;
  }
  empty.classList.add("hidden");
  wrapEl.classList.remove("hidden");

  const home = document.createElement("div");
  home.className = "map-home";
  home.textContent = "🚀";
  home.title = "Emperor's Wrath (home base)";
  nodesEl.appendChild(home);

  const points = order.map(name => ({ name, pos: planetPos(name) }));

  let prev = { x: 50, y: 50 };
  points.forEach(pt => {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", prev.x + "%");
    line.setAttribute("y1", prev.y + "%");
    line.setAttribute("x2", pt.pos.x + "%");
    line.setAttribute("y2", pt.pos.y + "%");
    linesEl.appendChild(line);
    prev = pt.pos;
  });

  points.forEach(pt => {
    const entry = state.visitedPlanets[pt.name];
    const lastTier = entry.visits[entry.visits.length - 1].tier;
    const node = document.createElement("div");
    node.className = `map-node tier-${lastTier}`;
    node.style.left = pt.pos.x + "%";
    node.style.top = pt.pos.y + "%";
    node.innerHTML = `<div class="dot"></div><div class="label">${pt.name}</div>`;
    node.addEventListener("click", () => showPlanetDetail(pt.name));
    nodesEl.appendChild(node);
  });
}

function showPlanetDetail(name) {
  const entry = state.visitedPlanets[name];
  if (!entry) return;
  qs("detail-name").textContent = entry.name;
  qs("detail-first-visited").textContent = `First visited: ${entry.firstVisited}`;
  const visitsEl = qs("detail-visits");
  visitsEl.innerHTML = "";
  entry.visits.slice().reverse().forEach(v => {
    const div = document.createElement("div");
    div.className = "visit-entry";
    const outcomeCls = (v.tier === "success" || v.tier === "critSuccess") ? "visit-outcome-success" : "visit-outcome-fail";
    div.innerHTML = `
      <div class="visit-date">Mission ${v.missionNumber} · ${v.date}</div>
      <div><strong>${v.missionType}</strong> — <span class="${outcomeCls}">${tierLabel(v.tier)}</span></div>
      <div>${v.summary}</div>
    `;
    visitsEl.appendChild(div);
  });
  qs("map-detail").classList.remove("hidden");
}

qs("btn-close-detail").addEventListener("click", () => qs("map-detail").classList.add("hidden"));
qs("btn-map-back").addEventListener("click", () => {
  qs("map-detail").classList.add("hidden");
  if (mapReturnView === "game" && state && !state.ended) {
    showView("game");
  } else if (mapReturnView === "gameover" && state) {
    showView("gameover");
  } else {
    refreshTitleButtons();
    showView("title");
  }
});

/* ---------------- init ---------------- */
refreshTitleButtons();
classSubset = shuffleSample(CLASSES.map(c => c.id), CLASS_SUBSET_SIZE);
homeworldSubset = shuffleSample(HOMEWORLDS.map(h => h.id), HOMEWORLD_SUBSET_SIZE);
renderClassCards();
renderHomeworldCards();
showView("title");

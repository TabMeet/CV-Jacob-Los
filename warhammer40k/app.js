/* ============================================================
   WARHAMMER 40,000: WAR OF SIGNAL LOST — game engine & UI
   ============================================================ */

const SAVE_KEY = "wh40k_save_v1";

let state = null;          // active campaign state
let charSel = { classId: null, homeworldId: null };
let mapReturnView = "title";
let mapPlanetOrderCache = null;

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
  CLASSES.forEach(c => {
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
  HOMEWORLDS.forEach(h => {
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
  let choices = MISSION_TYPES;
  if (state.lastMissionTypeId) choices = MISSION_TYPES.filter(m => m.id !== state.lastMissionTypeId);
  return pickRandom(choices);
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
function statValueFor(approachKey) {
  const s = state.character.stats;
  if (approachKey === "assault") return Math.max(s.ws, s.bs);
  return s[APPROACHES[approachKey].statKey];
}

function nextMission() {
  const planet = pickPlanet();
  const missionType = pickMissionType();
  state.lastMissionTypeId = missionType.id;
  state.currentScene = { planet, missionTypeId: missionType.id, beatIndex: 0, dc: 0, lastTier: null };
  saveState();

  pushDivider();
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
  Object.keys(APPROACHES).forEach(key => {
    const a = APPROACHES[key];
    const opt = beat.options[key];
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.innerHTML = `<span class="choice-letter">${a.letter}</span><span class="choice-text">${a.icon} ${opt.label}</span>`;
    btn.addEventListener("click", () => onChoiceClick(key, missionType, beat));
    wrap.appendChild(btn);
  });
}

function onChoiceClick(approachKey, missionType, beat) {
  const scene = state.currentScene;
  if (!scene) return;
  const approach = APPROACHES[approachKey];
  const opt = beat.options[approachKey];

  document.querySelectorAll(".choice-btn").forEach(b => b.disabled = true);
  pushLog("choice", `You choose: ${approach.icon} "${opt.label}"`);

  const statVal = statValueFor(approachKey);
  const mod = statModifier(statVal);

  runDiceAnimation(mod, scene.dc, (roll, total, tier) => {
    resolveBeatOutcome(approachKey, missionType, beat, scene, roll, mod, total, tier);
  });
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

function resolveBeatOutcome(approachKey, missionType, beat, scene, roll, mod, total, tier) {
  pushLog("roll", `d20 roll: ${roll} + ${mod} (modifier) = ${total} vs Difficulty ${scene.dc} — <strong>${tierLabel(tier)}</strong>`);

  const objective = beat.objective || missionType.objective;
  const threat = beat.threat || missionType.threat;
  const fragFn = OUTCOME_FRAGMENTS[approachKey][tier];
  const text = fragFn(state.character.name, threat, objective);
  const outcomeCls = (tier === "success" || tier === "critSuccess") ? "outcome-success" : "outcome-fail";
  pushLog(outcomeCls, text);

  scene.lastTier = tier;
  qs("choices").classList.add("hidden");

  const isClimax = scene.beatIndex >= 2;
  const effects = isClimax ? applyOutcomeEffects(tier, missionType) : applyMinorEffects(tier, missionType);
  state.wounds = Math.max(0, state.wounds - effects.woundLoss);
  state.corruption = Math.max(0, Math.min(100, state.corruption + effects.corruptionDelta));
  if (isClimax) {
    state.renown += effects.renownDelta;
    state.missionCount += 1;
    recordPlanetVisit(scene.planet, missionType, tier, text);
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
  const now = new Date().toLocaleString();
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
  if (state.missionCount > 0 && state.missionCount % 4 === 0) {
    pushLog("narration", `<em>${pickRandom(REST_LINES)}</em>`);
    const healed = randInt(2, 5);
    state.wounds = Math.min(state.maxWounds, state.wounds + healed);
    pushLog("roll", `${state.character.name} recovers ${healed} wound${healed === 1 ? "" : "s"}. (${state.wounds}/${state.maxWounds})`);
    updateHud();
  }
  nextMission();
});

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
renderClassCards();
renderHomeworldCards();
showView("title");

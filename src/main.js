import "./styles/base.css";
import { buildings, buildingMap } from "./game/buildings.js";
import { achievements } from "./game/achievements.js";
import { upgrades } from "./game/upgrades.js";
import { getBulkCost, getBulkRefund, getCpsMultiplier } from "./game/economy.js";
import { createDefaultState, exportState, importState, loadState, resetState, saveState } from "./game/state.js";
import { startLoop } from "./game/loop.js";
import { renderHeader, renderStore, renderTabContent } from "./ui/render.js";
import { pushToast } from "./ui/toast.js";
import { showConfirmModal } from "./ui/modal.js";
import { setupEvents, spawnClickFx } from "./ui/events.js";

const toastArea = document.getElementById("toast-area");
const fxContainer = document.getElementById("cookie-fx");

let state = loadState();
const ui = {
  activeTab: "options",
  storeTab: "buildings",
  mode: "buy",
  buyQty: 1,
};

let autosaveTimer = 0;

const derived = computeDerived(state);
renderAll();

setupEvents({
  ui,
  onCookieClick: () => {
    const clickPower = computeDerived(state).clickPower;
    state.cookies += clickPower;
    state.totalCookies += clickPower;
    state.totalClicks += 1;
    spawnClickFx({ container: fxContainer, amount: clickPower, reducedMotion: state.settings.reducedMotion });
    checkAchievements();
    renderAll();
  },
  onTabChange: (tab) => {
    ui.activeTab = tab;
    updateTabButtons();
    renderTabContent(state, computeDerived(state), ui);
  },
  onModeChange: (mode) => {
    ui.mode = mode;
    updateModeButtons();
  },
  onBulkChange: (qty) => {
    ui.buyQty = qty;
    updateBulkButtons();
    renderStore(state, computeDerived(state), ui);
  },
  onStoreTabChange: (tab) => {
    ui.storeTab = tab;
    updateStoreTabs();
    renderStore(state, computeDerived(state), ui);
  },
  onStoreBuilding: (id) => {
    const building = buildingMap[id];
    if (!building) {
      return;
    }
    const owned = state.buildings[id];
    if (!isBuildingUnlocked(id)) {
      return;
    }
    if (ui.mode === "sell") {
      const qty = Math.min(ui.buyQty, owned);
      if (qty <= 0) {
        return;
      }
      const refund = getBulkRefund(building.baseCost, owned, qty);
      state.cookies += refund;
      state.buildings[id] -= qty;
      renderAll();
      saveState(state);
      return;
    }
    const cost = getBulkCost(building.baseCost, owned, ui.buyQty);
    if (state.cookies < cost) {
      return;
    }
    state.cookies -= cost;
    state.buildings[id] += ui.buyQty;
    checkAchievements();
    renderAll();
    saveState(state);
  },
  onStoreUpgrade: (id) => {
    const upgrade = upgrades.find((item) => item.id === id);
    if (!upgrade || state.upgrades[id]) {
      return;
    }
    if (!isUpgradeUnlocked(upgrade)) {
      return;
    }
    if (state.cookies < upgrade.cost) {
      return;
    }
    state.cookies -= upgrade.cost;
    state.upgrades[id] = true;
    pushToast(toastArea, {
      title: "Upgrade unlocked",
      body: upgrade.name,
      icon: "⭐",
    });
    renderAll();
    saveState(state);
  },
  onOptionAction: (action) => {
    if (action === "toggle-sound") {
      state.settings.sound = !state.settings.sound;
    }
    if (action === "toggle-motion") {
      state.settings.reducedMotion = !state.settings.reducedMotion;
    }
    if (action === "format-short") {
      state.settings.numberFormat = "short";
    }
    if (action === "format-standard") {
      state.settings.numberFormat = "standard";
    }
    if (action === "save") {
      saveState(state);
      pushToast(toastArea, { title: "Saved", body: "Game saved.", icon: "💾" });
    }
    if (action === "export") {
      const payload = exportState(state);
      window.prompt("Copy your save data:", payload);
    }
    if (action === "import") {
      const payload = window.prompt("Paste save data to import:");
      if (payload) {
        const result = importState(payload);
        if (result.ok) {
          state = result.state;
          pushToast(toastArea, { title: "Imported", body: "Save loaded.", icon: "📦" });
        } else {
          pushToast(toastArea, { title: "Import failed", body: result.error, icon: "⚠️" });
        }
      }
    }
    if (action === "reset") {
      showConfirmModal({
        title: "Hard Reset",
        body: "This will wipe your bakery. Continue?",
        onConfirm: () => {
          resetState();
          state = createDefaultState();
          renderAll();
        },
      });
      return;
    }
    renderAll();
  },
  onAscend: () => {
    const derivedState = computeDerived(state);
    if (!derivedState.canAscend) {
      return;
    }
    showConfirmModal({
      title: "Ascend",
      body: `Reset cookies and buildings for ${derivedState.ascendReward} legacy points?`,
      onConfirm: () => {
        state.cookies = 0;
        state.buildings = createDefaultState().buildings;
        state.upgrades = {};
        state.legacyPoints += derivedState.ascendReward;
        state.ascends += 1;
        saveState(state);
        renderAll();
      },
    });
  },
});

startLoop({
  onTick: (delta) => {
    const info = computeDerived(state);
    state.cookies += info.cps * delta;
    state.totalCookies += info.cps * delta;
    state.timePlayed += delta;
    autosaveTimer += delta;
    if (autosaveTimer >= 5) {
      autosaveTimer = 0;
      saveState(state);
    }
    checkAchievements();
    renderHeader(state, info);
  },
});

function renderAll() {
  const info = computeDerived(state);
  renderHeader(state, info);
  renderTabContent(state, info, ui);
  renderStore(state, info, ui);
  updateTabButtons();
  updateModeButtons();
  updateBulkButtons();
  updateStoreTabs();
}

function computeDerived(currentState) {
  const clickAdd = upgrades.reduce((total, upgrade) => {
    if (!currentState.upgrades[upgrade.id]) {
      return total;
    }
    if (upgrade.effect.type === "click_add") {
      return total + upgrade.effect.amount;
    }
    return total;
  }, 0);
  const clickMult = upgrades.reduce((total, upgrade) => {
    if (!currentState.upgrades[upgrade.id]) {
      return total;
    }
    if (upgrade.effect.type === "click_mult") {
      return total * upgrade.effect.amount;
    }
    return total;
  }, 1);
  const buildingMultipliers = buildings.reduce((acc, building) => {
    acc[building.id] = 1;
    return acc;
  }, {});
  let globalMult = 1;
  upgrades.forEach((upgrade) => {
    if (!currentState.upgrades[upgrade.id]) {
      return;
    }
    if (upgrade.effect.type === "building_mult") {
      buildingMultipliers[upgrade.effect.target] *= upgrade.effect.amount;
    }
    if (upgrade.effect.type === "global_cps_mult") {
      globalMult *= upgrade.effect.amount;
    }
  });
  const legacyMult = getCpsMultiplier(currentState.legacyPoints);
  const buildingCps = buildings.reduce((acc, building) => {
    acc[building.id] = building.baseCps * buildingMultipliers[building.id] * globalMult * legacyMult;
    return acc;
  }, {});
  const cps = buildings.reduce(
    (sum, building) => sum + buildingCps[building.id] * currentState.buildings[building.id],
    0,
  );
  const achievementsUnlocked = achievements.filter((achievement) => currentState.achievements[achievement.id]);
  const ascendThreshold = 1_000_000;
  const ascendReward = Math.floor(currentState.totalCookies / ascendThreshold);
  return {
    clickPower: (1 + clickAdd) * clickMult,
    cps,
    buildingCps,
    achievementsUnlocked,
    canAscend: currentState.totalCookies >= ascendThreshold,
    ascendThreshold,
    ascendReward,
  };
}

function updateTabButtons() {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === ui.activeTab);
  });
}

function updateModeButtons() {
  document.querySelectorAll(".mode-button").forEach((button) => {
    if (!button.dataset.mode) {
      return;
    }
    button.classList.toggle("active", button.dataset.mode === ui.mode);
  });
}

function updateBulkButtons() {
  document.querySelectorAll(".bulk-button").forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.bulk) === ui.buyQty);
  });
}

function updateStoreTabs() {
  document.querySelectorAll(".store-tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.store === ui.storeTab);
  });
}

function checkAchievements() {
  const info = computeDerived(state);
  achievements.forEach((achievement) => {
    if (state.achievements[achievement.id]) {
      return;
    }
    if (achievement.check(state, info)) {
      state.achievements[achievement.id] = true;
      pushToast(toastArea, {
        title: "Achievement unlocked",
        body: achievement.name,
        icon: achievement.icon,
      });
    }
  });
}

function isBuildingUnlocked(id) {
  const index = buildings.findIndex((building) => building.id === id);
  if (index <= 0) {
    return true;
  }
  const previous = buildings[index - 1];
  return state.totalCookies >= previous.baseCost || state.buildings[previous.id] > 0;
}

function isUpgradeUnlocked(upgrade) {
  if (state.upgrades[upgrade.id]) {
    return true;
  }
  return state.totalCookies >= upgrade.cost * 0.5;
}

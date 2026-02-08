import { buildings } from "../game/buildings.js";
import { upgrades } from "../game/upgrades.js";
import { formatNumber, getBuildingCost, getBulkCost } from "../game/economy.js";

export function renderHeader(state, derived) {
  const format = (value) => formatNumber(value, state.settings.numberFormat);
  document.getElementById("cookie-count").textContent = format(state.cookies);
  document.getElementById("cps-count").textContent = `${format(derived.cps)} CPS`;
  document.getElementById("click-count").textContent = format(state.totalClicks);
  document.getElementById("legacy-count").textContent = state.legacyPoints;
}

export function renderTabContent(state, derived, ui) {
  const container = document.getElementById("tab-content");
  container.innerHTML = getTabMarkup(state, derived, ui.activeTab);
}

export function renderStore(state, derived, ui) {
  const list = document.getElementById("store-list");
  const format = (value) => formatNumber(value, state.settings.numberFormat);
  if (ui.storeTab === "upgrades") {
    list.innerHTML = upgrades
      .map((upgrade) => {
        const purchased = Boolean(state.upgrades[upgrade.id]);
        const unlocked = isUpgradeUnlocked(state, upgrade);
        const name = unlocked ? upgrade.name : "???";
        const icon = unlocked ? "⭐" : "❔";
        const cost = format(upgrade.cost);
        return `
          <div class="store-item ${!unlocked ? "locked" : ""}" data-upgrade="${upgrade.id}">
            <div class="store-icon">${icon}</div>
            <div class="store-meta">
              <div class="store-name">${name}</div>
              <div class="store-details">
                <span>Cost: ${cost}</span>
                <span>${purchased ? "Owned" : "Available"}</span>
              </div>
            </div>
            <div class="tooltip">${upgrade.description}</div>
          </div>
        `;
      })
      .join("");
    return;
  }
  list.innerHTML = buildings
    .map((building, index) => {
      const owned = state.buildings[building.id];
      const unlocked = isBuildingUnlocked(state, index);
      const name = unlocked ? building.name : "???";
      const icon = unlocked ? building.icon : "❔";
      const cost = format(getBulkCost(building.baseCost, owned, ui.buyQty));
      const cps = format(derived.buildingCps[building.id] || building.baseCps);
      return `
        <div class="store-item ${!unlocked ? "locked" : ""}" data-building="${building.id}">
          <div class="store-icon">${icon}</div>
          <div class="store-meta">
            <div class="store-name">${name}</div>
            <div class="store-details">
              <span>Owned: ${owned}</span>
              <span>Cost: ${cost}</span>
              <span>${cps} CPS</span>
            </div>
          </div>
          <div class="tooltip">
            ${building.description}<br />
            Next cost: ${format(getBuildingCost(building.baseCost, owned))}
          </div>
        </div>
      `;
    })
    .join("");
}

function getTabMarkup(state, derived, activeTab) {
  const format = (value) => formatNumber(value, state.settings.numberFormat);
  if (activeTab === "stats") {
    return `
      <div class="option-grid">
        <div class="option-row"><span>Total cookies earned</span><span>${format(
          state.totalCookies,
        )}</span></div>
        <div class="option-row"><span>Total clicks</span><span>${format(
          state.totalClicks,
        )}</span></div>
        <div class="option-row"><span>Time played</span><span>${formatTime(
          state.timePlayed,
        )}</span></div>
        <div class="option-row"><span>Current CPS</span><span>${format(derived.cps)}</span></div>
        <div>
          <h4>Buildings</h4>
          <ul class="list">
            ${buildings
              .map(
                (building) =>
                  `<li>${building.name}: ${state.buildings[building.id]}</li>`,
              )
              .join("")}
          </ul>
        </div>
        <div>
          <h4>Achievements</h4>
          <ul class="list">
            ${derived.achievementsUnlocked
              .map((achievement) => `<li>${achievement.icon} ${achievement.name}</li>`)
              .join("")}
          </ul>
        </div>
      </div>
    `;
  }
  if (activeTab === "info") {
    return `
      <div class="option-grid">
        <div>
          <h4>Mini Changelog</h4>
          <ul class="list">
            <li>v1.0: Initial pixel bakery drop.</li>
            <li>Added ascension, upgrades, achievements.</li>
            <li>Improved cookie FX and store UI.</li>
          </ul>
        </div>
        <div>
          <h4>Controls</h4>
          <ul class="list">
            <li>Click the big cookie to bake.</li>
            <li>Use Buy/Sell and x1/x10/x100 for bulk actions.</li>
            <li>Tabs change the middle panel only.</li>
          </ul>
        </div>
        <div>
          <h4>Credits</h4>
          <ul class="list">
            <li>Design: Pixel Bakery Team.</li>
            <li>Built with Vite + Vanilla JS.</li>
          </ul>
        </div>
      </div>
    `;
  }
  if (activeTab === "legacy") {
    return `
      <div class="option-grid">
        <div class="option-row">
          <span>Legacy points</span>
          <span>${state.legacyPoints}</span>
        </div>
        <div class="option-row">
          <span>Global bonus</span>
          <span>${(state.legacyPoints * 1).toFixed(0)}% CPS</span>
        </div>
        <div class="option-row">
          <span>Ascends</span>
          <span>${state.ascends}</span>
        </div>
        <button class="mode-button active" data-action="ascend" ${
          derived.canAscend ? "" : "disabled"
        }>
          Ascend (requires ${format(derived.ascendThreshold)} cookies)
        </button>
      </div>
    `;
  }
  return `
    <div class="option-grid">
      <div class="option-row">
        <span>Sound</span>
        <button class="mode-button" data-action="toggle-sound">${
          state.settings.sound ? "On" : "Off"
        }</button>
      </div>
      <div class="option-row">
        <span>Reduced motion</span>
        <button class="mode-button" data-action="toggle-motion">${
          state.settings.reducedMotion ? "On" : "Off"
        }</button>
      </div>
      <div class="option-row">
        <span>Number format</span>
        <div>
          <button class="mode-button ${
            state.settings.numberFormat === "short" ? "active" : ""
          }" data-action="format-short">Short</button>
          <button class="mode-button ${
            state.settings.numberFormat === "standard" ? "active" : ""
          }" data-action="format-standard">Standard</button>
        </div>
      </div>
      <div class="option-row">
        <button class="mode-button" data-action="save">Save</button>
        <button class="mode-button" data-action="export">Export</button>
        <button class="mode-button" data-action="import">Import</button>
        <button class="mode-button" data-action="reset">Hard reset</button>
      </div>
    </div>
  `;
}

function isBuildingUnlocked(state, index) {
  if (index === 0) {
    return true;
  }
  const previous = buildings[index - 1];
  return state.totalCookies >= previous.baseCost || state.buildings[previous.id] > 0;
}

function isUpgradeUnlocked(state, upgrade) {
  if (state.upgrades[upgrade.id]) {
    return true;
  }
  return state.totalCookies >= upgrade.cost * 0.5;
}

function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hrs}h ${mins}m ${secs}s`;
}

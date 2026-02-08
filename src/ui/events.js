export function setupEvents({
  ui,
  onCookieClick,
  onTabChange,
  onModeChange,
  onBulkChange,
  onStoreTabChange,
  onStoreBuilding,
  onStoreUpgrade,
  onOptionAction,
  onAscend,
}) {
  document.getElementById("cookie-button").addEventListener("click", (event) => {
    onCookieClick(event);
  });

  document.getElementById("tabs").addEventListener("click", (event) => {
    const tab = event.target.closest(".tab")?.dataset.tab;
    if (tab) {
      onTabChange(tab);
    }
  });

  document.querySelector(".store-modes").addEventListener("click", (event) => {
    const mode = event.target.closest(".mode-button")?.dataset.mode;
    if (mode) {
      onModeChange(mode);
    }
  });

  document.querySelector(".store-bulk").addEventListener("click", (event) => {
    const bulk = event.target.closest(".bulk-button")?.dataset.bulk;
    if (bulk) {
      onBulkChange(Number(bulk));
    }
  });

  document.querySelector(".store-tabs").addEventListener("click", (event) => {
    const store = event.target.closest(".store-tab")?.dataset.store;
    if (store) {
      onStoreTabChange(store);
    }
  });

  document.getElementById("store-list").addEventListener("click", (event) => {
    const building = event.target.closest(".store-item")?.dataset.building;
    const upgrade = event.target.closest(".store-item")?.dataset.upgrade;
    if (building) {
      onStoreBuilding(building);
    }
    if (upgrade) {
      onStoreUpgrade(upgrade);
    }
  });

  document.getElementById("tab-content").addEventListener("click", (event) => {
    const action = event.target.closest("button")?.dataset.action;
    if (action) {
      if (action === "ascend") {
        onAscend();
        return;
      }
      onOptionAction(action);
    }
  });

  document.getElementById("tab-content").addEventListener("click", (event) => {
    const format = event.target.closest("button")?.dataset.action;
    if (format?.startsWith("format-")) {
      onOptionAction(format);
    }
  });
}

export function spawnClickFx({ container, amount, reducedMotion }) {
  if (reducedMotion) {
    return;
  }
  const text = document.createElement("span");
  text.className = "float-text";
  text.textContent = `+${amount}`;
  text.style.left = `${50 + (Math.random() * 40 - 20)}%`;
  text.style.top = `${50 + (Math.random() * 10 - 5)}%`;
  text.style.setProperty("--dx", `${Math.random() * 40 - 20}px`);
  container.appendChild(text);
  setTimeout(() => text.remove(), 900);

  for (let i = 0; i < 6; i += 1) {
    const crumb = document.createElement("span");
    crumb.className = "crumb";
    crumb.style.left = `${50 + (Math.random() * 60 - 30)}%`;
    crumb.style.top = `${50 + (Math.random() * 60 - 30)}%`;
    crumb.style.setProperty("--dx", `${Math.random() * 40 - 20}px`);
    crumb.style.setProperty("--dy", `${Math.random() * 40 - 10}px`);
    container.appendChild(crumb);
    setTimeout(() => crumb.remove(), 600);
  }
}

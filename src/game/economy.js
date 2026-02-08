const suffixes = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No"];

export const costMultiplier = 1.15;

export function formatNumber(value, mode = "short") {
  if (mode === "standard") {
    return Math.floor(value).toLocaleString();
  }
  if (value < 1000) {
    return Math.floor(value).toString();
  }
  const tier = Math.min(Math.floor(Math.log10(value) / 3), suffixes.length - 1);
  const scale = 10 ** (tier * 3);
  const scaled = value / scale;
  return `${scaled.toFixed(scaled < 10 ? 2 : scaled < 100 ? 1 : 0)}${suffixes[tier]}`;
}

export function getBuildingCost(baseCost, owned) {
  return Math.floor(baseCost * costMultiplier ** owned);
}

export function getBulkCost(baseCost, owned, qty) {
  if (qty <= 0) {
    return 0;
  }
  const start = baseCost * costMultiplier ** owned;
  const total = start * ((costMultiplier ** qty - 1) / (costMultiplier - 1));
  return Math.floor(total);
}

export function getBulkRefund(baseCost, owned, qty) {
  if (qty <= 0) {
    return 0;
  }
  const startOwned = Math.max(owned - qty, 0);
  const total = getBulkCost(baseCost, startOwned, qty);
  return Math.floor(total * 0.5);
}

export function getCpsMultiplier(legacyPoints) {
  return 1 + legacyPoints * 0.01;
}

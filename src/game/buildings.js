export const buildings = [
  {
    id: "cursor",
    name: "Cursor",
    baseCost: 15,
    baseCps: 0.1,
    description: "Autoclicks once every 10 seconds.",
    icon: "🖱️",
  },
  {
    id: "grandma",
    name: "Grandma",
    baseCost: 100,
    baseCps: 1,
    description: "Bakes cookies with love and a rolling pin.",
    icon: "👵",
  },
  {
    id: "farm",
    name: "Farm",
    baseCost: 1100,
    baseCps: 8,
    description: "Grows cookie dough sprouts.",
    icon: "🌾",
  },
  {
    id: "factory",
    name: "Factory",
    baseCost: 13000,
    baseCps: 47,
    description: "Industrial mixers & conveyor belts.",
    icon: "🏭",
  },
  {
    id: "bank",
    name: "Bank",
    baseCost: 140000,
    baseCps: 260,
    description: "Cookie investment instruments.",
    icon: "🏦",
  },
  {
    id: "temple",
    name: "Temple",
    baseCost: 2000000,
    baseCps: 1400,
    description: "Ancient oven rituals.",
    icon: "⛩️",
  },
];

export const buildingMap = Object.fromEntries(buildings.map((building) => [building.id, building]));

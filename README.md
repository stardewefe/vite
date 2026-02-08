# El Meatball's bakery

Pixel-art styled single-page incremental game inspired by Cookie Clicker. Built with Vite + Vanilla JS.

## Setup

```bash
npm i
npm run dev
```

## Build

```bash
npm run build
```

## Features

- Single-page UI with tabs (Options / Stats / Info / Legacy)
- LocalStorage save (versioned: `pixel-bakery-v1`)
- Ascension (legacy points +1% CPS each)
- Achievements + upgrades + building store
- Pixel UI, floating text, crumbs, hover glow
- Import / Export / Hard Reset

## Controls

- Click the big cookie to bake cookies.
- Use Buy/Sell and x1/x10/x100 to trade in bulk.
- Switch tabs for Options / Stats / Info / Legacy.

## Import / Export format

Exported data is JSON with a versioned schema:

```json
{
  "version": 1,
  "bakeryName": "El Meatball's bakery",
  "cookies": 0,
  "totalCookies": 0,
  "totalClicks": 0,
  "buildings": {
    "cursor": 0,
    "grandma": 0,
    "farm": 0,
    "factory": 0,
    "bank": 0,
    "temple": 0
  },
  "upgrades": {},
  "achievements": {},
  "legacyPoints": 0,
  "ascends": 0,
  "settings": {
    "sound": false,
    "reducedMotion": false,
    "numberFormat": "short"
  },
  "timePlayed": 0,
  "lastSave": 0
}
```

## Roadmap

- Add more buildings & upgrades
- Add audio packs
- Add prestige cosmetics

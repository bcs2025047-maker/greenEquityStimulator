// ═══════════════════════════════════════════════════════════════
// GREEN EQUITY SIMULATOR — data.js
// Member 3: Stock definitions, demo prices, insights content
// ═══════════════════════════════════════════════════════════════

// ─── STOCK DEFINITIONS ──────────────────────────────────────────
// Each stock has: ticker, display name, sector, emoji icon,
// and co2 offset coefficient (kg CO₂ offset per $1 invested per year)
const STOCKS = [
  { ticker: 'NEE',   name: 'NextEra Energy',      sector: 'Solar',      icon: '☀️',  co2: 0.42 },
  { ticker: 'FLNC',  name: 'Fluence Energy',       sector: 'Storage',    icon: '🔋',  co2: 0.31 },
  { ticker: 'VWDRY', name: 'Vestas Wind',           sector: 'Wind',       icon: '🌬️', co2: 0.55 },
  { ticker: 'RUN',   name: 'Sunrun Inc',            sector: 'Solar',      icon: '🌤️', co2: 0.38 },
  { ticker: 'RIVN',  name: 'Rivian Auto',           sector: 'EV',         icon: '🚗',  co2: 0.62 },
  { ticker: 'PLUG',  name: 'Plug Power',            sector: 'Hydro',      icon: '💧',  co2: 0.48 },
  { ticker: 'ENPH',  name: 'Enphase Energy',        sector: 'Efficiency', icon: '⚡',  co2: 0.29 },
  { ticker: 'BLNK',  name: 'Blink Charging',        sector: 'EV',         icon: '🔌',  co2: 0.57 },
  { ticker: 'HASI',  name: 'HA Sustainable Infra',  sector: 'Efficiency', icon: '🌿',  co2: 0.25 },
  { ticker: 'BE',    name: 'Bloom Energy',           sector: 'Hydro',      icon: '💦',  co2: 0.44 },
  { ticker: 'ARRY',  name: 'Array Technologies',    sector: 'Solar',      icon: '🔆',  co2: 0.40 },
  { ticker: 'GEV',   name: 'GE Vernova',             sector: 'Wind',       icon: '🌀',  co2: 0.51 },
];

// ─── SECTOR COLOR MAP ────────────────────────────────────────────
// Used for charts, sector bars, and stock icons
const SECTOR_COLORS = {
  Solar:      '#facc15',
  Wind:       '#60a5fa',
  EV:         '#a78bfa',
  Hydro:      '#34d399',
  Storage:    '#fb923c',
  Efficiency: '#4ade80',
};

// ─── DEMO PRICES ─────────────────────────────────────────────────
// Fallback prices used when no Alpha Vantage API key is provided.
// Approximate real values as of early 2025.
const DEMO_PRICES = {
  NEE:   74.5,
  FLNC:   3.6,
  VWDRY: 11.4,
  RUN:    9.1,
  RIVN:  10.8,
  PLUG:   2.1,
  ENPH:  57.3,
  BLNK:   1.7,
  HASI:  20.1,
  BE:    14.6,
  ARRY:   8.4,
  GEV:  318.0,
};

// ─── DEMO PRICE CHANGES ──────────────────────────────────────────
// Simulated day-change percentages shown in demo mode
const DEMO_CHG = {
  NEE:   0.9,
  FLNC: -1.6,
  VWDRY: 0.4,
  RUN:  -2.3,
  RIVN:  3.8,
  PLUG: -1.1,
  ENPH:  1.4,
  BLNK: -0.6,
  HASI:  0.7,
  BE:   -2.0,
  ARRY:  2.5,
  GEV:   1.8,
};

// ─── EDUCATIONAL INSIGHTS ────────────────────────────────────────
// Displayed on the Learn tab — green energy facts and statistics
const INSIGHTS = [
  {
    icon: '🌾',
    tag: 'Sustainable Farming',
    title: 'Vertical farms cut water use by 95%',
    body: 'Indoor vertical farming uses aeroponic systems requiring 95% less water than traditional agriculture while producing yields 10× higher per square foot — zero pesticides needed.',
  },
  {
    icon: '♻️',
    tag: 'E-Waste',
    title: 'Only 17% of e-waste is formally recycled globally',
    body: 'The world generated 53.6 million metric tonnes of e-waste in 2022. Companies like Attero Recycling are pioneering lithium extraction from spent batteries, closing the supply loop.',
  },
  {
    icon: '☀️',
    tag: 'Solar Tech',
    title: 'Solar LCOE has fallen 90% in the last decade',
    body: 'The Levelized Cost of Energy for utility-scale solar is now below $0.03/kWh in many markets — cheaper than coal, gas, and nuclear across most regions of the world.',
  },
  {
    icon: '🌊',
    tag: 'Climate Adaptation',
    title: 'Blue carbon ecosystems absorb CO₂ 10× faster',
    body: 'Seagrass, mangroves and saltmarshes sequester carbon far faster than tropical forests. Companies funding blue carbon credits are gaining traction in voluntary markets.',
  },
  {
    icon: '🚗',
    tag: 'EV Transition',
    title: 'EV battery costs fell 97% since 1991',
    body: 'In 1991, a lithium-ion battery pack cost ~$7,500/kWh. In 2024 that dropped to under $100/kWh, putting EVs at purchase price parity with ICE vehicles without subsidies.',
  },
  {
    icon: '💨',
    tag: 'Wind Energy',
    title: 'Offshore wind generates power for 30+ years',
    body: "Modern offshore turbines last 25–35 years. The UK's Hornsea 3 project will power 3.3 million homes annually — larger than the population of the city of Manchester.",
  },
  {
    icon: '🔋',
    tag: 'Storage',
    title: 'Grid-scale batteries are rewriting energy markets',
    body: 'Utility-scale battery storage deployments grew 89% in 2023, allowing solar & wind to deliver power after dark and during lulls — effectively solving intermittency at scale.',
  },
];

// ═══════════════════════════════════════════════════════════════
// GREEN EQUITY SIMULATOR — trading.js
// Member 5: Buy/sell logic, portfolio rendering, ticker tape
// ═══════════════════════════════════════════════════════════════

// ─── TICKER TAPE ─────────────────────────────────────────────────
// Builds the scrolling ticker tape at the top of the page
function buildTicker() {
  const items = STOCKS.map(s => {
    const chg  = changesPct[s.ticker] || 0;
    const sign = chg >= 0 ? '+' : '';
    const cls  = chg >= 0 ? 'up' : 'down';
    return `<span class="ticker-item">
      <span class="sym">${s.ticker}</span>
      $${prices[s.ticker].toFixed(2)}
      <span class="${cls}">${sign}${chg.toFixed(2)}%</span>
    </span>`;
  }).join('');
  // Duplicate for seamless infinite scroll
  document.getElementById('tickerInner').innerHTML = items + items;
}

// ─── STOCK LIST RENDERING ─────────────────────────────────────────
// Renders the filterable list of green stocks on the Market page
function renderStocks() {
  const filter   = document.getElementById('sectorFilter').value;
  const filtered = filter === 'all' ? STOCKS : STOCKS.filter(s => s.sector === filter);

  document.getElementById('stockList').innerHTML = filtered.map(s => {
    const px    = prices[s.ticker];
    const chg   = changesPct[s.ticker] || 0;
    const sign  = chg >= 0 ? '+' : '';
    const cls   = chg >= 0 ? 'up' : 'down';
    const color = SECTOR_COLORS[s.sector] || '#4ade80';

    return `<div class="stock-row" onclick="selectStock('${s.ticker}')">
      <div class="stock-icon" style="background:${color}22;">${s.icon}</div>
      <div>
        <div class="stock-name">${s.name}</div>
        <div class="stock-ticker-sub">${s.ticker} &middot; ${s.sector}</div>
      </div>
      <div style="text-align:right;">
        <div style="font-family:var(--mono);font-size:0.88rem;">$${px.toFixed(2)}</div>
      </div>
      <div style="text-align:right;">
        <div style="font-family:var(--mono);font-size:0.78rem;" class="${cls}">${sign}${chg.toFixed(2)}%</div>
        <div style="font-size:0.65rem;color:var(--muted);font-family:var(--mono);">${dataIsReal ? 'vs prev close' : 'demo'}</div>
      </div>
    </div>`;
  }).join('');
}

// ─── SECTOR PERFORMANCE ──────────────────────────────────────────
// Shows average % change by sector in the Market page sidebar
function renderSectorPerf() {
  const sectors = [...new Set(STOCKS.map(s => s.sector))];

  document.getElementById('sectorPerf').innerHTML = sectors.map(sec => {
    const stks = STOCKS.filter(s => s.sector === sec);
    const avg  = stks.reduce((a, s) => a + (changesPct[s.ticker] || 0), 0) / stks.length;
    const cls  = avg >= 0 ? 'up' : 'down';

    return `<div class="sector-row">
      <span class="sector-lbl">${sec}</span>
      <div class="sector-bar-wrap">
        <div class="sector-bar" style="width:${Math.min(100, Math.abs(avg) * 8 + 30)}%;background:${SECTOR_COLORS[sec]};"></div>
      </div>
      <span class="sector-pct ${cls}">${avg >= 0 ? '+' : ''}${avg.toFixed(2)}%</span>
    </div>`;
  }).join('');
}

// ─── STOCK SELECTION (opens buy panel) ───────────────────────────
function selectStock(ticker) {
  selectedStock = ticker;
  const s   = STOCKS.find(x => x.ticker === ticker);
  const px  = prices[ticker];
  const chg = changesPct[ticker] || 0;

  document.getElementById('buyPanel').classList.add('open');
  document.getElementById('buyTitle').textContent = `Buy ${s.name}`;
  document.getElementById('buySubtitle').innerHTML =
    `<span style="font-family:var(--mono);">$${px.toFixed(2)}</span>
     · ${s.sector} ·
     <span class="${chg >= 0 ? 'up' : 'down'}" style="font-family:var(--mono);font-size:0.78rem;">
       ${chg >= 0 ? '+' : ''}${chg.toFixed(2)}% ${dataIsReal ? 'today' : '(demo)'}
     </span>`;

  document.getElementById('buyQty').value = 1;
  updateBuyCost();
}

// ─── CLOSE BUY PANEL ─────────────────────────────────────────────
function closeBuy() {
  document.getElementById('buyPanel').classList.remove('open');
  selectedStock = null;
}

// ─── UPDATE BUY COST PREVIEW ──────────────────────────────────────
// Called every time the quantity input changes
function updateBuyCost() {
  if (!selectedStock) return;
  const qty = parseInt(document.getElementById('buyQty').value) || 0;
  const px  = prices[selectedStock];
  const s   = STOCKS.find(x => x.ticker === selectedStock);

  document.getElementById('buyCost').textContent    = `= $${(qty * px).toFixed(2)}`;
  document.getElementById('buyCarbon').textContent  = `☘️ This trade offsets ~${(qty * px * s.co2).toFixed(1)} kg CO₂/yr`;
}

// ─── EXECUTE BUY ─────────────────────────────────────────────────
// Validates and processes a stock purchase
function executeBuy() {
  if (!selectedStock) return;

  const qty  = parseInt(document.getElementById('buyQty').value) || 0;
  const px   = prices[selectedStock];
  const cost = qty * px;

  if (qty <= 0)    return showToast('Enter a valid quantity');
  if (cost > cash) return showToast('Insufficient cash balance');

  // Deduct cash
  cash -= cost;

  // Update holdings with weighted average cost
  if (!holdings[selectedStock]) holdings[selectedStock] = { shares: 0, avgCost: 0 };
  const h      = holdings[selectedStock];
  h.avgCost    = (h.avgCost * h.shares + cost) / (h.shares + qty);
  h.shares    += qty;

  // Refresh UI
  updateSummary();
  renderStocks();
  buildTicker();
  showToast(`Bought ${qty} × ${selectedStock} for $${cost.toFixed(2)}`);
  closeBuy();
}

// ─── PORTFOLIO RENDERING ──────────────────────────────────────────
// Renders holdings table and summary stats on the Portfolio page
function renderPortfolio() {
  const tickers = Object.keys(holdings).filter(t => holdings[t].shares > 0);
  let totalInvested = 0, totalCurrent = 0;

  const rows = tickers.map(t => {
    const h        = holdings[t];
    const s        = STOCKS.find(x => x.ticker === t);
    const px       = prices[t];
    const cur      = h.shares * px;
    const inv      = h.shares * h.avgCost;
    totalInvested += inv;
    totalCurrent  += cur;
    const pnl      = cur - inv;
    const pnlPct   = ((pnl / inv) * 100).toFixed(2);
    const todayChg = changesPct[t] || 0;
    const cls      = pnl >= 0 ? 'up' : 'down';

    return `<div class="portfolio-row">
      <div>
        <div style="font-weight:500;">${s.name}</div>
        <div class="stock-ticker-sub">${t} · ${h.shares} shares <span class="pf-tag">${s.sector}</span></div>
        <div style="font-size:0.68rem;color:var(--muted);font-family:var(--mono);margin-top:2px;">
          avg cost $${h.avgCost.toFixed(2)} · today
          <span class="${todayChg >= 0 ? 'up' : 'down'}">${todayChg >= 0 ? '+' : ''}${todayChg.toFixed(2)}%</span>
        </div>
      </div>
      <div style="font-family:var(--mono);font-size:0.85rem;text-align:right;">$${cur.toFixed(2)}</div>
      <div style="font-family:var(--mono);font-size:0.82rem;text-align:right;" class="${cls}">${pnl >= 0 ? '+' : '-'}$${Math.abs(pnl).toFixed(2)}</div>
      <div style="font-family:var(--mono);font-size:0.78rem;text-align:right;" class="${cls}">${pnl >= 0 ? '+' : ''}${pnlPct}%</div>
    </div>`;
  }).join('');

  document.getElementById('holdingsList').innerHTML = rows ||
    '<div style="font-size:0.85rem;color:var(--muted);padding:1rem 0;text-align:center;">No positions yet — head to Market to buy your first green stock.</div>';

  // Summary row
  const pnl   = totalCurrent - totalInvested;
  const total = cash + totalCurrent;

  document.getElementById('pfTotal').textContent    = '$' + total.toFixed(2);
  document.getElementById('pfInvested').textContent = '$' + totalInvested.toFixed(2);

  const pel        = document.getElementById('pfPnL');
  pel.textContent  = (pnl >= 0 ? '+$' : '-$') + Math.abs(pnl).toFixed(2);
  pel.className    = 'text-mono ' + (pnl >= 0 ? 'up' : 'down');
  pel.style.fontSize = '1.6rem';

  renderPfChart();
}

// ─── SUMMARY UPDATE (runs on interval) ───────────────────────────
// Updates the nav bar value and hero stats; appends to history arrays
function updateSummary() {
  let cur = 0;
  Object.keys(holdings).forEach(t => { cur += (holdings[t].shares || 0) * prices[t]; });

  const total  = cash + cur;
  const roi    = ((total / 10000 - 1) * 100).toFixed(2);
  const { total: co2 } = calcCO2();

  document.getElementById('navVal').textContent      = '$' + total.toFixed(2);
  document.getElementById('cashDisplay').textContent = '$' + cash.toFixed(0);
  document.getElementById('co2Hero').textContent     = Math.round(co2) + ' kg';

  const re     = document.getElementById('roiHero');
  re.textContent = (roi >= 0 ? '+' : '') + roi + '%';
  re.className   = 'val ' + (roi >= 0 ? 'up' : 'down');

  // Append to history (capped at 60 data points)
  pfHistory.push(+total.toFixed(2));
  if (pfHistory.length > 60) pfHistory.shift();

  carbonHistory.push(Math.round(co2));
  if (carbonHistory.length > 60) carbonHistory.shift();

  // Animate the green index chart
  if (indexChartInst) {
    const last = indexHistory[indexHistory.length - 1];
    indexHistory.push(+(last * (1 + (Math.random() - 0.47) * 0.008)).toFixed(0));
    if (indexHistory.length > 60) indexHistory.shift();
    indexChartInst.data.labels   = indexHistory.map((_, i) => i);
    indexChartInst.data.datasets[0].data = indexHistory;
    indexChartInst.update('none');
  }
}

// ─── LEARN PAGE ───────────────────────────────────────────────────
// Renders educational insight cards from data.js
function renderLearn() {
  document.getElementById('insightsList').innerHTML = INSIGHTS.map(i =>
    `<div class="insight-card">
      <div class="insight-icon">${i.icon}</div>
      <div>
        <div class="insight-title">${i.title}</div>
        <div class="insight-body">${i.body}</div>
        <span class="insight-tag">${i.tag}</span>
      </div>
    </div>`
  ).join('');
}

// ─── BOOT ─────────────────────────────────────────────────────────
// Initialize app on page load
buildTicker();
renderStocks();
renderSectorPerf();
updateSummary();

// Auto-refresh summary every 8 seconds (simulates live price movement)
setInterval(updateSummary, 8000);

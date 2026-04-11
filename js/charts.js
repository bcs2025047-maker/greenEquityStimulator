const baseOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: '#111811',
      titleColor:      '#4ade80',
      bodyColor:       '#6b8f6b',
      borderColor:     '#1e321e',
      borderWidth:      1,
    },
  },
  scales: {
    x: { display: false },
    y: {
      display: true,
      grid:  { color: '#1e321e' },
      ticks: { color: '#6b8f6b', font: { family: "'DM Mono'", size: 10 } },
    },
  },
  elements: {
    point: { radius: 0 },
    line:  { tension: 0.4, borderWidth: 2 },
  },
  animation: { duration: 300 },
};

function initIndexChart() {
  indexChartInst = new Chart(document.getElementById('indexChart'), {
    type: 'line',
    data: {
      labels:   indexHistory.map((_, i) => i),
      datasets: [{
        data:            indexHistory,
        borderColor:     '#4ade80',
        fill:            true,
        backgroundColor: 'rgba(74,222,128,0.07)',
      }],
    },
    options: { ...baseOpts },
  });
}


function renderPfChart() {
  if (pfChartInst) pfChartInst.destroy();
  pfChartInst = new Chart(document.getElementById('pfChart'), {
    type: 'line',
    data: {
      labels:   pfHistory.map((_, i) => i),
      datasets: [{
        data:            pfHistory,
        borderColor:     '#4ade80',
        fill:            true,
        backgroundColor: 'rgba(74,222,128,0.07)',
      }],
    },
    options: { ...baseOpts },
  });
}

function renderCarbonChart() {
  if (carbonChartInst) carbonChartInst.destroy();
  carbonChartInst = new Chart(document.getElementById('carbonChart'), {
    type: 'line',
    data: {
      labels:   carbonHistory.map((_, i) => i),
      datasets: [{
        data:            carbonHistory,
        borderColor:     '#22c55e',
        fill:            true,
        backgroundColor: 'rgba(34,197,94,0.07)',
      }],
    },
    options: { ...baseOpts },
  });
}

function calcCO2() {
  let total = 0;
  const byS = {};

  Object.keys(holdings).forEach(t => {
    const h   = holdings[t];
    const s   = STOCKS.find(x => x.ticker === t);
    const val = h.shares * prices[t];
    const co2 = val * s.co2;
    total    += co2;
    byS[s.sector] = (byS[s.sector] || 0) + co2;
  });

  return { total, byS };
}

function renderImpact() {
  const { total, byS } = calcCO2();

  document.getElementById('co2Big').textContent  = Math.round(total).toLocaleString();
  document.getElementById('co2Bar').style.width  = Math.min(100, (total / 5000) * 100) + '%';
  document.getElementById('co2Equiv').textContent = `Equivalent to planting ${Math.round(total / 21)} trees`;

  document.getElementById('treesEq').textContent  = Math.round(total / 21);
  document.getElementById('kwh').textContent      = Math.round(total * 1.2).toLocaleString();
  document.getElementById('carMiles').textContent = Math.round(total * 4.3).toLocaleString();

  const maxS = Math.max(1, ...Object.values(byS));
  document.getElementById('sectorBreakdown').innerHTML =
    Object.entries(byS).map(([sec, val]) => {
      const pct = Math.round((val / maxS) * 100);
      return `<div class="sector-row">
        <span class="sector-lbl">${sec}</span>
        <div class="sector-bar-wrap">
          <div class="sector-bar" style="width:${pct}%;background:${SECTOR_COLORS[sec] || '#4ade80'};"></div>
        </div>
        <span class="sector-pct up">${Math.round(val)} kg</span>
      </div>`;
    }).join('') ||
    '<span style="font-size:0.82rem;color:var(--muted);">Make trades to see sector breakdown.</span>';

  renderCarbonChart();
}

initIndexChart();

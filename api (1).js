let cash         = 10000;             
let holdings     = {};                
let prices       = { ...DEMO_PRICES };
let changesPct   = { ...DEMO_CHG };   
let dataIsReal   = false;             
let selectedStock = null;          


let pfHistory      = [10000];          
let carbonHistory  = new Array(20).fill(0);
let indexHistory   = genIndexHistory(20);  


let indexChartInst, pfChartInst, carbonChartInst;

function genIndexHistory(n) {
  const a = [];
  let v = 1000;
  for (let i = 0; i < n; i++) {
    v = Math.max(500, v * (1 + (Math.random() - 0.46) * 0.025));
    a.push(+v.toFixed(0));
  }
  return a;
}

function showPage(id, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-pill').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  if (btn) btn.classList.add('active');
  if (id === 'portfolio') renderPortfolio();
  if (id === 'impact')    renderImpact();
  if (id === 'learn')     renderLearn();
}


async function loadAllPrices() {
  const key    = document.getElementById('apiKeyInput').value.trim();
  const btn    = document.getElementById('loadBtn');
  const status = document.getElementById('apiStatus');

  if (!key) {
    showToast('⚠ Enter your Alpha Vantage API key first');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Loading…';
  status.innerHTML = '<span class="spinner"></span>Fetching real prices…';

  const tickers = STOCKS.map(s => s.ticker);
  let ok = 0, fail = 0;

  for (const ticker of tickers) {
    try {
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${key}`;
      const res  = await fetch(url);
      if (!res.ok) throw new Error('HTTP ' + res.status);

      const data = await res.json();
      const q    = data['Global Quote'];

      if (q && q['05. price'] && parseFloat(q['05. price']) > 0) {
        prices[ticker]     = parseFloat(q['05. price']);
        const prev         = parseFloat(q['08. previous close']) || prices[ticker];
        changesPct[ticker] = parseFloat((q['10. change percent'] || '0%').replace('%', ''));
        ok++;
      } else {
        fail++;
        // Handle rate limit messages from Alpha Vantage
        const msg = data['Note'] || data['Information'] || '';
        if (msg) {
          status.textContent = '⚠ Rate limit reached — wait 60s and try again (free: 25 req/day)';
          btn.disabled = false;
          btn.textContent = 'Load real prices';
          return;
        }
      }
    } catch (e) {
      fail++;
    }

    // Respect free tier rate limits (5 req/min → 250ms gap)
    await new Promise(r => setTimeout(r, 250));
  }

  btn.disabled    = false;
  btn.textContent = '↻ Refresh';

  if (ok > 0) {
    // Switch UI to "live data" mode
    dataIsReal = true;
    document.getElementById('apiBanner').classList.add('ok');
    document.getElementById('bannerLabel').textContent     = '✓ LIVE DATA';
    document.getElementById('dataSourceBadge').className  = 'real-badge';
    document.getElementById('dataSourceBadge').textContent = 'LIVE PRICES';
    status.textContent = `${ok} stocks loaded${fail ? `, ${fail} unavailable` : ''} · Updated ${new Date().toLocaleTimeString()}`;
    showToast(`✓ Real market data loaded for ${ok} stocks`);
  } else {
    status.textContent = '✗ No data received — check your API key';
    showToast('Could not load prices — verify API key');
  }

  renderStocks();
  buildTicker();
  renderSectorPerf();
  updateSummary();
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3200);
}

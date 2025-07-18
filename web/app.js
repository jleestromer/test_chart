// app.js
const { useState, useEffect, useRef } = React;

const smaColors = {
  10: '#f39c12',
  20: '#e67e22',
  50: '#2980b9',
  100: '#8e44ad'
};

function generateData(points) {
  const data = [];
  const volumes = [];
  let price = 100;
  for (let i = 0; i < points; i++) {
    const open = price + (Math.random() - 0.5) * 2;
    const close = open + (Math.random() - 0.5) * 2;
    const high = Math.max(open, close) + Math.random();
    const low = Math.min(open, close) - Math.random();
    const time = Date.UTC(2023, 0, i + 1);
    data.push([time, +open.toFixed(2), +high.toFixed(2), +low.toFixed(2), +close.toFixed(2)]);
    volumes.push([time, Math.round(Math.random() * 1000 + 100)]);
    price = close;
  }
  return { ohlc: data, volume: volumes };
}

const datasets = {
  IBM: generateData(730),
  AAPL: generateData(730),
  GOOG: generateData(730)
};

function App() {
  const [ticker, setTicker] = useState('IBM');
  const [smas, setSmas] = useState({10: false, 20: false, 50: true, 100: false});
  const [range, setRange] = useState('1Y');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [showSmaPicker, setShowSmaPicker] = useState(false);
  const chartRef = useRef(null);

  const applyRange = () => {
    const chart = chartRef.current;
    if (!chart) return;
    const data = chart.series[0]?.xData;
    if (!data || !data.length) return;

    let max = data[data.length - 1];
    let min = data[0];
    const day = 24 * 3600 * 1000;
    switch (range) {
      case '1M': min = max - 30 * day; break;
      case '3M': min = max - 90 * day; break;
      case '6M': min = max - 180 * day; break;
      case 'YTD': min = Date.UTC(new Date(max).getUTCFullYear(), 0, 1); break;
      case '1Y': min = max - 365 * day; break;
      case 'All': min = data[0]; break;
      case 'Custom':
        if (customStart && customEnd) {
          min = Date.parse(customStart);
          max = Date.parse(customEnd);
        }
        break;
    }
    chart.xAxis[0].setExtremes(min, max);
  };

  const initChart = () => {
    if (!datasets[ticker]) datasets[ticker] = generateData(730);
    const data = datasets[ticker];

    const prevChart = chartRef.current;
    const prevExt = prevChart ? prevChart.xAxis[0].getExtremes() : null;
    if (prevChart) prevChart.destroy();

    chartRef.current = Highcharts.stockChart('chart', {
      chart: { backgroundColor: '#fff' },
      rangeSelector: { selected: 4, inputDateFormat: '%Y-%m-%d' },
      title: { text: ticker + ' Stock Price' },
      plotOptions: {
        series: {
          marker: { enabled: false },
          states: { hover: { enabled: false } }
        }
      },
      yAxis: [
        {
          labels: { align: 'right', x: -3 },
          title: { text: 'Price' },
          height: '100%',
          resize: { enabled: true },
          crosshair: {
            color: 'red',
            snap: false,
            label: {
              enabled: true,
              format: '{value:.2f}',
              backgroundColor: '#fff',
              borderColor: 'red',
              style: { color: 'red' }
            }
          }
        },
        {
          visible: false,
          top: 0,
          height: '100%',
          offset: 0
        }
      ],
      tooltip: { split: false },
      series: [
        {
          type: 'candlestick',
          id: 'ohlc',
          name: ticker,
          data: data.ohlc,
          pointWidth: 5,
          zIndex: 2
        },
        {
          type: 'column',
          id: 'volume',
          name: 'Volume',
          data: data.volume,
          yAxis: 1,
          opacity: 0.3,
          zIndex: 0
        }
      ]
    });
    if (prevExt) {
      chartRef.current.xAxis[0].setExtremes(prevExt.min, prevExt.max, false);
    } else {
      applyRange();
    }
  };

  const updateSmas = () => {
    const chart = chartRef.current;
    if (!chart) return;
    const ext = chart.xAxis[0].getExtremes();
    let changed = false;
    Object.keys(smas).forEach(period => {
      const id = `sma-${period}`;
      const existing = chart.get(id);
      if (smas[period]) {
        if (!existing) {
          chart.addSeries({
            id,
            type: 'sma',
            linkedTo: 'ohlc',
            name: `SMA ${period}`,
            params: { period: Number(period) },
            color: smaColors[period],
            marker: { enabled: false }
          }, false);
          changed = true;
        }
      } else if (existing) {
        existing.remove(false);
        changed = true;
      }
    });
    if (changed) {
      chart.redraw(false);
      chart.xAxis[0].setExtremes(ext.min, ext.max, false);
    }
  };

  useEffect(() => { initChart(); }, [ticker]);
  useEffect(() => { updateSmas(); }, [smas]);
  useEffect(() => { applyRange(); }, [range, customStart, customEnd]);

  const handleSmaChange = (period) => setSmas(prev => ({ ...prev, [period]: !prev[period] }));

  return (
    React.createElement('div', null,
      React.createElement('div', { className: 'chart-header' },
        React.createElement('div', { className: 'ticker-symbol' }, ticker),
        React.createElement('div', { className: 'price-info' },
          React.createElement('span', { className: 'price' }, '280.60'),
          React.createElement('span', { className: 'price-change' }, '(-0.74%)'),
          React.createElement('span', { className: 'ohlc' }, 'O 282.75 H 283.87 L 280.51 C 280.60'),
          React.createElement('span', { className: 'volume' }, 'Vol 528.5K')
        )
      ),
      React.createElement('div', { className: 'controls' },
        React.createElement('label', null, 'Ticker:',
          React.createElement('input', { value: ticker, onChange: e => setTicker(e.target.value.toUpperCase().trim()), list: 'tickers' })
        ),
        React.createElement('datalist', { id: 'tickers' },
          Object.keys(datasets).map(key => React.createElement('option', { key }, key))
        ),
        React.createElement('label', null, ' Range:',
          React.createElement('select', { value: range, onChange: e => setRange(e.target.value) },
            ['1M','3M','6M','YTD','1Y','All','Custom'].map(r =>
              React.createElement('option', { key: r, value: r }, r)
            )
          )
        ),
        range === 'Custom' && React.createElement(React.Fragment, null,
          React.createElement('input', { type: 'date', value: customStart, onChange: e => setCustomStart(e.target.value) }),
          React.createElement('input', { type: 'date', value: customEnd, onChange: e => setCustomEnd(e.target.value) })
        ),
        React.createElement('button', { onClick: () => setShowSmaPicker(true) }, 'Indicators')
      ),
      React.createElement('div', { className: 'sma-legend' },
        Object.entries(smas).map(([period, enabled]) => enabled && (
          React.createElement('div', { key: period, className: `legend-item sma-${period}` },
            React.createElement('span', { className: 'color-box', style: { background: smaColors[period] } }), ` SMA(${period})`
          )
        ))
      ),
      showSmaPicker &&
        React.createElement('div', { className: 'sma-popup', onClick: () => setShowSmaPicker(false) },
          React.createElement('div', { className: 'popup-content', onClick: e => e.stopPropagation() },
            Object.keys(smas).map(period => (
              React.createElement('label', { key: period },
                React.createElement('input', {
                  type: 'checkbox',
                  checked: smas[period],
                  onChange: () => handleSmaChange(period)
                }),
                ` SMA ${period}`
              )
            )),
            React.createElement('button', { onClick: () => setShowSmaPicker(false) }, 'Close')
          )
        ),
      React.createElement('div', { id: 'chart' })
    )
  );
}

ReactDOM.createRoot(document.getElementById('app')).render(React.createElement(App));

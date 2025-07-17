const { useState, useEffect, useRef } = React;

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
    data.push([time, open.toFixed(2) * 1, high.toFixed(2) * 1, low.toFixed(2) * 1, close.toFixed(2) * 1]);
    volumes.push([time, Math.round(Math.random() * 1000 + 100)]);
    price = close;
  }
  return { ohlc: data, volume: volumes };
}

const datasets = {
  AAPL: generateData(730),
  GOOG: generateData(730)
};

function App() {
  const [ticker, setTicker] = useState('AAPL');
  const [smas, setSmas] = useState({10: false, 20: false, 50: false, 100: false});
  const [range, setRange] = useState('1Y');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const chartRef = useRef(null);

  const applyRange = () => {
    const chart = chartRef.current;
    if (!chart) return;
    const data = chart.series[0] && chart.series[0].xData;
    if (!data || !data.length) return;
    let max = data[data.length - 1];
    let min = data[0];
    const day = 24 * 3600 * 1000;
    switch (range) {
      case '1M':
        min = max - 30 * day; break;
      case '3M':
        min = max - 90 * day; break;
      case '6M':
        min = max - 180 * day; break;
      case 'YTD': {
        const d = new Date(max);
        min = Date.UTC(d.getUTCFullYear(), 0, 1);
        break;
      }
      case '1Y':
        min = max - 365 * day; break;
      case 'All':
        min = data[0]; break;
      case 'Custom':
        if (customStart && customEnd) {
          min = Date.parse(customStart);
          max = Date.parse(customEnd);
        }
        break;
    }
    chart.xAxis[0].setExtremes(min, max);
  };

  const redraw = () => {
    const data = datasets[ticker];
    const series = [
      {
        type: 'candlestick',
        id: 'ohlc',
        name: ticker,
        data: data.ohlc
      },
      {
        type: 'column',
        id: 'volume',
        name: 'Volume',
        data: data.volume,
        yAxis: 1
      }
    ];
    Object.keys(smas).forEach(period => {
      if (smas[period]) {
        series.push({
          type: 'sma',
          linkedTo: 'ohlc',
          name: `SMA ${period}`,
          params: { period: Number(period) }
        });
      }
    });

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = Highcharts.stockChart('chart', {
      rangeSelector: { selected: 4, inputDateFormat: '%Y-%m-%d' },
      title: { text: ticker + ' Stock Price' },
      yAxis: [{ labels: { align: 'right', x: -3 }, title: { text: 'Price' }, height: '60%', resize: { enabled: true },
        crosshair: {
          color: 'red',
          snap: false,
          label: { enabled: true, format: '{value:.2f}', backgroundColor: '#fff', borderColor: 'red', style: { color: 'red' } }
        }
      }, { labels: { align: 'right', x: -3 }, title: { text: 'Volume' }, top: '65%', height: '35%', offset: 0 }],
      tooltip: { split: false },
      series
    });
    applyRange();
  };

  useEffect(() => { redraw(); }, [ticker, smas]);
  useEffect(() => { applyRange(); }, [range, customStart, customEnd]);

  const handleSmaChange = (period) => {
    setSmas(prev => ({ ...prev, [period]: !prev[period] }));
  };

  return (
    React.createElement('div', null,
      React.createElement('div', { className: 'controls' },
        React.createElement('label', null, 'Ticker:',
          React.createElement('input', { value: ticker, onChange: e => setTicker(e.target.value.toUpperCase()), list: 'tickers' })),
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
        React.createElement('div', { className: 'sma-list' },
          Object.keys(smas).map(period => (
            React.createElement('label', { key: period },
              React.createElement('input', {
                type: 'checkbox',
                checked: smas[period],
                onChange: () => handleSmaChange(period)
              }),
              ` SMA ${period}`
            )
          ))
        )
      ),
      React.createElement('div', { id: 'chart' })
    )
  );
}

ReactDOM.createRoot(document.getElementById('app')).render(React.createElement(App));

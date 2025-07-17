# Highcharts Stock Test

This repository contains a simple demo implementing the requirements from the technical document.

The `web` folder hosts a small React based page that renders a candlestick chart using **Highcharts**. Features:

- Ticker input with two dummy symbols (`AAPL` and `GOOG`).
- Toggle four predefined SMA lines (10, 20, 50 and 100).
- Built in range selector (1M, 3M, 6M, YTD, 1Y, All or custom dates).
- Crosshair that shows the price under the cursor in red.
- Dummy OHLCV data for two years so you can test different ranges.
- Responsive behaviour and dynamic redraw when options change.

Launch a small web server in the `web` folder so the local scripts load:

```bash
cd web
python3 -m http.server 8000
```

Then browse to <http://localhost:8000>.

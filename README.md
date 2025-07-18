# Highcharts Stock Test

This repository contains a simple demo implementing the requirements from the technical document.

The `web` folder hosts a small React based page that renders a candlestick chart using **Highcharts**. Features:

- Ticker input with two dummy symbols (`AAPL` and `GOOG`).
- Toggle four predefined SMA lines (10, 20, 50 and 100) using the **Indicators** popup.
- Built in range selector (1M, 3M, 6M, YTD, 1Y, All or custom dates).
- Crosshair that shows the price under the cursor in red.
- Dummy OHLCV data for two years so you can test different ranges.
- Responsive behaviour and dynamic redraw when options change.

Install the dependencies and start a small static server:

```bash
npm install
npm start
```

This runs [http-server](https://www.npmjs.com/package/http-server) at <http://localhost:8000>. Open <http://localhost:8000> in your browser to see the chart. On Windows open *Command Prompt* or *PowerShell*, navigate to the project folder and run the same commands.

Because the site is completely static you can host it for free. Two options:

1. **GitHub Pages** – create a repository, push this project and enable Pages in the repository settings. Point Pages to the root (or `web`) folder.
2. **Netlify** – sign up for a free account and drag&drop the project folder or connect your Git repository. Set the publish directory to `web`.

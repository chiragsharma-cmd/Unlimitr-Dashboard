# Unlimitr Analytics Dashboard

A modern, high-performance web dashboard for analytics, user cohorts, and performance insights.

## Features
- **Overview Analytics**: Real-time metric cards, growth trajectories, and KPI monitoring.
- **Cohort Analysis**: Deep dive into New vs. Returning Users and Engagement patterns.
- **Interactive Visualizations**: Powered by Chart.js with responsive datasets.
- **Fast & Zero-Dependency Dev Server**: PowerShell-based lightweight HTTP server included.

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Edge, Firefox, Safari)

### Running Locally
To launch the local dev server on Windows:
```powershell
powershell -ExecutionPolicy Bypass -File .\serve.ps1
```
Or open `index.html` directly in your browser.

Access the dashboard at:
```
http://localhost:8000/
```

## Project Structure
```
├── assets/         # Images, screenshots, and visual branding
├── app.js          # Core application logic and analytics rendering
├── index.html      # Main dashboard interface
├── package.json    # Optional build / Vite scripts
├── serve.ps1       # Zero-dependency local PowerShell web server
└── style.css       # Design system and custom styles
```

"""FastAPI web dashboard for the trading bot."""

import os
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.responses import HTMLResponse
import secrets


security = HTTPBasic()

DASHBOARD_PASSWORD = os.getenv("DASHBOARD_PASSWORD", "admin")

_last_result: dict = {}
_core = None


def create_app(core=None):
    global _core
    _core = core
    app = FastAPI(title="Agentic-OS Trading Bot")

    def check_auth(creds: HTTPBasicCredentials = Depends(security)):
        ok = secrets.compare_digest(creds.password.encode(), DASHBOARD_PASSWORD.encode())
        if not ok:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
        return creds.username

    @app.get("/", response_class=HTMLResponse)
    def index(user=Depends(check_auth)):
        return _html_dashboard()

    @app.get("/api/status")
    def api_status(user=Depends(check_auth)):
        if _core is None:
            return {"status": "no core"}
        rm = _core.risk_mgr
        return {
            "symbol": _core.symbol,
            "halted": rm.state.halted,
            "halt_reason": rm.state.halt_reason,
            "total_trades": rm.state.total_trades,
            "win_rate": f"{rm.win_rate*100:.1f}%",
            "consecutive_losses": rm.state.consecutive_losses,
        }

    @app.post("/api/resume")
    def api_resume(user=Depends(check_auth)):
        if _core:
            _core.risk_mgr.resume()
        return {"status": "resumed"}

    @app.post("/api/cycle")
    def api_cycle(user=Depends(check_auth)):
        if _core is None:
            return {"error": "no core"}
        result = _core.run_cycle()
        global _last_result
        _last_result = result
        return result

    return app


def _html_dashboard() -> str:
    return """
<!DOCTYPE html>
<html>
<head>
  <title>Agentic-OS Trading Bot</title>
  <meta http-equiv="refresh" content="30">
  <style>
    body { font-family: monospace; background: #0d1117; color: #c9d1d9; padding: 2rem; }
    h1 { color: #58a6ff; }
    .card { background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 1rem; margin: 1rem 0; }
    button { background: #238636; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
    button:hover { background: #2ea043; }
  </style>
</head>
<body>
  <h1>Agentic-OS — Kimi K2.6 + Hermes Trading Bot</h1>
  <div class="card">
    <h2>Status</h2>
    <div id="status">Loading...</div>
  </div>
  <div class="card">
    <h2>Controls</h2>
    <button onclick="runCycle()">Run Cycle Now</button>
    <button onclick="resume()" style="background:#6e7681; margin-left:1rem">Resume Trading</button>
  </div>
  <div class="card">
    <h2>Last Result</h2>
    <pre id="result"></pre>
  </div>
  <script>
    async function loadStatus() {
      const r = await fetch('/api/status');
      const d = await r.json();
      document.getElementById('status').innerHTML =
        '<pre>' + JSON.stringify(d, null, 2) + '</pre>';
    }
    async function runCycle() {
      const r = await fetch('/api/cycle', {method: 'POST'});
      const d = await r.json();
      document.getElementById('result').textContent = JSON.stringify(d, null, 2);
    }
    async function resume() {
      await fetch('/api/resume', {method: 'POST'});
      loadStatus();
    }
    loadStatus();
    setInterval(loadStatus, 15000);
  </script>
</body>
</html>
"""

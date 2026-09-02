/**
 * CAFFY Tracking Worker
 * Route: track.getcaffy.com/:awb
 *
 * Deploy via Cloudflare Workers dashboard or wrangler.
 * Set secrets (optional, falls back to hardcoded):
 *   JEEBLY_API_KEY
 *   JEEBLY_CLIENT_KEY
 */

const JEEBLY_API_KEY    = ''; // set as Worker secret (Keychain: caffy-jeebly)
const JEEBLY_CLIENT_KEY = ''; // set as Worker secret (Keychain: caffy-jeebly)

const STATUS_MAP = {
  'pickup_scheduled':  { label: 'Pickup Scheduled',  color: '#00ccff', step: 1 },
  'pickup_completed':  { label: 'Pickup Completed',  color: '#00ccff', step: 2 },
  'inscan_at_hub':     { label: 'At Hub',            color: '#00ccff', step: 3 },
  'out_for_delivery':  { label: 'Out for Delivery',  color: '#00ffff', step: 4 },
  'delivered':         { label: 'Delivered',         color: '#00ff88', step: 5 },
  'undelivered':       { label: 'Delivery Failed',   color: '#ff4444', step: 0 },
  'on_hold':           { label: 'On Hold',           color: '#ffaa00', step: 0 },
  'rto':               { label: 'Return to Origin',  color: '#ff4444', step: 0 },
  'rto_delivered':     { label: 'Returned',          color: '#ff4444', step: 0 },
  'cancelled':         { label: 'Cancelled',         color: '#888888', step: 0 },
  'rescheduled':       { label: 'Rescheduled',       color: '#ffaa00', step: 0 },
};

const STEPS = [
  { key: 'pickup_scheduled', label: 'Order Picked Up' },
  { key: 'pickup_completed', label: 'Collected' },
  { key: 'inscan_at_hub',    label: 'At Hub' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered',        label: 'Delivered' },
];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const awb = url.pathname.replace(/^\//, '').trim().toUpperCase();

    if (!awb) {
      return html(renderShell('', null, 'Enter your tracking number in the URL: track.getcaffy.com/YOUR-AWB-NUMBER'));
    }

    const apiKey    = env.JEEBLY_API_KEY    || JEEBLY_API_KEY;
    const clientKey = env.JEEBLY_CLIENT_KEY || JEEBLY_CLIENT_KEY;

    let tracking = null;
    let fetchError = null;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const resp = await fetch('https://myjeebly.jeebly.com/customer/track_shipment', {
        method: 'POST',
        headers: {
          'X-API-KEY':    apiKey,
          'client_key':   clientKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reference_number: awb }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const data = await resp.json();
      tracking = data.Tracking || null;
      if (!tracking && data.message) fetchError = data.message;
    } catch (e) {
      fetchError = e.name === 'AbortError'
        ? 'Tracking request timed out. Please try again.'
        : 'Unable to reach tracking service. Please try again later.';
    }

    return html(renderShell(awb, tracking, fetchError));
  }
};

function html(body) {
  return new Response(body, {
    headers: {
      'Content-Type': 'text/html;charset=UTF-8',
      'Cache-Control': 'no-store',
    },
  });
}

function renderShell(awb, tracking, errorMsg) {
  const rawStatus  = tracking ? (tracking.last_status || '').toLowerCase() : '';
  const statusInfo = STATUS_MAP[rawStatus] || { label: rawStatus || 'Pending', color: '#888888', step: 0 };
  const events     = tracking ? (tracking.events || []) : [];
  const currentStep = rawStatus === 'delivered' ? 5 : (statusInfo.step || 0);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Track Your Order — CAFFY</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0a0a0a;
      color: #cccccc;
      font-family: Helvetica, Arial, sans-serif;
      min-height: 100vh;
      padding: 20px 16px 48px;
    }
    a { color: #00ffff; text-decoration: none; }
    a:hover { text-decoration: underline; }

    .shell {
      max-width: 540px;
      margin: 0 auto;
    }

    /* HEADER */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 0 32px;
      border-bottom: 1px solid #1e1e1e;
      margin-bottom: 32px;
    }
    .header h1 {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 3px;
      color: #555;
      font-weight: 400;
    }
    .header img { height: 28px; }

    /* AWB CHIP */
    .awb-chip {
      background: #111;
      border: 1px solid #222;
      border-radius: 3px;
      padding: 10px 16px;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      color: #888;
      margin-bottom: 28px;
      letter-spacing: 1px;
    }
    .awb-chip span { color: #00ffff; }

    /* STATUS BADGE */
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      border-radius: 3px;
      background: #111;
      border: 1px solid var(--sc);
      margin-bottom: 28px;
    }
    .status-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: var(--sc);
      flex-shrink: 0;
      animation: pulse 2s ease-in-out infinite;
    }
    .status-badge.static .status-dot { animation: none; }
    @keyframes pulse {
      0%,100% { opacity: 1; }
      50%      { opacity: 0.3; }
    }
    .status-label {
      font-size: 14px;
      font-weight: 600;
      color: var(--sc);
      letter-spacing: 0.5px;
    }

    /* PROGRESS BAR */
    .progress-wrap {
      margin-bottom: 32px;
    }
    .progress-track {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      position: relative;
      padding-bottom: 8px;
    }
    .progress-track::before {
      content: '';
      position: absolute;
      top: 9px; left: 9px; right: 9px;
      height: 2px;
      background: #222;
      z-index: 0;
    }
    .progress-fill {
      position: absolute;
      top: 9px; left: 9px;
      height: 2px;
      background: #00ffff;
      z-index: 1;
      transition: width 0.5s ease;
    }
    .prog-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      z-index: 2;
      flex: 1;
    }
    .prog-dot {
      width: 18px; height: 18px;
      border-radius: 50%;
      background: #1a1a1a;
      border: 2px solid #333;
      display: flex; align-items: center; justify-content: center;
    }
    .prog-dot.done   { background: #00ffff; border-color: #00ffff; }
    .prog-dot.active { background: #003333; border-color: #00ffff; }
    .prog-dot.done::after {
      content: '';
      width: 6px; height: 6px;
      background: #000;
      border-radius: 50%;
    }
    .prog-label {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #444;
      text-align: center;
      line-height: 1.3;
      max-width: 52px;
    }
    .prog-step.done .prog-label,
    .prog-step.active .prog-label { color: #00ffff; }

    /* EVENTS TIMELINE */
    .section-title {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #444;
      margin-bottom: 14px;
    }
    .timeline {
      border-left: 2px solid #1e1e1e;
      margin-left: 6px;
      padding-left: 20px;
      margin-bottom: 32px;
    }
    .event {
      position: relative;
      margin-bottom: 20px;
    }
    .event:last-child { margin-bottom: 0; }
    .event::before {
      content: '';
      position: absolute;
      left: -27px; top: 5px;
      width: 10px; height: 10px;
      border-radius: 50%;
      background: #222;
      border: 2px solid #333;
    }
    .event:first-child::before {
      background: #003333;
      border-color: #00ffff;
    }
    .event-time {
      font-family: 'Courier New', monospace;
      font-size: 11px;
      color: #444;
      margin-bottom: 3px;
    }
    .event-desc {
      font-size: 13px;
      color: #ccc;
    }
    .event-sub {
      font-size: 11px;
      color: #555;
      margin-top: 2px;
    }

    /* ERROR / EMPTY */
    .msg-box {
      background: #111;
      border: 1px solid #222;
      border-radius: 3px;
      padding: 24px;
      text-align: center;
      color: #555;
      font-size: 13px;
      line-height: 1.6;
    }
    .msg-box .code {
      font-family: 'Courier New', monospace;
      color: #00ffff;
      font-size: 16px;
      display: block;
      margin-bottom: 8px;
    }

    /* FOOTER */
    .footer {
      border-top: 1px solid #1a1a1a;
      padding-top: 24px;
      text-align: center;
      font-size: 11px;
      color: #333;
    }
    .footer a { color: #444; }
    .footer .tag {
      font-family: 'Courier New', monospace;
      font-size: 10px;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: #00ffff;
      display: block;
      margin-top: 16px;
      opacity: 0.4;
    }
  </style>
</head>
<body>
<div class="shell">

  <div class="header">
    <h1>Order Tracking</h1>
    <a href="https://getcaffy.com">
      <img src="https://getcaffy.com/images/CAFFY%20LOGO%20white.png" alt="CAFFY">
    </a>
  </div>

  ${!awb ? renderNoAWB() : errorMsg ? renderError(awb, errorMsg) : !tracking ? renderNotFound(awb) : renderTracking(awb, tracking, statusInfo, events, currentStep)}

  <div class="footer">
    <a href="mailto:hello@getcaffy.com">hello@getcaffy.com</a> &nbsp;·&nbsp;
    <a href="https://getcaffy.com">getcaffy.com</a>
    <span class="tag">CAFFY · DUBAI, UAE</span>
  </div>

</div>
</body>
</html>`;
}

function renderNoAWB() {
  return `<div class="msg-box">
    <span class="code">track.getcaffy.com/YOUR-AWB</span>
    Enter your AWB number in the URL to track your shipment.
  </div>`;
}

function renderError(awb, msg) {
  return `
  <div class="awb-chip">AWB <span>${awb}</span></div>
  <div class="msg-box">
    ⚠ ${msg || 'Something went wrong. Please try again.'}
    <br><br>
    <a href="mailto:hello@getcaffy.com">Contact us if the issue persists →</a>
  </div>`;
}

function renderNotFound(awb) {
  return `
  <div class="awb-chip">AWB <span>${awb}</span></div>
  <div class="msg-box">
    No tracking information found for this AWB number.<br><br>
    It may take up to 2 hours after dispatch for tracking to activate.
    <br><br>
    <a href="mailto:hello@getcaffy.com">Need help? Email us →</a>
  </div>`;
}

function renderTracking(awb, tracking, statusInfo, events, currentStep) {
  const isDone     = ['delivered','rto_delivered','cancelled'].includes((tracking.last_status||'').toLowerCase());
  const isBad      = ['undelivered','on_hold','rto','cancelled'].includes((tracking.last_status||'').toLowerCase());
  const progressPct = currentStep > 0 ? Math.min(100, ((currentStep - 1) / 4) * 100) : 0;

  // Progress steps
  const stepsHtml = STEPS.map((s, i) => {
    const stepNum = i + 1;
    let cls = '';
    if (stepNum < currentStep) cls = 'done';
    else if (stepNum === currentStep) cls = 'active';
    return `<div class="prog-step ${cls}">
      <div class="prog-dot ${cls}"></div>
      <div class="prog-label">${s.label}</div>
    </div>`;
  }).join('');

  // Events timeline
  let timelineHtml = '';
  if (events.length > 0) {
    const evHtml = events.slice(0, 8).map(ev => {
      const dt = ev.event_date_time ? formatDate(ev.event_date_time) : '';
      const desc = ev.status_description || ev.status || '';
      const loc  = ev.location || ev.hub_name || '';
      return `<div class="event">
        ${dt ? `<div class="event-time">${dt}</div>` : ''}
        <div class="event-desc">${desc}</div>
        ${loc ? `<div class="event-sub">${loc}</div>` : ''}
        ${ev.failure_reason ? `<div class="event-sub" style="color:#ff6666">${ev.failure_reason}</div>` : ''}
      </div>`;
    }).join('');
    timelineHtml = `
      <p class="section-title">Activity</p>
      <div class="timeline">${evHtml}</div>`;
  }

  return `
  <div class="awb-chip">AWB <span>${awb}</span></div>

  <div class="status-badge ${isDone ? 'static' : ''}" style="--sc:${statusInfo.color}">
    <div class="status-dot"></div>
    <div class="status-label">${statusInfo.label}</div>
  </div>

  ${!isBad ? `
  <div class="progress-wrap">
    <div class="progress-track">
      <div class="progress-fill" style="width:calc(${progressPct}% - 9px + ${progressPct === 0 ? '0px' : '9px'})"></div>
      ${stepsHtml}
    </div>
  </div>` : ''}

  ${timelineHtml}

  ${tracking.pod_image ? `
  <p class="section-title">Proof of Delivery</p>
  <div style="margin-bottom:32px">
    <img src="${tracking.pod_image}" alt="POD" style="max-width:100%;border-radius:3px;border:1px solid #222;">
  </div>` : ''}
  `;
}

function formatDate(str) {
  try {
    const d = new Date(str);
    return d.toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false,
      timeZone: 'Asia/Dubai'
    });
  } catch { return str; }
}

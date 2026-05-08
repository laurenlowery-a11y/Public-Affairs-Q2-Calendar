// Soft passcode gate — deters casual viewers, not real security.
// To change the passcode, edit the PASSCODE value below.
// To remove the gate, delete the <script src="gate.js"> line from each HTML file.
(function(){
  var PASSCODE = 'OOCEO+W/AQ2';
  var KEY = 'wa-q2-gate-ok';
  if (sessionStorage.getItem(KEY) === '1' || localStorage.getItem(KEY) === '1') return;

  // Build overlay
  var overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#0E1030;display:flex;align-items:center;justify-content:center;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#fff;';
  overlay.innerHTML = [
    '<div style="max-width:420px;width:90%;text-align:center;padding:40px 32px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.12);border-radius:18px;backdrop-filter:blur(12px);">',
      '<div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#B6FF6E;font-weight:800;margin-bottom:20px;">CodePath · W/A · Internal</div>',
      '<h1 style="font-weight:400;font-size:32px;line-height:1.1;margin:0 0 12px;letter-spacing:-0.01em;">This page is <em style="font-style:normal;color:#02BCFF;font-weight:700;">protected</em>.</h1>',
      '<p style="font-size:14px;color:rgba(255,255,255,0.65);line-height:1.5;margin:0 0 28px;">Enter the team passcode to continue.</p>',
      '<form id="gateF" style="display:flex;flex-direction:column;gap:10px;">',
        '<input id="gateI" type="password" autocomplete="off" placeholder="Passcode" autofocus style="padding:14px 16px;border-radius:10px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.06);color:#fff;font-size:15px;outline:none;text-align:center;letter-spacing:0.04em;" />',
        '<label style="display:flex;align-items:center;gap:8px;font-size:12px;color:rgba(255,255,255,0.55);justify-content:center;cursor:pointer;"><input id="gateR" type="checkbox" style="accent-color:#00C385;" /> Remember me on this device</label>',
        '<button type="submit" style="padding:13px 16px;border-radius:10px;border:0;background:#00C385;color:#0E1030;font-weight:800;font-size:13px;letter-spacing:0.06em;text-transform:uppercase;cursor:pointer;font-family:inherit;">Enter</button>',
        '<div id="gateE" style="font-size:12px;color:#FE3C84;min-height:18px;margin-top:4px;"></div>',
      '</form>',
    '</div>'
  ].join('');
  document.documentElement.appendChild(overlay);

  // Block scrolling underneath
  var prevOverflow = document.body && document.body.style.overflow;
  if (document.body) document.body.style.overflow = 'hidden';

  document.getElementById('gateF').addEventListener('submit', function(e){
    e.preventDefault();
    var v = document.getElementById('gateI').value;
    if (v === PASSCODE){
      var remember = document.getElementById('gateR').checked;
      (remember ? localStorage : sessionStorage).setItem(KEY, '1');
      overlay.remove();
      if (document.body) document.body.style.overflow = prevOverflow || '';
    } else {
      document.getElementById('gateE').textContent = 'Incorrect passcode.';
      document.getElementById('gateI').value = '';
      document.getElementById('gateI').focus();
    }
  });
})();

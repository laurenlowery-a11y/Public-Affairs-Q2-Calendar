// Pulls the Public Affairs Project Tracker from Asana and regenerates tasks-data.js
// Runs in GitHub Actions; reads ASANA_TOKEN + ASANA_PROJECT_ID from env.
//
// Filtering rules (matches what the calendar UI expects):
//   - Active tasks with due in Q2 window (Apr 1 – Jun 30, 2026)        -> main set
//   - Active tasks with due in Q3 window (Jul 1 – Sep 30, 2026)        -> beyond:true ("On the Horizon")
//   - Completed/Cancelled with due >= Apr 1, 2026                       -> Wins (kept in main set, status drives rendering)
//   - Everything else (no due date, due before Apr 1, due after Sep 30) -> dropped
//
// Privacy: owner names and W/A flag are stripped from output.

const fs = require('fs');
const https = require('https');

const TOKEN = process.env.ASANA_TOKEN;
const PROJECT_ID = process.env.ASANA_PROJECT_ID;
if (!TOKEN || !PROJECT_ID) {
  console.error('Missing ASANA_TOKEN or ASANA_PROJECT_ID');
  process.exit(1);
}

// Q2 / Q3 windows
const Q2_START = '2026-04-01';
const Q2_END   = '2026-06-30';
const Q3_START = '2026-07-01';
const Q3_END   = '2026-09-30';

// Map Asana goal labels -> short codes used by the calendar UI
const GOAL_MAP = {
  'Anthropic Partnership': 'AP',
  'Higher Ed Strategy': 'HE',
  'Govt & Public Sector': 'GP',
  'Government & Public Sector': 'GP',
  'Events & Speaking': 'ES',
  'Earned Media': 'EM',
  'Earned Media/Content Development': 'EM',
  'Content Development': 'EM',
  'Research/Thought Leadership': 'RT',
  'Research / Thought Leadership': 'RT',
  'CEO Influence': 'CI',
  'Earned Revenue': 'ER',
  'Public Recognition': 'PR',
};

function api(path) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'app.asana.com',
      path: '/api/1.0' + path,
      method: 'GET',
      headers: { Authorization: 'Bearer ' + TOKEN, Accept: 'application/json' },
    }, (res) => {
      let body = '';
      res.on('data', (c) => body += c);
      res.on('end', () => {
        if (res.statusCode >= 400) return reject(new Error('Asana ' + res.statusCode + ': ' + body));
        try { resolve(JSON.parse(body)); } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function statusFromCustomField(t) {
  const cf = (t.custom_fields || []).find(f => /status|progress/i.test(f.name || ''));
  if (cf && cf.enum_value && cf.enum_value.name) return cf.enum_value.name;
  if (t.completed) return 'Completed';
  return 'Not Started';
}

function extractGoals(t) {
  const out = [];
  for (const cf of (t.custom_fields || [])) {
    if (!/goal/i.test(cf.name || '')) continue;
    if (cf.multi_enum_values) {
      for (const v of cf.multi_enum_values) {
        const code = GOAL_MAP[v.name];
        if (code && !out.includes(code)) out.push(code);
      }
    } else if (cf.enum_value && cf.enum_value.name) {
      const code = GOAL_MAP[cf.enum_value.name];
      if (code && !out.includes(code)) out.push(code);
    }
  }
  return out;
}

function extractDate(t, regex) {
  const cf = (t.custom_fields || []).find(f => regex.test(f.name || ''));
  if (cf && cf.date_value && cf.date_value.date) return cf.date_value.date;
  return null;
}

function extractText(t, regex) {
  const cf = (t.custom_fields || []).find(f => regex.test(f.name || ''));
  if (!cf) return '';
  if (cf.text_value) return cf.text_value;
  if (cf.enum_value && cf.enum_value.name) return cf.enum_value.name;
  return '';
}

// Window classifier: returns 'q2' | 'q3' | 'pre' | 'post' | null
function classify(date) {
  if (!date) return null;
  if (date < Q2_START) return 'pre';
  if (date <= Q2_END) return 'q2';
  if (date <= Q3_END) return 'q3';
  return 'post';
}

(async () => {
  console.log('Fetching tasks...');
  const fields = [
    'name','completed','due_on','start_on',
    'memberships.section.name','custom_fields.name','custom_fields.enum_value.name',
    'custom_fields.multi_enum_values.name','custom_fields.text_value','custom_fields.date_value.date',
  ].join(',');
  const tasks = (await api(`/projects/${PROJECT_ID}/tasks?opt_fields=${fields}&limit=100`)).data;
  console.log(`Got ${tasks.length} tasks from Asana.`);

  let kept = 0, droppedNoDate = 0, droppedOutOfWindow = 0;

  const out = tasks.map(t => {
    const section = (t.memberships && t.memberships[0] && t.memberships[0].section && t.memberships[0].section.name) || '';
    const eventDate = extractDate(t, /(publish|event)\s*date/i);
    const startCustom = extractDate(t, /start\s*date/i);
    const due = t.due_on || null;
    const status = statusFromCustomField(t);

    const window = classify(due);

    // Filtering rules
    if (!due) { droppedNoDate++; return null; }
    if (window === 'pre' || window === 'post') { droppedOutOfWindow++; return null; }

    // Active tasks past Q2 -> beyond
    const beyond = window === 'q3' && status !== 'Completed' && status !== 'Cancelled';

    kept++;
    return {
      id: 'a' + t.gid.slice(-6),
      gid: t.gid,
      name: t.name,
      section,
      status,
      goals: extractGoals(t),
      start: startCustom || t.start_on || null,
      due,
      event: eventDate,
      notes: extractText(t, /^notes?$/i),
      ...(beyond ? { beyond: true } : {}),
      ...(status === 'Completed' ? { completed: true } : {}),
    };
  }).filter(Boolean);

  console.log(`Kept ${kept} · Dropped ${droppedNoDate} (no due date) + ${droppedOutOfWindow} (outside Apr 1 – Sep 30)`);

  // Sort: active Q2 first (by due), then beyond (by due), then wins (by due)
  out.sort((a, b) => {
    const rank = (x) => x.beyond ? 1 : (x.status === 'Completed' || x.status === 'Cancelled') ? 2 : 0;
    return rank(a) - rank(b) || (a.due || '').localeCompare(b.due || '');
  });

  const header = `// Q2 2026 Public Affairs tasks — auto-refreshed from Asana
// Last updated: ${new Date().toISOString()}
// Goals: AP=Anthropic Partnership, HE=Higher Ed Strategy, GP=Govt & Public Sector,
// ES=Events & Speaking, EM=Earned Media/Content Development, RT=Research/Thought Leadership,
// CI=CEO Influence, ER=Earned Revenue, PR=Public Recognition

window.PA_TASKS = ${JSON.stringify(out, null, 2)};

`;

  // Preserve GOAL/STATUS metadata blocks from the existing file
  let existing = '';
  try { existing = fs.readFileSync('tasks-data.js', 'utf8'); } catch (e) {}
  const metaMatch = existing.match(/window\.PA_GOAL_META[\s\S]*$/);
  const meta = metaMatch ? metaMatch[0] : '';

  fs.writeFileSync('tasks-data.js', header + meta);
  console.log('Wrote tasks-data.js');
})().catch(err => { console.error(err); process.exit(1); });

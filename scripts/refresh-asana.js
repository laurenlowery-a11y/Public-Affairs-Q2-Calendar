// Pulls the Public Affairs Project Tracker from Asana and regenerates tasks-data.js
// Runs in GitHub Actions; reads ASANA_TOKEN + ASANA_PROJECT_ID from env.
//
// Custom field mapping (best-effort — adjust GOAL_MAP if Asana field labels change):
//   "Notes" -> notes
//   "Goal" / "Strategic Goal" / "Goals" -> goals[] (multi-enum or enum)
//   "Publish Date" / "Event Date" -> event
//   "W/A" / "Wallerstein/Anthropic" -> wa (true if any value)
//
// Anything we don't recognize is preserved as-is (silent fallback to existing fields).

const fs = require('fs');
const https = require('https');

const TOKEN = process.env.ASANA_TOKEN;
const PROJECT_ID = process.env.ASANA_PROJECT_ID;
if (!TOKEN || !PROJECT_ID) {
  console.error('Missing ASANA_TOKEN or ASANA_PROJECT_ID');
  process.exit(1);
}

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
  // Asana "Status" or "Progress" enum custom field
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

function isWA(t) {
  for (const cf of (t.custom_fields || [])) {
    if (!/(w\/a|wallerstein|anthropic)/i.test(cf.name || '')) continue;
    if (cf.enum_value && cf.enum_value.name && !/^(no|none|n\/a)$/i.test(cf.enum_value.name)) return true;
    if (cf.text_value) return true;
    if (cf.multi_enum_values && cf.multi_enum_values.length) return true;
  }
  return false;
}

(async () => {
  console.log('Fetching project sections...');
  const sections = (await api(`/projects/${PROJECT_ID}/sections`)).data;

  console.log('Fetching tasks...');
  const fields = [
    'name','assignee.name','completed','due_on','start_on',
    'memberships.section.name','custom_fields.name','custom_fields.enum_value.name',
    'custom_fields.multi_enum_values.name','custom_fields.text_value','custom_fields.date_value.date',
  ].join(',');
  const tasks = (await api(`/projects/${PROJECT_ID}/tasks?opt_fields=${fields}&limit=100`)).data;

  console.log(`Got ${tasks.length} tasks.`);

  const out = tasks.map(t => {
    const section = (t.memberships && t.memberships[0] && t.memberships[0].section && t.memberships[0].section.name) || '';
    const eventDate = extractDate(t, /(publish|event)\s*date/i);
    const startCustom = extractDate(t, /start\s*date/i);
    return {
      id: 'a' + t.gid.slice(-6),
      gid: t.gid,
      name: t.name,
      section,
      owner: (t.assignee && t.assignee.name && t.assignee.name.split(' ')[0]) || '',
      wa: isWA(t),
      status: statusFromCustomField(t),
      goals: extractGoals(t),
      start: startCustom || t.start_on || null,
      due: t.due_on || null,
      event: eventDate,
      notes: extractText(t, /^notes?$/i),
    };
  });

  // Preserve the existing file's preamble; replace only the data array
  const header = `// Q2 2026 Public Affairs tasks — auto-refreshed from Asana
// Last updated: ${new Date().toISOString()}
// Goals: AP=Anthropic Partnership, HE=Higher Ed Strategy, GP=Govt & Public Sector,
// ES=Events & Speaking, EM=Earned Media/Content Development, RT=Research/Thought Leadership,
// CI=CEO Influence, ER=Earned Revenue, PR=Public Recognition

window.PA_TASKS = ${JSON.stringify(out, null, 2)};

// Goal / status / owner metadata is preserved from the original file;
// re-inject if you regenerated tasks-data.js from scratch.
`;

  // If existing file has GOAL/STATUS/OWNER meta blocks, keep them by re-reading and appending
  let existing = '';
  try { existing = fs.readFileSync('tasks-data.js', 'utf8'); } catch (e) {}
  const metaMatch = existing.match(/window\.PA_GOAL_META[\s\S]*$/);
  const meta = metaMatch ? metaMatch[0] : '';

  fs.writeFileSync('tasks-data.js', header + '\n' + meta);
  console.log('Wrote tasks-data.js');
})().catch(err => { console.error(err); process.exit(1); });

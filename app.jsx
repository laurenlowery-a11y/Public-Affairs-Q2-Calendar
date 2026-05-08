/* global React, ReactDOM */
const { useMemo, useState, useRef, useEffect } = React;

const TASKS = window.PA_TASKS;
const GOAL = window.PA_GOAL_META;
const STATUS = window.PA_STATUS_META;
const OWNER = window.PA_OWNER_META;

const SNAPSHOT = new Date('2026-05-04T12:00:00');

// ---------- date helpers ----------
const D = (s) => s ? new Date(s + 'T12:00:00') : null;
const sameDay = (a,b) => a && b && a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
const fmt = (d, opts={month:'short', day:'numeric'}) => d.toLocaleDateString('en-US', opts);
const startOfWeek = (d) => { const x = new Date(d); x.setDate(x.getDate() - x.getDay()); x.setHours(0,0,0,0); return x; };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate()+n); return x; };
const isWeekend = (d) => d.getDay()===0 || d.getDay()===6;

// Q2: May & June 2026 (and we'll show last week of April for context)
const MONTHS = [
  { num: 5, year: 2026, name: 'May',  word:'2026' },
  { num: 6, year: 2026, name: 'June', word:'2026' },
];

// Build weeks for a month — full weeks containing that month's days
function monthWeeks(year, month){
  const first = new Date(year, month-1, 1);
  const last  = new Date(year, month, 0);
  const start = startOfWeek(first);
  const endWeekStart = startOfWeek(last);
  const weeks = [];
  for (let ws = new Date(start); ws <= endWeekStart; ws = addDays(ws, 7)){
    const days = [];
    for (let i=0; i<7; i++){
      const d = addDays(ws, i);
      days.push({ date: d, inMonth: d.getMonth() === (month-1) });
    }
    weeks.push(days);
  }
  return weeks;
}

// ---------- task placement ----------
// Single-day task: place on `due` (or `event` if event-only)
// Range task (start + due, different): show as span pill across calendar days
function isRange(t){ return t.start && t.due && t.start !== t.due; }

function tasksOnDay(tasks, day){
  return tasks.filter(t => {
    if (isRange(t)) return false;
    const anchor = t.due || t.event;
    if (!anchor) return false;
    return sameDay(D(anchor), day);
  });
}

// ---------- Pills ----------
function Pill({ task, onHover, dim }){
  const goal = task.goals && task.goals[0];
  const meta = goal ? GOAL[goal] : null;
  const bg = meta ? meta.color : '#E5E5E5';
  const ink = meta ? meta.ink : '#1B1C57';
  return (
    <div
      className={'pill' + (dim ? ' dim' : '')}
      data-status={task.status}
      style={{ '--pill-bg': bg, '--pill-ink': ink }}
      onMouseEnter={(e) => onHover(task, e)}
      onMouseMove={(e) => onHover(task, e)}
      onMouseLeave={() => onHover(null)}
    >
      <span className="name">{task.name}</span>
      {task.wa && <span className="wa" title="W/A engaged">W/A</span>}
    </div>
  );
}

function SpanPill({ task, weekStart, weekEnd, onHover, dim }){
  const start = D(task.start);
  const due = D(task.due);
  const a = start < weekStart ? weekStart : start;
  const b = due > weekEnd ? weekEnd : due;
  const startCol = Math.round((a - weekStart) / 86400000);
  const span = Math.round((b - a) / 86400000) + 1;
  const continuesLeft = start < weekStart;
  const continuesRight = due > weekEnd;
  const goal = task.goals && task.goals[0];
  const meta = goal ? GOAL[goal] : null;
  const bg = meta ? meta.color : '#E5E5E5';
  const ink = meta ? meta.ink : '#1B1C57';
  return (
    <div
      className={'span-pill' + (dim ? ' dim' : '')}
      style={{
        left: `calc(${startCol} * (100% / 7) + 3px)`,
        width: `calc(${span} * (100% / 7) - 6px)`,
        background: bg, color: ink,
        borderTopLeftRadius: continuesLeft ? 0 : 3,
        borderBottomLeftRadius: continuesLeft ? 0 : 3,
        borderTopRightRadius: continuesRight ? 0 : 3,
        borderBottomRightRadius: continuesRight ? 0 : 3,
      }}
      onMouseEnter={(e) => onHover(task, e)}
      onMouseMove={(e) => onHover(task, e)}
      onMouseLeave={() => onHover(null)}
    >
      {continuesLeft && <span style={{opacity:0.6}}>‹</span>}
      <span style={{overflow:'hidden', textOverflow:'ellipsis'}}>{task.name}</span>
      {task.wa && <span className="own" style={{background:'rgba(0,0,0,0.18)', color:'#fff'}}>W/A</span>}
      {continuesRight && <span style={{opacity:0.6, marginLeft:'auto'}}>›</span>}
    </div>
  );
}

// ---------- Tooltip ----------
function Tooltip({ tip }){
  if (!tip) return null;
  const t = tip.task;
  return (
    <div className="tip show" style={{ left: tip.x + 14, top: tip.y + 14 }}>
      <div className="t-title">{t.name}</div>
      <div className="t-meta">{t.section}{t.status && t.status !== '—' ? ' · ' + t.status : ''}</div>
      {t.start && t.due && t.start !== t.due && (
        <div className="t-row"><b>Window</b>{fmt(D(t.start))} → {fmt(D(t.due))}</div>
      )}
      {(!t.start || t.start === t.due) && t.due && (
        <div className="t-row"><b>Due</b>{fmt(D(t.due), {weekday:'short', month:'short', day:'numeric'})}</div>
      )}
      {t.event && (
        <div className="t-row"><b>Event</b>{fmt(D(t.event), {weekday:'short', month:'short', day:'numeric'})}</div>
      )}
      <div className="t-row"><b>Status</b>{t.status || '—'}{t.wa ? ' · W/A' : ''}</div>
      {t.goals && t.goals.length > 0 && (
        <div className="t-goals">
          {t.goals.map(g => GOAL[g] && (
            <span key={g} className="t-goal" style={{background: GOAL[g].color, color: GOAL[g].ink}}>{GOAL[g].label}</span>
          ))}
        </div>
      )}
      {t.notes && <div className="t-notes">{t.notes}</div>}
    </div>
  );
}

// ---------- KPIs ----------
function computeKPIs(tasks){
  const active = tasks.filter(t => !t.beyond);
  const inProg = active.filter(t => t.status === 'In Progress').length;
  const pending = active.filter(t => t.status === 'Pending').length;
  const notStarted = active.filter(t => t.status === 'Not Started').length;
  const completed = active.filter(t => t.status === 'Completed').length;
  const cancelled = active.filter(t => t.status === 'Cancelled').length;
  const beyond = tasks.filter(t => t.beyond).length;
  return { active: active.length, inProg, pending, notStarted, completed, cancelled, beyond };
}

function computeGoalCoverage(tasks){
  const counts = {};
  Object.keys(GOAL).forEach(g => counts[g] = 0);
  tasks.filter(t => !t.beyond && t.status !== 'Cancelled').forEach(t => {
    (t.goals || []).forEach(g => { if (counts[g] !== undefined) counts[g]++; });
  });
  return counts;
}

// ---------- Filters / state ----------
function App(){
  const [filter, setFilter] = useState({ goal: 'all', owner: 'all', status: 'all' });
  const [tip, setTip] = useState(null);

  const onHover = (task, e) => {
    if (!task){ setTip(null); return; }
    setTip({ task, x: e.clientX, y: e.clientY });
  };

  const isDimmed = (t) => {
    if (filter.goal !== 'all' && !(t.goals||[]).includes(filter.goal)) return true;
    if (filter.owner !== 'all' && t.owner !== filter.owner) return true;
    if (filter.status !== 'all' && t.status !== filter.status) return true;
    return false;
  };

  const kpis = useMemo(() => computeKPIs(TASKS), []);
  const goalCov = useMemo(() => computeGoalCoverage(TASKS), []);
  const totalCov = useMemo(() => Object.values(goalCov).reduce((a,b)=>a+b,0), [goalCov]);

  const sectionCounts = useMemo(() => {
    const m = {};
    TASKS.filter(t => !t.beyond && t.status !== 'Cancelled' && t.status !== 'Completed').forEach(t => {
      m[t.section] = (m[t.section] || 0) + 1;
    });
    return m;
  }, []);

  const beyondTasks = TASKS.filter(t => t.beyond).sort((a,b) => (a.due||'').localeCompare(b.due||''));
  const winsTasks = TASKS.filter(t => t.status === 'Completed' || t.status === 'Cancelled').sort((a,b) => (a.due||'').localeCompare(b.due||''));

  return (
    <div className="doc">
      <header className="masthead">
        <div>
          <div className="eyebrow">
            <span className="pulse"></span>
            CodePath · OOCEO Public Affairs · Q2 2026 Calendar
          </div>
          <h1>What we're <em>shipping</em>, hosting, and pitching this quarter.</h1>
        </div>
        <div className="meta">
          <strong>Snapshot · May 4, 2026</strong>
          Source: Public Affairs Project Tracker (Asana)<br />
          Status (Jan 20 update): <span style={{color:'var(--ui-success)', fontWeight:600}}>● On track</span><br />
          Internal team only · not for external distribution
        </div>
      </header>

      <KPIStrip kpis={kpis} />

      <GoalCoverage goalCov={goalCov} total={totalCov} filter={filter} setFilter={setFilter} />

      <div className="cal-frame">
        {MONTHS.map(m => (
          <MonthBlock key={m.num} month={m} sectionCounts={sectionCounts} isDimmed={isDimmed} onHover={onHover} />
        ))}
      </div>

      <div className="rails">
        <Rail title="Q2 wins & decisions" tasks={winsTasks} kind="wins" />
        <Rail title="On the horizon · Q3+" tasks={beyondTasks} kind="beyond" />
      </div>

      <Legend filter={filter} setFilter={setFilter} />

      <footer className="foot">
        <div>20 active tasks across 7 workstreams · 9 strategic goal areas · Q2 = May–June 2026</div>
        <div>Designed for the W/A + OOCEO team · <a href="https://app.asana.com/1/854165295642105/project/1212823017557665" target="_blank" rel="noreferrer">Open in Asana ↗</a></div>
      </footer>

      <Tooltip tip={tip} />
    </div>
  );
}

// ---------- KPI strip ----------
function KPIStrip({ kpis }){
  const items = [
    { label: 'Active Q2 tasks', num: kpis.active, sub: 'May–June 2026', accent: 'var(--cp-navy)' },
    { label: 'In progress', num: kpis.inProg, sub: 'Underway now', accent: 'var(--ui-success)' },
    { label: 'Pending', num: kpis.pending, sub: 'Awaiting input or date', accent: 'var(--ui-warning)' },
    { label: 'Not started', num: kpis.notStarted, sub: 'Queued for the team', accent: 'var(--neutral-400)' },
    { label: 'Q2 wins logged', num: kpis.completed, sub: 'Completed since Apr 1', accent: 'var(--cp-kelly-green)' },
    { label: 'On the horizon', num: kpis.beyond, sub: 'Q3+ already in flight', accent: 'var(--cp-periwinkle)' },
  ];
  return (
    <div className="kpis">
      {items.map((k,i) => (
        <div key={i} className="kpi accent" style={{'--accent': k.accent}}>
          <div className="label">{k.label}</div>
          <div className="num">{k.num}</div>
          <div className="sub">{k.sub}</div>
        </div>
      ))}
    </div>
  );
}

// ---------- Goal coverage ----------
function GoalCoverage({ goalCov, total, filter, setFilter }){
  const order = ['EM','CI','HE','PR','ES','RT','GP','ER','AP'];
  return (
    <div className="coverage">
      <h3>
        <span>Goal coverage · where Q2 effort is going</span>
        <span className="hint">Click a band to filter the calendar · {total} goal-tags across {Object.values(goalCov).reduce((a,b)=>a+b,0)} touchpoints</span>
      </h3>
      <div className="cov-bar">
        {order.map(g => {
          const n = goalCov[g];
          if (!n) return null;
          const pct = (n / total * 100).toFixed(1);
          const meta = GOAL[g];
          const active = filter.goal === g;
          return (
            <span
              key={g}
              style={{
                width: pct + '%',
                background: meta.color,
                color: meta.ink,
                cursor: 'pointer',
                opacity: filter.goal === 'all' || active ? 1 : 0.35,
                outline: active ? '2px solid var(--cp-navy)' : 'none',
                outlineOffset: '-2px',
              }}
              onClick={() => setFilter({...filter, goal: active ? 'all' : g})}
              title={meta.label + ' · ' + n + ' tasks'}
            >
              {pct >= 7 ? meta.label.split(' ')[0].toUpperCase() : ''}
            </span>
          );
        })}
      </div>
      <div className="cov-legend">
        {order.map(g => {
          const meta = GOAL[g];
          const n = goalCov[g];
          const active = filter.goal === g;
          return (
            <div key={g} className="item" style={{cursor:'pointer', opacity: filter.goal === 'all' || active ? 1 : 0.5}} onClick={() => setFilter({...filter, goal: active ? 'all' : g})}>
              <span className="swatch" style={{background: meta.color}}></span>
              <span style={{flex:1}}>{meta.label}</span>
              <span className="num">{n}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Month block ----------
function MonthBlock({ month, sectionCounts, isDimmed, onHover }){
  const weeks = useMemo(() => monthWeeks(month.year, month.num), [month]);
  const monthTasks = TASKS.filter(t => {
    if (t.beyond) return false;
    if (t.status === 'Cancelled' || t.status === 'Completed') return false;
    const anchor = t.due ? D(t.due) : (t.event ? D(t.event) : null);
    const start = t.start ? D(t.start) : anchor;
    if (!start && !anchor) return false;
    // Include if any part of the date range overlaps this month
    const monthStart = new Date(month.year, month.num-1, 1);
    const monthEnd = new Date(month.year, month.num, 0);
    if (isRange(t)){
      return D(t.start) <= monthEnd && D(t.due) >= monthStart;
    }
    return anchor.getMonth() === month.num-1 && anchor.getFullYear() === month.year;
  });

  const inProgCount = monthTasks.filter(t => t.status === 'In Progress').length;
  const dowLabels = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  // Section ordering for sidebar
  const sectionOrder = ['Media Relations','Content Development','Recognition / Awards','Hosted Convenings','External Event Prep','Government Relations','Misc'];

  return (
    <div className="cal-month-block">
      <div className="cal-month-head">
        <div className="cal-month-name">
          <div>
            <div className="num">{String(month.num).padStart(2,'0')}</div>
            <div className="word">{month.name} · {month.word}</div>
          </div>
          <div className="summary">
            <b>{monthTasks.length}</b> touchpoints · <b>{inProgCount}</b> in progress
          </div>
        </div>
        <div className="dow-row">
          {dowLabels.map((d, i) => <div key={d} className={'dow' + ((i===0||i===6) ? ' we' : '')}>{d}</div>)}
        </div>
      </div>
      <div className="cal-grid">
        <aside className="cal-side">
          <h4>Workstreams · {month.name}</h4>
          {sectionOrder.map(s => {
            const n = monthTasks.filter(t => t.section === s).length;
            if (!n) return null;
            return (
              <div key={s} className="section-tally">
                <span>{s}</span>
                <span className="n">{n}</span>
              </div>
            );
          })}
        </aside>
        <div className="weeks">
          {weeks.map((week, wi) => {
            const weekStart = week[0].date;
            const weekEnd = addDays(week[6].date, 0); weekEnd.setHours(23,59,59);
            const spanTasks = monthTasks.filter(t => isRange(t) && D(t.start) <= weekEnd && D(t.due) >= weekStart);
            const spanReserve = spanTasks.length * 25;
            return (
              <div key={wi} className="week" style={{position:'relative'}}>
                {week.map((day, di) => {
                  const inThisMonth = day.inMonth;
                  const isToday = sameDay(day.date, SNAPSHOT);
                  const dayTasks = inThisMonth ? tasksOnDay(monthTasks, day.date) : [];
                  return (
                    <div key={di} className={'cell' + (isWeekend(day.date) ? ' weekend' : '') + (!inThisMonth ? ' muted' : '') + (isToday ? ' today' : '')}>
                      <div className="date">
                        {day.date.getDate()}
                        {day.date.getDate() === 1 && <small>{day.date.toLocaleDateString('en-US',{month:'short'})}</small>}
                      </div>
                      <div style={{marginTop: spanReserve}}>
                        {inThisMonth && dayTasks.map(t => (
                          <Pill key={t.id} task={t} onHover={onHover} dim={isDimmed(t)} />
                        ))}
                      </div>
                    </div>
                  );
                })}
                {spanTasks.length > 0 && (
                  <div style={{position:'absolute', left:0, right:0, top: 24, height: spanReserve, pointerEvents:'none'}}>
                    {spanTasks.map((t, idx) => (
                      <div key={t.id} className="span-row" style={{position:'absolute', left:0, right:0, top: idx*25, height: 22, pointerEvents:'auto'}}>
                        <SpanPill task={t} weekStart={weekStart} weekEnd={addDays(weekStart, 6)} onHover={onHover} dim={isDimmed(t)} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------- Side rail ----------
function Rail({ title, tasks, kind }){
  const sym = kind === 'wins' ? '✓' : '→';
  return (
    <section className="rail">
      <h3>
        <span>{sym}</span>
        <span style={{flex:1}}>{title}</span>
        <span className="count">{tasks.length}</span>
      </h3>
      {tasks.map(t => {
        const dueLabel = t.due ? fmt(D(t.due), {month:'short', day:'numeric'}) : 'TBD';
        const struck = t.status === 'Cancelled' || t.status === 'Completed';
        return (
          <div key={t.id} className={'rail-item' + (struck ? ' cancel' : '')}>
            <span className="when">{dueLabel}</span>
            <span className="what">{t.name}{t.notes ? <span style={{color:'var(--neutral-500)', fontSize: 11, fontStyle:'italic'}}> — {t.notes}</span> : ''}</span>
            {t.wa ? <span className="who">W/A</span> : null}
          </div>
        );
      })}
    </section>
  );
}

// ---------- Legend ----------
function Legend({ filter, setFilter }){
  return (
    <div className="legend">
      <div>
        <h4>How to read a pill</h4>
        <div className="legend-row" style={{flexDirection:'column', gap: 8}}>
          <div className="legend-key"><span className="swatch" style={{background:'#B243FF'}}></span> Color = primary goal area (Earned Media shown)</div>
          <div className="legend-key"><span className="swatch pat"></span> Diagonal hatch = Pending input/dependency</div>
          <div className="legend-key"><span className="swatch" style={{background:'var(--paper)', border:'1px solid var(--neutral-300)'}}></span> Outline = Not started yet</div>
          <div className="legend-key"><span style={{fontSize:8, fontWeight:800, background:'var(--cp-navy)', color:'#fff', padding:'1px 4px', borderRadius:2}}>W/A</span> Whiteboard Advisors engaged</div>
          <div className="legend-key"><span style={{fontSize:8, fontWeight:800, background:'rgba(255,255,255,0.85)', color:'var(--cp-navy)', padding:'1px 4px', borderRadius:2, border:'1px solid var(--rule)'}}>LL</span> Owner initials (LL=Lauren · M=Madison · VA=Victoria)</div>
        </div>
      </div>
      <div>
        <h4>Filter by status</h4>
        <div className="legend-row">
          {['all','In Progress','Pending','Not Started','—'].map(s => (
            <button
              key={s}
              onClick={() => setFilter({...filter, status: filter.status === s ? 'all' : s})}
              style={{
                padding: '5px 10px',
                fontSize: 11,
                fontFamily: 'inherit',
                fontWeight: 600,
                border: '1px solid ' + (filter.status === s ? 'var(--cp-navy)' : 'var(--rule)'),
                background: filter.status === s ? 'var(--cp-navy)' : 'var(--paper)',
                color: filter.status === s ? '#fff' : 'var(--cp-navy)',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              {s === 'all' ? 'All' : s === '—' ? 'Unset' : s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

import { useState } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────

type Tab = 'plan' | 'sessions' | 'observations' | 'report'

interface TestScenario {
  id: number
  task: string
  goal: string
  metric: string
  priority: 'high' | 'medium' | 'low'
}

interface Participant {
  id: string
  name: string
  age: number
  role: string
  experience: 'novice' | 'intermediate' | 'expert'
  status: 'scheduled' | 'in-progress' | 'completed'
  completionRate: number
  timeOnTask: number
  errorCount: number
  satisfactionScore: number
}

interface Observation {
  id: number
  participantId: string
  taskId: number
  type: 'issue' | 'success' | 'confusion' | 'suggestion'
  severity: 'critical' | 'major' | 'minor' | 'positive'
  note: string
  timestamp: string
  screenshotArea: string
}

// ── Static Data ────────────────────────────────────────────────────────────

const SCENARIOS: TestScenario[] = [
  { id: 1, task: 'Find and purchase a product under $50', goal: 'Evaluate checkout discoverability', metric: 'Task completion rate ≥ 80%', priority: 'high' },
  { id: 2, task: 'Return a recently purchased item', goal: 'Assess returns flow clarity', metric: 'Time on task ≤ 3 min', priority: 'high' },
  { id: 3, task: 'Subscribe to email notifications for a saved item', goal: 'Test alert feature discoverability', metric: 'Error rate ≤ 1 per session', priority: 'medium' },
  { id: 4, task: 'Filter search results by size and color', goal: 'Evaluate filter UX efficiency', metric: 'SUS score ≥ 70', priority: 'medium' },
  { id: 5, task: 'Contact customer support via chat', goal: 'Measure help-seeking friction', metric: 'Time to first contact ≤ 90 sec', priority: 'low' },
]

const PARTICIPANTS: Participant[] = [
  { id: 'P01', name: 'Mara Osei', age: 28, role: 'Marketing Manager', experience: 'intermediate', status: 'completed', completionRate: 80, timeOnTask: 4.2, errorCount: 2, satisfactionScore: 72 },
  { id: 'P02', name: 'Daniel Richter', age: 44, role: 'Accountant', experience: 'novice', status: 'completed', completionRate: 60, timeOnTask: 7.8, errorCount: 6, satisfactionScore: 55 },
  { id: 'P03', name: 'Yuki Tanaka', age: 32, role: 'Software Engineer', experience: 'expert', status: 'completed', completionRate: 100, timeOnTask: 2.1, errorCount: 0, satisfactionScore: 88 },
  { id: 'P04', name: 'Amara Diallo', age: 25, role: 'Freelance Designer', experience: 'intermediate', status: 'completed', completionRate: 80, timeOnTask: 3.9, errorCount: 1, satisfactionScore: 81 },
  { id: 'P05', name: 'Carlos Mendes', age: 55, role: 'Retail Manager', experience: 'novice', status: 'completed', completionRate: 40, timeOnTask: 10.3, errorCount: 9, satisfactionScore: 42 },
  { id: 'P06', name: 'Sofia Berg', age: 38, role: 'Nurse', experience: 'novice', status: 'in-progress', completionRate: 60, timeOnTask: 6.1, errorCount: 4, satisfactionScore: 63 },
  { id: 'P07', name: 'James Okonkwo', age: 30, role: 'Product Manager', experience: 'expert', status: 'scheduled', completionRate: 0, timeOnTask: 0, errorCount: 0, satisfactionScore: 0 },
  { id: 'P08', name: 'Priya Nair', age: 27, role: 'UX Researcher', experience: 'expert', status: 'scheduled', completionRate: 0, timeOnTask: 0, errorCount: 0, satisfactionScore: 0 },
]

const OBSERVATIONS: Observation[] = [
  { id: 1, participantId: 'P01', taskId: 1, type: 'confusion', severity: 'major', note: 'Hesitated on the "Add to Bag" vs "Save" button — unclear hierarchy', timestamp: '09:14', screenshotArea: 'Product detail page — CTA cluster' },
  { id: 2, participantId: 'P01', taskId: 2, type: 'issue', severity: 'critical', note: 'Could not locate "Orders" in the navigation; expected it under profile, not hamburger menu', timestamp: '09:22', screenshotArea: 'Navigation header' },
  { id: 3, participantId: 'P02', taskId: 1, type: 'issue', severity: 'critical', note: 'Triggered guest checkout accidentally; no confirmation before submitting payment', timestamp: '10:05', screenshotArea: 'Checkout — step 2' },
  { id: 4, participantId: 'P02', taskId: 3, type: 'confusion', severity: 'major', note: '"Notify me" label is not visible without scrolling on mobile viewport', timestamp: '10:34', screenshotArea: 'Product page — below fold' },
  { id: 5, participantId: 'P03', taskId: 1, type: 'success', severity: 'positive', note: 'Completed purchase in 87 seconds without errors; filter system praised as intuitive', timestamp: '11:02', screenshotArea: 'Filter panel + checkout' },
  { id: 6, participantId: 'P03', taskId: 4, type: 'suggestion', severity: 'minor', note: 'Suggested keyboard shortcut or quick-filter chips at top of results page', timestamp: '11:18', screenshotArea: 'Search results — filter sidebar' },
  { id: 7, participantId: 'P04', taskId: 2, type: 'issue', severity: 'major', note: 'Returns form has no real-time validation; error shown only on submit', timestamp: '13:45', screenshotArea: 'Returns form — reason field' },
  { id: 8, participantId: 'P05', taskId: 1, type: 'issue', severity: 'critical', note: 'Size guide opens in new tab, breaking the checkout flow entirely', timestamp: '14:20', screenshotArea: 'Product page — size guide link' },
  { id: 9, participantId: 'P05', taskId: 5, type: 'confusion', severity: 'major', note: 'Chat icon hidden in footer on mobile; user thought there was no live support', timestamp: '14:55', screenshotArea: 'Mobile footer' },
  { id: 10, participantId: 'P06', taskId: 3, type: 'confusion', severity: 'minor', note: 'User expected email confirmation after saving an alert, none was sent', timestamp: '15:30', screenshotArea: 'Alert confirmation modal' },
]

// ── Helpers ────────────────────────────────────────────────────────────────

const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length

const completed = PARTICIPANTS.filter(p => p.status === 'completed')
const avgSUS = Math.round(avg(completed.map(p => p.satisfactionScore)))
const avgCompletion = Math.round(avg(completed.map(p => p.completionRate)))
const avgTime = avg(completed.map(p => p.timeOnTask)).toFixed(1)
const criticalIssues = OBSERVATIONS.filter(o => o.severity === 'critical').length

const severityColor: Record<string, string> = {
  critical: '#ff5f5f',
  major: '#f5a623',
  minor: '#5b9cf6',
  positive: '#3dd68c',
}

const typeIcon: Record<string, string> = {
  issue: '⚠',
  confusion: '?',
  success: '✓',
  suggestion: '↗',
}

const expColor: Record<string, string> = {
  novice: '#f5a623',
  intermediate: '#5b9cf6',
  expert: '#3dd68c',
}

const statusColor: Record<string, string> = {
  scheduled: '#55555a',
  'in-progress': '#5b9cf6',
  completed: '#3dd68c',
}

// ── Sub-components ─────────────────────────────────────────────────────────

function MetricCard({ label, value, unit, sub, accent }: { label: string; value: string | number; unit?: string; sub?: string; accent?: boolean }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, padding: '20px 24px' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 600, color: accent ? 'var(--accent)' : 'var(--text-primary)', lineHeight: 1 }}>{value}</span>
        {unit && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)' }}>{unit}</span>}
      </div>
      {sub && <div style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)' }}>{sub}</div>}
    </div>
  )
}

function Tag({ label, color }: { label: string; color?: string }) {
  return (
    <span style={{
      fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
      color: color || 'var(--text-secondary)', background: color ? color + '18' : 'var(--surface-2)',
      border: `1px solid ${color || 'var(--border)'}`, borderRadius: 2, padding: '2px 6px'
    }}>{label}</span>
  )
}

// ── Plan Tab ───────────────────────────────────────────────────────────────

function PlanTab() {
  const [activeSection, setActiveSection] = useState<'overview' | 'scenarios' | 'criteria'>('overview')

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 0, height: '100%' }}>
      {/* Side nav */}
      <div style={{ borderRight: '1px solid var(--border)', padding: '24px 0' }}>
        {(['overview', 'scenarios', 'criteria'] as const).map(s => (
          <button key={s} onClick={() => setActiveSection(s)}
            style={{
              display: 'block', width: '100%', textAlign: 'left', padding: '10px 24px',
              fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
              background: activeSection === s ? 'var(--surface-2)' : 'transparent',
              color: activeSection === s ? 'var(--accent)' : 'var(--text-secondary)',
              border: 'none', cursor: 'pointer',
              borderLeft: activeSection === s ? '2px solid var(--accent)' : '2px solid transparent',
              transition: 'all 0.15s'
            }}>
            {s}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '32px 40px', overflowY: 'auto' }}>
        {activeSection === 'overview' && (
          <div style={{ maxWidth: 720 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Test Plan · Version 2.1</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, marginBottom: 24 }}>E-Commerce Checkout Redesign<br />Usability Study</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
              {[
                ['Study Type', 'Moderated Remote'],
                ['Product', 'Shop.co Mobile & Desktop'],
                ['Sprint', 'Sprint 14 — Q3 2026'],
                ['Researcher', 'Nia Abramowitz'],
                ['Participants Target', '8 users (n=5 completed)'],
                ['Duration per session', '60 min'],
              ].map(([k, v]) => (
                <div key={k} style={{ padding: '14px 16px', background: 'var(--surface-2)', borderRadius: 4 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>{k}</div>
                  <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Objectives</div>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  'Identify friction points in the end-to-end checkout funnel',
                  'Evaluate discoverability of new returns and alerts features',
                  'Benchmark task completion and SUS scores vs. Q1 baseline',
                  'Surface design improvement opportunities before Sprint 15 handoff',
                ].map((obj, i) => (
                  <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent)', marginTop: 3 }}>{'0' + (i + 1)}</span>
                    {obj}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Methodology</div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 600 }}>
                Think-aloud protocol with concurrent probing. Sessions conducted via Zoom with screen share and eye-tracking heat maps. Two observers per session: one facilitating, one logging. Participants recruited via UserTesting panel matching target persona demographics.
              </p>
            </div>
          </div>
        )}

        {activeSection === 'scenarios' && (
          <div style={{ maxWidth: 760 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Task Scenarios</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, marginBottom: 28 }}>5 Test Tasks</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {SCENARIOS.map((s, i) => (
                <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '40px 1fr auto', gap: 20, padding: '20px 0', borderBottom: i < SCENARIOS.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'start' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 500, color: 'var(--text-muted)' }}>T{s.id}</div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 6 }}>{s.task}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Goal: {s.goal}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>Success: {s.metric}</div>
                  </div>
                  <Tag label={s.priority} color={s.priority === 'high' ? '#ff5f5f' : s.priority === 'medium' ? '#f5a623' : '#55555a'} />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'criteria' && (
          <div style={{ maxWidth: 720 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Recruitment Criteria</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, marginBottom: 28 }}>Participant Screening</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
              {[
                { label: 'Age range', value: '22–60 years' },
                { label: 'Online shopping freq.', value: '≥ 2× per month' },
                { label: 'Device usage', value: 'Mobile + Desktop' },
                { label: 'Language', value: 'English (native/fluent)' },
                { label: 'Distribution', value: '3 novice · 3 intermediate · 2 expert' },
                { label: 'Geographic spread', value: 'US/UK/DE/AU' },
              ].map(({ label, value }) => (
                <div key={label} style={{ padding: '14px 16px', background: 'var(--surface-2)', borderRadius: 4 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{value}</div>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Exclusion Criteria</div>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['Works in UX/design or software testing roles', 'Has previously participated in a usability study for Shop.co', 'Purchased from Shop.co in the past 30 days (recency bias)'].map((c, i) => (
                  <li key={i} style={{ display: 'flex', gap: 10, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    <span style={{ color: '#ff5f5f', fontFamily: 'var(--font-mono)', fontSize: 12 }}>✕</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Sessions Tab ───────────────────────────────────────────────────────────

function SessionsTab() {
  const [selected, setSelected] = useState<string | null>('P01')
  const participant = PARTICIPANTS.find(p => p.id === selected)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', height: '100%' }}>
      {/* Participant list */}
      <div style={{ borderRight: '1px solid var(--border)', overflowY: 'auto' }}>
        <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Participants · {PARTICIPANTS.length}</div>
        </div>
        {PARTICIPANTS.map(p => (
          <button key={p.id} onClick={() => setSelected(p.id)}
            style={{
              display: 'grid', gridTemplateColumns: '36px 1fr', gap: 10, width: '100%', textAlign: 'left',
              padding: '14px 20px', background: selected === p.id ? 'var(--surface-2)' : 'transparent',
              border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer',
              borderLeft: selected === p.id ? '2px solid var(--accent)' : '2px solid transparent',
              transition: 'all 0.15s'
            }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)' }}>
              {p.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: selected === p.id ? 'var(--text-primary)' : 'var(--text-secondary)', marginBottom: 2 }}>{p.name}</div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: statusColor[p.status], letterSpacing: '0.05em', textTransform: 'uppercase' }}>{p.status}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Participant detail */}
      {participant ? (
        <div style={{ padding: '32px 36px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>{participant.id}</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, marginBottom: 4 }}>{participant.name}</h2>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{participant.age} · {participant.role}</span>
                <Tag label={participant.experience} color={expColor[participant.experience]} />
              </div>
            </div>
            <Tag label={participant.status.replace('-', ' ')} color={statusColor[participant.status]} />
          </div>

          {participant.status !== 'scheduled' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
                <MetricCard label="Completion" value={participant.completionRate} unit="%" sub={participant.completionRate >= 80 ? '✓ meets target' : '✕ below target'} accent={participant.completionRate >= 80} />
                <MetricCard label="Avg time/task" value={participant.timeOnTask} unit=" min" sub="target: ≤ 5 min" />
                <MetricCard label="Errors" value={participant.errorCount} sub={participant.errorCount === 0 ? 'clean session' : participant.errorCount > 5 ? 'above threshold' : 'within range'} />
                <MetricCard label="SUS Score" value={participant.satisfactionScore} sub={participant.satisfactionScore >= 70 ? 'Good' : participant.satisfactionScore >= 50 ? 'Marginal' : 'Poor'} accent={participant.satisfactionScore >= 70} />
              </div>

              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>Task Completion by Scenario</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {SCENARIOS.map(s => {
                    const obs = OBSERVATIONS.filter(o => o.participantId === participant.id && o.taskId === s.id)
                    const done = obs.some(o => o.type === 'success') || Math.random() > 0.3
                    return (
                      <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 60px', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>T{s.id}</span>
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.task}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: done ? '#3dd68c' : '#ff5f5f', textAlign: 'right' }}>{done ? 'PASS' : 'FAIL'}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {participant.status === 'scheduled' && (
            <div style={{ padding: 32, background: 'var(--surface-2)', borderRadius: 4, textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>Session not yet started</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Data will appear here after the session is conducted.</div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          Select a participant
        </div>
      )}
    </div>
  )
}

// ── Observations Tab ───────────────────────────────────────────────────────

function ObservationsTab() {
  const [filter, setFilter] = useState<string>('all')
  const filters = ['all', 'critical', 'major', 'minor', 'positive']

  const filtered = filter === 'all' ? OBSERVATIONS : OBSERVATIONS.filter(o => o.severity === filter)

  return (
    <div style={{ padding: '28px 36px', overflowY: 'auto', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Session Observations</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600 }}>{filtered.length} observations recorded</h2>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding: '6px 12px', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
                background: filter === f ? 'var(--surface-2)' : 'transparent',
                color: filter === f ? (f === 'all' ? 'var(--accent)' : severityColor[f] || 'var(--accent)') : 'var(--text-muted)',
                border: `1px solid ${filter === f ? (f === 'all' ? 'var(--accent)' : severityColor[f] || 'var(--accent)') : 'var(--border)'}`,
                borderRadius: 2, cursor: 'pointer', transition: 'all 0.15s'
              }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 28 }}>
        {(['critical', 'major', 'minor', 'positive'] as const).map(sev => {
          const count = OBSERVATIONS.filter(o => o.severity === sev).length
          return (
            <div key={sev} style={{ padding: '12px 16px', background: 'var(--surface)', border: `1px solid ${severityColor[sev]}22`, borderRadius: 4, borderLeft: `2px solid ${severityColor[sev]}` }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{sev}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, color: severityColor[sev] }}>{count}</div>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {filtered.map((obs, i) => {
          const participant = PARTICIPANTS.find(p => p.id === obs.participantId)
          const scenario = SCENARIOS.find(s => s.id === obs.taskId)
          return (
            <div key={obs.id} style={{ display: 'grid', gridTemplateColumns: '20px 140px 1fr auto', gap: 20, padding: '16px 0', borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'start' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: severityColor[obs.severity], marginTop: 1 }}>{typeIcon[obs.type]}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>{participant?.name}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>T{obs.taskId} · {obs.timestamp}</div>
                <Tag label={obs.severity} color={severityColor[obs.severity]} />
              </div>
              <div>
                <div style={{ fontSize: 14, color: 'var(--text-primary)', marginBottom: 6, lineHeight: 1.5 }}>{obs.note}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>📌 {obs.screenshotArea}</div>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{obs.type}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Report Tab ─────────────────────────────────────────────────────────────

function ReportTab() {
  const [expanded, setExpanded] = useState<number | null>(1)

  const findings = [
    {
      id: 1, rank: 'Critical', title: 'Returns flow buried in hamburger menu',
      impact: '4 of 6 participants failed or required assistance with Task 2',
      recommendation: 'Surface "Orders & Returns" in the primary navigation at the top level, not nested in a secondary menu. Confirm with A/B test on click-through rate.',
      effort: 'Medium',
      participants: ['P01', 'P02', 'P05', 'P06'],
    },
    {
      id: 2, rank: 'Critical', title: 'Size guide opens in new tab, breaking checkout',
      impact: 'P05 abandoned checkout after losing session context. Risk of cart loss on mobile.',
      recommendation: 'Open size guide as an in-page modal overlay. Ensure state is preserved. Revisit all external link targets in checkout funnel.',
      effort: 'Low',
      participants: ['P05'],
    },
    {
      id: 3, rank: 'Major', title: 'CTA hierarchy unclear on product detail page',
      impact: '"Add to Bag" and "Save for Later" appear at similar visual weight, causing hesitation in 3 participants.',
      recommendation: 'Increase primary CTA size and fill color. Render secondary action as text link only. Apply brand color contrast ratio ≥ 3:1 between the two.',
      effort: 'Low',
      participants: ['P01', 'P02', 'P04'],
    },
    {
      id: 4, rank: 'Major', title: 'Returns form lacks inline validation',
      impact: 'P04 submitted incorrect format twice; error only shown post-submit.',
      recommendation: 'Add real-time field validation on blur. Show character count and format hints inline. Follow WCAG 1.3.1 for error identification.',
      effort: 'Medium',
      participants: ['P04'],
    },
    {
      id: 5, rank: 'Major', title: 'Chat support icon not visible on mobile',
      impact: 'P05 believed live support was unavailable; P06 found it after 4 min of searching.',
      recommendation: 'Move chat trigger to a persistent floating action button pinned above the mobile footer. Ensure it clears scrollable content.',
      effort: 'Low',
      participants: ['P05', 'P06'],
    },
    {
      id: 6, rank: 'Minor', title: '"Notify Me" below the fold on mobile',
      impact: 'P02 and P06 completed Task 3 only after scrolling hint from facilitator.',
      recommendation: 'Anchor the notification CTA within the first scroll on mobile product pages. Consider a sticky bottom bar for high-demand items.',
      effort: 'Low',
      participants: ['P02', 'P06'],
    },
  ]

  const rankColor: Record<string, string> = { Critical: '#ff5f5f', Major: '#f5a623', Minor: '#5b9cf6' }
  const effortColor: Record<string, string> = { Low: '#3dd68c', Medium: '#f5a623', High: '#ff5f5f' }

  return (
    <div style={{ padding: '28px 36px', overflowY: 'auto', height: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Final Report · September 2026</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, marginBottom: 4 }}>Shop.co Usability Study Results</h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 560, lineHeight: 1.6 }}>
          Analysis of 5 completed sessions (n=6 partially). Baseline comparison from Q1 2026. All metrics below represent completed-session averages.
        </p>
      </div>

      {/* Metrics overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 36 }}>
        <MetricCard label="Avg SUS Score" value={avgSUS} unit="/100" sub={avgSUS >= 70 ? '↑ 8pts from Q1' : '↓ below threshold'} accent={avgSUS >= 70} />
        <MetricCard label="Task Completion" value={avgCompletion} unit="%" sub="target: ≥ 80%" accent={avgCompletion >= 80} />
        <MetricCard label="Avg Time / Task" value={avgTime} unit=" min" sub="Q1 baseline: 4.8 min" />
        <MetricCard label="Critical Issues" value={criticalIssues} sub="requires immediate action" />
      </div>

      {/* SUS Distribution bar */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>SUS Score Distribution by Participant</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {PARTICIPANTS.filter(p => p.status === 'completed').map(p => (
            <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 40px', gap: 12, alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)' }}>{p.name.split(' ')[0]}</span>
              <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 1, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${p.satisfactionScore}%`, background: p.satisfactionScore >= 70 ? 'var(--accent)' : p.satisfactionScore >= 50 ? '#f5a623' : '#ff5f5f', borderRadius: 1, transition: 'width 0.4s ease' }} />
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', textAlign: 'right' }}>{p.satisfactionScore || '–'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Findings */}
      <div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Design Improvement Findings · {findings.length} items</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {findings.map(f => (
            <div key={f.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden' }}>
              <button
                onClick={() => setExpanded(expanded === f.id ? null : f.id)}
                style={{
                  display: 'grid', gridTemplateColumns: '20px 80px 1fr 70px 24px', gap: 16, width: '100%', padding: '14px 20px', background: 'transparent',
                  border: 'none', cursor: 'pointer', alignItems: 'center', textAlign: 'left'
                }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>F{f.id}</span>
                <Tag label={f.rank} color={rankColor[f.rank]} />
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{f.title}</span>
                <Tag label={`Effort: ${f.effort}`} color={effortColor[f.effort]} />
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: 14 }}>{expanded === f.id ? '−' : '+'}</span>
              </button>
              {expanded === f.id && (
                <div style={{ padding: '0 20px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, borderTop: '1px solid var(--border)' }}>
                  <div style={{ paddingTop: 16 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Impact</div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.impact}</p>
                    <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {f.participants.map(pid => <Tag key={pid} label={pid} />)}
                    </div>
                  </div>
                  <div style={{ paddingTop: 16 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Recommendation</div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.recommendation}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Root App ───────────────────────────────────────────────────────────────

export default function App() {
  const [tab, setTab] = useState<Tab>('plan')

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'plan', label: 'Test Plan' },
    { id: 'sessions', label: 'Sessions', count: PARTICIPANTS.filter(p => p.status === 'completed').length },
    { id: 'observations', label: 'Observations', count: OBSERVATIONS.length },
    { id: 'report', label: 'Report' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-body)' }}>
      {/* Top bar */}
      <header style={{ borderBottom: '1px solid var(--border)', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, background: 'var(--accent)', borderRadius: 1 }} />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em' }}>UsabilityKit</span>
          </div>
          <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Shop.co Checkout Redesign — Q3 2026</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3dd68c' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>In Progress</span>
          </div>
        </div>
      </header>

      {/* Tab nav */}
      <nav style={{ borderBottom: '1px solid var(--border)', padding: '0 32px', display: 'flex', gap: 0, flexShrink: 0 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              padding: '0 20px', height: 44, display: 'flex', alignItems: 'center', gap: 8,
              fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase',
              background: 'transparent', border: 'none',
              borderBottom: tab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
              color: tab === t.id ? 'var(--text-primary)' : 'var(--text-muted)',
              cursor: 'pointer', transition: 'all 0.15s', marginBottom: -1
            }}>
            {t.label}
            {t.count !== undefined && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, background: tab === t.id ? 'var(--accent)' : 'var(--surface-2)', color: tab === t.id ? '#0b0b0d' : 'var(--text-muted)', padding: '1px 5px', borderRadius: 2 }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main style={{ flex: 1, overflow: 'hidden' }}>
        {tab === 'plan' && <PlanTab />}
        {tab === 'sessions' && <SessionsTab />}
        {tab === 'observations' && <ObservationsTab />}
        {tab === 'report' && <ReportTab />}
      </main>
    </div>
  )
}

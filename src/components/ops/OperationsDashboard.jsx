import { useRef, useEffect } from 'react';
import {
  Cpu, BarChart2, Activity, Shield, Route, CheckCircle,
  Smartphone, LogOut, Settings, Share2, MapPin,
} from 'lucide-react';
import { useJodo } from '../../context/JodoContext';
import { LANGUAGES } from '../../i18n/translations';
import { getWardResolutionRate } from '../../utils/accountability';
import JodoLogo from '../shared/JodoLogo';

function SparklineSVG({ history }) {
  if (history.length < 2) {
    return <p className="sparkline-empty">Submit or resolve issues to see trend</p>;
  }
  const w = 280, h = 48, pad = 4;
  const scores = history.map(d => d.score);
  const min = Math.min(...scores) - 0.3;
  const max = Math.max(...scores) + 0.3;
  const pts = scores.map((s, i) => {
    const x = pad + (i / (scores.length - 1)) * (w - pad * 2);
    const y = h - pad - ((s - min) / (max - min)) * (h - pad * 2);
    return `${x},${y}`;
  });
  const fillPts = `${pad},${h - pad} ${pts.join(' ')} ${w - pad},${h - pad}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="sparkline-svg">
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--emerald)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--emerald)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fillPts} fill="url(#sparkGrad)" />
      <polyline points={pts.join(' ')} fill="none" stroke="var(--emerald)" strokeWidth="2" />
    </svg>
  );
}

export default function OperationsDashboard() {
  const {
    allIssues: issues, logs, agents, rightPanelTab, setRightPanelTab,
    inspectorType, setInspectorType, inspectorContent, setInspectorContent,
    scoreHistory, calculateAreaHealth, triggerInspector,
    loginUsername, loginRole, switchRole, handleLogout, language, setLanguage,
    setAppView, graphContainerRef, mapOrGraph, setMapOrGraph, geminiLive,
    selectedIssueId, setSelectedIssueId, handleVerify, handleRouteIssue, handleResolve,
  } = useJodo();

  const areaHealth = calculateAreaHealth(issues);
  const resolvedCount = issues.filter(i => i.resolved).length;
  const activeCount = issues.filter(i => !i.resolved).length;
  const resolvedPct = issues.length ? Math.round((resolvedCount / issues.length) * 100) : 0;
  const wardRate = getWardResolutionRate(issues);
  const queueRef = useRef(null);

  useEffect(() => {
    queueRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [issues.length]);

  const agentList = [
    { key: 'iia', label: 'Issue Intelligence (IIA)', desc: 'Gemini multimodal classification' },
    { key: 'cda', label: 'Community Discovery (CDA)', desc: 'Vector embeddings + dedup' },
    { key: 'va', label: 'Verification (VA)', desc: 'Community consensus' },
    { key: 'ria', label: 'Risk Intelligence (RIA)', desc: 'Spatial routing + hazard' },
    { key: 'ea', label: 'Engagement (EA)', desc: 'Volunteer missions' },
    { key: 'ra', label: 'Resolution (RA)', desc: 'Gemini Vision verification' },
    { key: 'ana', label: 'Analytics (ANA)', desc: 'Regional health synthesis' },
  ];

  return (
    <div className="ops-dashboard">
      <aside className="ops-sidebar">
        <div className="ops-brand">
          <JodoLogo size={36} showText={false} />
          <div>
            <strong>Jodo Ops</strong>
            <small>Vertex AI Monitor</small>
          </div>
        </div>
        <nav className="ops-nav">
          <button className={rightPanelTab === 'agents' ? 'active' : ''} onClick={() => setRightPanelTab('agents')}>
            <Cpu size={16} /> AI Agents
          </button>
          <button className={rightPanelTab === 'analytics' ? 'active' : ''} onClick={() => setRightPanelTab('analytics')}>
            <BarChart2 size={16} /> Analytics
          </button>
          <button className={rightPanelTab === 'queue' ? 'active' : ''} onClick={() => setRightPanelTab('queue')}>
            <Route size={16} /> Municipal Queue
          </button>
        </nav>
        <div className="ops-sidebar-footer">
          <button onClick={() => setAppView('citizen')}><Smartphone size={14} /> Citizen App</button>
          <button onClick={handleLogout}><LogOut size={14} /> Log out</button>
        </div>
      </aside>

      <div className="ops-main">
        <header className="ops-header">
          <div>
            <h1>Operations Dashboard</h1>
            <p>{loginUsername} · {loginRole} · {geminiLive ? 'Gemini Live' : 'Gemini Offline'}</p>
          </div>
          <div className="ops-header-badges">
            <span className="ops-badge live"><Activity size={12} /> System Online</span>
            <span className="ops-badge">Firestore Sync</span>
            <span className="ops-badge">Vertex AI</span>
          </div>
        </header>

        <div className="ops-grid">
          <section className="ops-panel agents-panel">
            <h2><Cpu size={16} /> 7 Collaborating AI Agents</h2>
            <div className="agent-grid-ops">
              {agentList.map(({ key, label, desc }) => (
                <div key={key} className="agent-card-ops" onClick={() => triggerInspector(key === 'iia' ? 'ingest_custom' : 'verify_action')}>
                  <div className="agent-card-top">
                    <span>{label}</span>
                    <span className={`agent-dot ${agents[key] === 'ACTIVE' ? 'active' : ''}`} />
                  </div>
                  <small>{desc}</small>
                  <strong className={agents[key] === 'ACTIVE' ? 'text-emerald' : ''}>{agents[key]}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="ops-panel stats-panel">
            <h2><BarChart2 size={16} /> Community Health</h2>
            <div className="ops-stat-row">
              <div className="ops-stat"><span>{areaHealth}</span><small>Health Score</small></div>
              <div className="ops-stat"><span>{resolvedPct}%</span><small>Resolution Rate</small></div>
              <div className="ops-stat"><span>{wardRate}%</span><small>Ward Performance</small></div>
              <div className="ops-stat"><span>{activeCount}</span><small>Active Queue</small></div>
            </div>
            <div className="sparkline-wrap"><SparklineSVG history={scoreHistory} /></div>
          </section>

          <section className="ops-panel timeline-panel">
            <h2>AI Execution Timeline</h2>
            <div className="log-console">
              {logs.map((item, i) => (
                <div key={i} className="log-entry">
                  <span className="log-timestamp">[{item.timestamp}]</span>
                  <span className="log-agent">[{item.agent}]</span>
                  <span className={`log-message ${item.type}`}>{item.message}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="ops-panel inspector-panel">
            <div className="inspector-header">
              <button className={inspectorType === 'schema' ? 'active' : ''} onClick={() => setInspectorType('schema')}>Vertex Schema</button>
              <button className={inspectorType === 'sql' ? 'active' : ''} onClick={() => {
                setInspectorType('sql');
                setInspectorContent(`-- PostGIS spatial query\nSELECT id, title FROM observations\nWHERE ST_DWithin(location, ST_Point(77.5946, 12.9716)::geography, 5000);\n\n-- pgvector similarity\nSELECT id, (description_vector <=> $1) AS distance\nFROM observations ORDER BY distance LIMIT 3;`);
              }}>SQL & Geospatial</button>
            </div>
            <pre className="inspector-body">{inspectorContent}</pre>
          </section>

          {rightPanelTab === 'queue' && (
            <section className="ops-panel queue-panel full-width" ref={queueRef}>
              <h2><Route size={16} /> Municipal Queue ({activeCount})</h2>
              {issues.filter(i => !i.resolved).length === 0 ? (
                <p className="empty-queue">No pending issues in queue</p>
              ) : issues.filter(i => !i.resolved).map(issue => (
                <div key={issue.id} className={`queue-item ${selectedIssueId === issue.id ? 'selected' : ''}`}
                  onClick={() => setSelectedIssueId(issue.id)}>
                  <div><strong>#{issue.id} {issue.title}</strong><small>{issue.category} · {issue.ward}</small></div>
                  <div className="queue-actions">
                    <button onClick={(e) => { e.stopPropagation(); handleVerify(); }}><CheckCircle size={14} /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleRouteIssue(); }}><Route size={14} /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleResolve(); }}><Shield size={14} /></button>
                  </div>
                </div>
              ))}
            </section>
          )}

          <section className="ops-panel map-panel">
            <div className="ops-map-toggle">
              <button className={mapOrGraph === 'map' ? 'active' : ''} onClick={() => setMapOrGraph('map')}><MapPin size={12} /> Map</button>
              <button className={mapOrGraph === 'graph' ? 'active' : ''} onClick={() => setMapOrGraph('graph')}><Share2 size={12} /> Graph</button>
            </div>
            {mapOrGraph === 'graph' ? (
              <div ref={graphContainerRef} className="ops-graph" />
            ) : (
              <div className="ops-map-placeholder">
                <MapPin size={24} />
                <p>{issues.length} issues tracked · Open Citizen Map for full view</p>
              </div>
            )}
          </section>
        </div>

        <footer className="ops-demo-bar">
          <Settings size={14} />
          <span>Demo Role:</span>
          {['citizen', 'volunteer', 'municipal', 'admin'].map(r => (
            <button key={r} className={loginRole === r ? 'active' : ''} onClick={() => switchRole(r)}>{r}</button>
          ))}
          <select value={language} onChange={e => setLanguage(e.target.value)} className="lang-select">
            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </footer>
      </div>
    </div>
  );
}

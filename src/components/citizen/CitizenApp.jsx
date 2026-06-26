import {
  Compass, Navigation, Upload, Trophy, User, Bell, Settings, LogOut,
  Sparkles, Zap, MapPin, Globe, ArrowRight, Lock,
  TrendingUp, Users, Star,
} from 'lucide-react';
import { useJodo } from '../../context/JodoContext';
import { LANGUAGES } from '../../i18n/translations';
import { getGreetingKey, isOpsRole } from '../../utils/scores';
import { getWardResolutionRate } from '../../utils/accountability';
import IssueCard from '../shared/IssueCard';
import VoiceReport from '../shared/VoiceReport';
import MapScreen from './MapScreen';
import JodoLogo from '../shared/JodoLogo';
import { BHOPAL_AREAS } from '../../data/locations';

export default function CitizenApp() {
  const ctx = useJodo();
  const {
    mobileTab, setMobileTab, issues, allIssues, selectedIssue, selectedIssueId, isSheetExpanded, setIsSheetExpanded,
    translate, language, setLanguage, loginUsername, loginRole, switchRole, handleLogout, userProfile,
    notifications, calculateAreaHealth,
    formTitle, setFormTitle, formDesc, setFormDesc, formCategory, setFormCategory, formLocation, setFormLocation,
    uploadedImageBefore, uploadedImageBeforeName, handleBeforeImageChange, handleAIClassify,
    aiClassifyState, aiClassifyResult, handleCustomIngestSubmit, isProcessing, processingText, processingProgress,
    handleItemSelect, newIssueRef,
    setAppView,
  } = ctx;

  const areaHealth = calculateAreaHealth(allIssues);
  const greeting = translate(getGreetingKey());
  const wardRate = getWardResolutionRate(allIssues, userProfile?.ward);

  return (
    <div className="citizen-app">
      <header className="citizen-header">
        <JodoLogo size={32} />
        <div className="citizen-header-actions">
          <button className="icon-btn" onClick={() => setMobileTab('notifications')} aria-label={translate('notifications')}>
            <Bell size={20} />
            {notifications.some(n => !n.read) && <span className="notif-dot" />}
          </button>
          {isOpsRole(loginRole) && (
            <button className="btn-ghost-sm" onClick={() => setAppView('ops')}>Ops</button>
          )}
        </div>
      </header>

      <main className="citizen-main">
        {mobileTab === 'home' && (
          <div className="screen-pad fade-in">
            <p className="greeting-text">{greeting}, {loginUsername.split(' ')[0]}</p>
            <h1 className="screen-title">{translate('communityHealth')}</h1>

            <div className="health-card">
              <div className="health-card-top">
                <div>
                  <span className="health-label">{translate('communityHealth')}</span>
                  <span className="health-sub">{userProfile?.locality || 'Bhopal'} · Ward Performance {wardRate}%</span>
                </div>
                <span className="health-score">{areaHealth}</span>
              </div>
              <div className="health-bar"><div className="health-bar-fill" style={{ width: `${areaHealth * 10}%` }} /></div>
            </div>

            <button className="quick-report-btn" onClick={() => setMobileTab('report')}>
              <Upload size={18} />
              {translate('quickReport')}
            </button>

            <section className="section-block">
              <h2 className="section-title">{translate('nearbyIssues')} ({allIssues.length})</h2>
              {allIssues.length === 0 ? (
                <div className="empty-state">
                  <MapPin size={32} />
                  <p>{translate('emptyIssues')}</p>
                </div>
              ) : (
                allIssues.slice().reverse().map(issue => (
                  <IssueCard key={issue.id} issue={issue} selected={selectedIssueId === issue.id}
                    onClick={handleItemSelect} innerRef={issue.id === selectedIssueId ? newIssueRef : null} />
                ))
              )}
            </section>

            <section className="section-block">
              <h2 className="section-title">{translate('leaderboard')}</h2>
              <div className="leaderboard-card">
                <div className="lb-row"><Star size={14} /><span>Nikhil Kumar</span><strong>120 pts</strong></div>
                <div className="lb-row"><Star size={14} /><span>Verifier_Rahul</span><strong>98 pts</strong></div>
                <div className="lb-row"><Star size={14} /><span>Officer Priya</span><strong>85 pts</strong></div>
              </div>
            </section>
          </div>
        )}

        {mobileTab === 'map' && <MapScreen />}

        {mobileTab === 'report' && (
          <div className="screen-pad report-screen">
            {isProcessing && (
              <div className="processing-overlay">
                <div className="spinner" />
                <p>{processingText}</p>
                <div className="progress-bar"><div style={{ width: `${processingProgress}%` }} /></div>
              </div>
            )}
            <h1 className="screen-title">{translate('reportIssue')}</h1>
            <VoiceReport />
            <form onSubmit={handleCustomIngestSubmit} className="report-form">
              <label>Title<input required value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="e.g. Clogged storm drain" /></label>
              <label>Description<textarea required rows={3} value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Describe the issue…" /></label>
              <button type="button" className="btn-ai-classify" onClick={handleAIClassify} disabled={!formDesc.trim() || aiClassifyState === 'classifying'}>
                {aiClassifyState === 'classifying' ? <><div className="spinner-small" /> Classifying…</> : <><Sparkles size={14} /> {translate('classify')}</>}
              </button>
              {aiClassifyResult && (
                <div className="ai-result-card">
                  <div className="ai-result-header"><Sparkles size={12} /> Gemini · {aiClassifyResult.geminiModel}</div>
                  <div className="ai-result-grid">
                    <div><small>Category</small><strong>{aiClassifyResult.category}</strong></div>
                    <div><small>{translate('aiConfidence')}</small><strong>{aiClassifyResult.confidence}%</strong></div>
                    <div><small>{translate('priority')}</small><strong>{aiClassifyResult.priority}</strong></div>
                    <div><small>Risk</small><strong>{aiClassifyResult.riskLevel}</strong></div>
                  </div>
                </div>
              )}
              <div className="form-row">
                <label>Category
                  <select value={formCategory} onChange={e => setFormCategory(e.target.value)}>
                    <option value="Roads/Infrastructure">Roads</option>
                    <option value="Water/Sewage">Water</option>
                    <option value="Sanitation">Sanitation</option>
                    <option value="Safety Hazard">Safety</option>
                  </select>
                </label>
                <label>Location
                  <select value={formLocation} onChange={e => setFormLocation(e.target.value)}>
                    {Object.entries(BHOPAL_AREAS).map(([key, area]) => (
                      <option key={key} value={key}>{area.label}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="upload-drop-zone">
                <input type="file" accept="image/*" hidden onChange={handleBeforeImageChange} />
                {uploadedImageBefore ? (
                  <><img src={uploadedImageBefore} alt="Upload" className="upload-preview" /><span>{uploadedImageBeforeName}</span></>
                ) : (
                  <><Upload size={20} /><span>Tap to upload photo</span></>
                )}
              </label>
              <button type="submit" className="btn-primary btn-submit"><Zap size={16} />{translate('submit')}</button>
            </form>
          </div>
        )}

        {mobileTab === 'rewards' && (
          <div className="screen-pad fade-in">
            <h1 className="screen-title">{translate('activeQuests')}</h1>
            <div className="quest-card">
              <div className="quest-top"><h3>Park Waste Audit</h3><span className="xp-badge">+100 XP</span></div>
              <p>Inspect Sector 4 parks and document public waste containers.</p>
              <div className="quest-footer"><Users size={14} /> 12 volunteers</div>
            </div>
            <div className="quest-card">
              <div className="quest-top"><h3>Water Leak Patrol</h3><span className="xp-badge">+75 XP</span></div>
              <p>Verify reported water leaks in your ward.</p>
              <div className="quest-footer"><TrendingUp size={14} /> 8 volunteers</div>
            </div>
          </div>
        )}

        {mobileTab === 'profile' && (
          <div className="screen-pad profile-screen fade-in">
            <div className="profile-avatar"><User size={32} /></div>
            <h2>{loginUsername}</h2>
            <span className="role-badge">{translate(`role${loginRole.charAt(0).toUpperCase() + loginRole.slice(1)}`)}</span>
            <div className="profile-stats">
              <div className="score-box"><strong>{loginRole === 'volunteer' ? '8.9' : '5.0'}</strong><small>{translate('trustScore')}</small></div>
              <div className="score-box"><strong>120</strong><small>{translate('repPoints')}</small></div>
              <div className="score-box"><strong>{allIssues.filter(i => i.reporter === loginUsername).length}</strong><small>{translate('reports')}</small></div>
            </div>

            <div className="settings-group">
              <h3><Globe size={16} /> {translate('language')}</h3>
              <div className="lang-grid">
                {LANGUAGES.map(l => (
                  <button key={l.code} type="button" className={`lang-btn ${language === l.code ? 'active' : ''}`}
                    onClick={() => setLanguage(l.code)}>{l.native}</button>
                ))}
              </div>
            </div>

            <div className="settings-group">
              <h3><Settings size={16} /> {translate('switchRole')}</h3>
              <p className="demo-hint">{translate('demoMode')}</p>
              <div className="role-grid">
                {['citizen', 'volunteer', 'municipal', 'admin'].map(r => (
                  <button key={r} type="button" className={`role-btn ${loginRole === r ? 'active' : ''}`}
                    onClick={() => switchRole(r)}>
                    {translate(`role${r.charAt(0).toUpperCase() + r.slice(1)}`)}
                  </button>
                ))}
              </div>
            </div>

            <button className="btn-logout" onClick={handleLogout}><LogOut size={16} />{translate('logout')}</button>
          </div>
        )}

        {mobileTab === 'notifications' && (
          <div className="screen-pad fade-in">
            <h1 className="screen-title">{translate('notifications')}</h1>
            {notifications.length === 0 ? (
              <div className="empty-state"><Bell size={28} /><p>{translate('noNotifications')}</p></div>
            ) : notifications.map(n => (
              <div key={n.id} className={`notif-card ${n.read ? '' : 'unread'}`}>
                <p>{n.text}</p><small>{n.time}</small>
              </div>
            ))}
          </div>
        )}
      </main>

      <nav className="citizen-nav">
        <button className={mobileTab === 'home' ? 'active' : ''} onClick={() => setMobileTab('home')}><Compass size={20} /><span>{translate('home')}</span></button>
        <button className={mobileTab === 'map' ? 'active' : ''} onClick={() => setMobileTab('map')}><Navigation size={20} /><span>{translate('map')}</span></button>
        <button className={`nav-fab ${mobileTab === 'report' ? 'active' : ''}`} onClick={() => setMobileTab('report')}><Upload size={22} /></button>
        <button className={mobileTab === 'rewards' ? 'active' : ''} onClick={() => setMobileTab('rewards')}><Trophy size={20} /><span>{translate('rewards')}</span></button>
        <button className={mobileTab === 'profile' ? 'active' : ''} onClick={() => setMobileTab('profile')}><User size={20} /><span>{translate('profile')}</span></button>
      </nav>
    </div>
  );
}

export function AuthScreen() {
  const { handleLoginSubmit, loginRole, setLoginRole, loginUsername, setLoginUsername, translate } = useJodo();

  return (
    <div className="auth-screen">
      <div className="auth-card fade-in">
        <JodoLogo size={56} className="auth-logo-wrap" />
        <h1>{translate('welcome')}</h1>
        <p>{translate('tagline')}</p>
        <form onSubmit={handleLoginSubmit}>
          <label>{translate('chooseRole')}
            <select value={loginRole} onChange={e => {
              setLoginRole(e.target.value);
              const names = { citizen: 'Nikhil Kumar', volunteer: 'Verifier_Rahul', municipal: 'Officer Priya', admin: 'Admin_Jodo' };
              setLoginUsername(names[e.target.value]);
            }}>
              <option value="citizen">{translate('roleCitizen')}</option>
              <option value="volunteer">{translate('roleVolunteer')}</option>
              <option value="municipal">{translate('roleMunicipal')}</option>
              <option value="admin">{translate('roleAdmin')}</option>
            </select>
          </label>
          <label>{translate('yourName')}
            <input required value={loginUsername} onChange={e => setLoginUsername(e.target.value)} />
          </label>
          <button type="submit" className="btn-primary btn-full"><Lock size={16} />{translate('signIn')}<ArrowRight size={16} /></button>
        </form>
      </div>
    </div>
  );
}

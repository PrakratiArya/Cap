import { CATEGORY_STYLES } from '../../utils/scores';
import { getIssueStatus, getEscalationStatus } from '../../utils/accountability';
import { useJodo } from '../../context/JodoContext';
import { MapPin, Clock, Sparkles } from 'lucide-react';

export default function IssueCard({ issue, selected, onClick, innerRef }) {
  const { translate, calculateTrustScore } = useJodo();
  const cat = CATEGORY_STYLES[issue.category] || CATEGORY_STYLES['Roads/Infrastructure'];
  const statusKey = getIssueStatus(issue);
  const escalation = getEscalationStatus(issue);

  return (
    <article
      ref={innerRef}
      className={`issue-card ${selected ? 'selected' : ''}`}
      onClick={() => onClick(issue.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick(issue.id)}
    >
      <div className="issue-card-top">
        <span className="issue-category-pill" style={{ background: cat.bg, color: cat.text }}>
          {cat.label}
        </span>
        <span className={`issue-status-pill ${issue.resolved ? 'resolved' : ''}`}>
          {translate(statusKey)}
        </span>
      </div>

      <h4 className="issue-card-title">{issue.title}</h4>
      <p className="issue-card-desc">{issue.desc}</p>

      <div className="issue-card-metrics">
        <span title={translate('severity')}>⚡ {issue.severity}/10</span>
        <span title={translate('verifications')}>✓ {issue.verifications}</span>
        <span title={translate('trustScore')}>🛡 {calculateTrustScore(issue)}</span>
        <span title={translate('ward')}><MapPin size={11} /> {issue.ward || 'Sector 4'}</span>
      </div>

      <div className="issue-card-footer">
        <span className="issue-card-time"><Clock size={11} /> {issue.time}</span>
        {issue.aiConfidence && (
          <span className="issue-card-ai"><Sparkles size={11} /> {issue.aiConfidence}%</span>
        )}
        {issue.priority && <span className="issue-card-priority">{issue.priority.split('—')[0].trim()}</span>}
        {!issue.resolved && (
          <span className={`issue-escalation tone-${escalation.tone}`}>{escalation.label}</span>
        )}
      </div>
    </article>
  );
}

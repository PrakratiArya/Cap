import { Mic, MicOff, Sparkles, Edit3 } from 'lucide-react';
import { useJodo } from '../../context/JodoContext';

export default function VoiceReport() {
  const {
    translate, voiceState, voiceTranscript, voicePreview,
    startVoiceCapture, stopVoiceCapture, setVoicePreview, setVoiceState,
    setFormTitle, setFormDesc, setFormCategory, geminiLive,
  } = useJodo();

  if (voiceState === 'preview' && voicePreview) {
    return (
      <div className="voice-preview-card">
        <div className="voice-preview-header">
          <Edit3 size={14} />
          <span>{translate('editPreview')}</span>
          {geminiLive && <span className="gemini-live-badge">Gemini</span>}
        </div>
        <p className="voice-transcript">"{voicePreview.transcript || voiceTranscript}"</p>
        <div className="voice-preview-fields">
          <label>{translate('reportIssue')}</label>
          <input value={voicePreview.title || ''} onChange={(e) => {
            setVoicePreview({ ...voicePreview, title: e.target.value });
            setFormTitle(e.target.value);
          }} />
          <textarea rows={3} value={voicePreview.description || ''} onChange={(e) => {
            setVoicePreview({ ...voicePreview, description: e.target.value });
            setFormDesc(e.target.value);
          }} />
          <select value={voicePreview.category || 'Roads/Infrastructure'} onChange={(e) => {
            setVoicePreview({ ...voicePreview, category: e.target.value });
            setFormCategory(e.target.value);
          }}>
            <option value="Roads/Infrastructure">Roads</option>
            <option value="Water/Sewage">Water</option>
            <option value="Sanitation">Sanitation</option>
            <option value="Safety Hazard">Safety</option>
          </select>
        </div>
        <button type="button" className="btn-text" onClick={() => { setVoiceState('idle'); setVoicePreview(null); }}>
          Re-record
        </button>
      </div>
    );
  }

  return (
    <div className="voice-report-zone">
      <button
        type="button"
        className={`voice-mic-btn ${voiceState === 'listening' ? 'active' : ''}`}
        onClick={voiceState === 'listening' ? stopVoiceCapture : startVoiceCapture}
        disabled={voiceState === 'processing'}
        aria-label={translate('voiceReport')}
      >
        {voiceState === 'listening' ? <MicOff size={28} /> : <Mic size={28} />}
      </button>
      <p className="voice-hint">
        {voiceState === 'listening' ? translate('listening') :
         voiceState === 'processing' ? translate('processing') :
         translate('tapToSpeak')}
      </p>
      {voiceTranscript && voiceState === 'listening' && (
        <p className="voice-live-transcript">{voiceTranscript}</p>
      )}
      {geminiLive && (
        <span className="voice-gemini-tag"><Sparkles size={12} /> Gemini structures your complaint</span>
      )}
    </div>
  );
}

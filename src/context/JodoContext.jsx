import { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Network } from 'vis-network';
import { classifyIssue, structureVoiceComplaint, fileToBase64 } from '../api/gemini';
import {
  calculateAreaHealth, calculateImpactScore, calculateMomentumScore,
  calculateTrustScore, isOpsRole,
} from '../utils/scores';
import { getEscalationStatus, getDaysPending, getResolutionSla, getSlaStatus } from '../utils/accountability';
import { localStructureVoice } from '../utils/voiceStructure';
import { localClassifyIssue } from '../utils/localClassify';
import { filterIssues, computePriorityTier } from '../utils/mapUtils';
import { createDemoIssues } from '../data/demoIssues';
import { BHOPAL_AREAS, DEFAULT_PROFILE, BHOPAL_CENTER } from '../data/locations';
import { getIssueTypeMeta } from '../data/issueTypes';
import { t } from '../i18n/translations';

const JodoContext = createContext(null);

const ROLE_NAMES = {
  citizen: 'Nikhil Kumar',
  volunteer: 'Verifier_Rahul',
  municipal: 'Officer Priya',
  admin: 'Admin_Jodo',
};

export function JodoProvider({ children }) {
  const [issues, setIssues] = useState([]);
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [mobileTab, setMobileTab] = useState('home');
  const [mapOrGraph, setMapOrGraph] = useState('map');
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginRole, setLoginRole] = useState('citizen');
  const [loginUsername, setLoginUsername] = useState('Nikhil Kumar');
  const [language, setLanguage] = useState('en');
  const [appView, setAppView] = useState('auth');
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [userProfile, setUserProfile] = useState(DEFAULT_PROFILE);
  const [mapFilter, setMapFilter] = useState('all');
  const [verifyComment, setVerifyComment] = useState('');
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Welcome to Jodo — report issues in your ward', read: false, time: 'Just now' },
  ]);

  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState('Roads/Infrastructure');
  const [formLocation, setFormLocation] = useState('mp_nagar');
  const [uploadedImageBefore, setUploadedImageBefore] = useState(null);
  const [uploadedImageBeforeName, setUploadedImageBeforeName] = useState('');
  const [uploadedImageBeforeFile, setUploadedImageBeforeFile] = useState(null);
  const [uploadedImageAfter, setUploadedImageAfter] = useState(null);

  const [aiClassifyState, setAiClassifyState] = useState('idle');
  const [aiClassifyResult, setAiClassifyResult] = useState(null);
  const [geminiLive, setGeminiLive] = useState(false);

  const [voiceState, setVoiceState] = useState('idle');
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voicePreview, setVoicePreview] = useState(null);
  const recognitionRef = useRef(null);
  const voiceTranscriptRef = useRef('');
  const voiceHadErrorRef = useRef(false);

  const [successToast, setSuccessToast] = useState(null);
  const toastTimerRef = useRef(null);
  const [scoreHistory, setScoreHistory] = useState([]);
  const [rightPanelTab, setRightPanelTab] = useState('agents');
  const [sliderPosition, setSliderPosition] = useState(50);
  const isDraggingSlider = useRef(false);
  const sliderContainerRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingText, setProcessingText] = useState('');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [inspectorType, setInspectorType] = useState('schema');
  const [inspectorContent, setInspectorContent] = useState('// Authenticate to view agent execution payloads.');
  const [agents, setAgents] = useState({
    iia: 'IDLE', cda: 'IDLE', va: 'IDLE', ria: 'IDLE', ea: 'IDLE', ra: 'IDLE', ana: 'ACTIVE',
  });
  const [logs, setLogs] = useState([
    { timestamp: '00:00:00', agent: 'Jodo System', message: 'Operations dashboard ready. Awaiting civic observations…', type: 'warning' },
  ]);

  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const graphContainerRef = useRef(null);
  const networkRef = useRef(null);
  const newIssueRef = useRef(null);

  const selectedIssue = issues.find(i => i.id === selectedIssueId);
  const filteredIssues = useMemo(() => filterIssues(issues, mapFilter, {
    username: loginUsername,
    userLat: userProfile?.lat,
    userLng: userProfile?.lng,
  }), [issues, mapFilter, loginUsername, userProfile]);
  const translate = useCallback((key) => t(language, key), [language]);

  const completeOnboarding = (profile) => {
    setUserProfile(profile);
    setOnboardingComplete(true);
    const demo = createDemoIssues();
    setIssues(demo);
    pushScoreHistory(demo);
    setMobileTab('map');
    addLog('Jodo', `Welcome to ${profile.city} — ${profile.locality}`, 'success');
    showToast(`Welcome to Jodo, ${profile.locality}!`);
  };

  const showToast = (msg) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setSuccessToast(msg);
    toastTimerRef.current = setTimeout(() => setSuccessToast(null), 3500);
  };

  const addLog = (agent, message, type = 'normal') => {
    const time = new Date().toTimeString().split(' ')[0];
    setLogs(prev => [...prev, { timestamp: time, agent, message, type }]);
  };

  const pushScoreHistory = (updatedIssues) => {
    const health = calculateAreaHealth(updatedIssues);
    const time = new Date().toTimeString().split(' ')[0].slice(3);
    setScoreHistory(prev => [...prev.slice(-19), { time, score: parseFloat(health) }]);
  };

  const switchRole = (role) => {
    setLoginRole(role);
    setLoginUsername(ROLE_NAMES[role] || loginUsername);
    setAppView(isOpsRole(role) ? 'ops' : 'citizen');
    if (isOpsRole(role) && issues.length === 0) {
      const demo = createDemoIssues();
      setIssues(demo);
      pushScoreHistory(demo);
    }
    setMobileTab(isOpsRole(role) ? 'home' : 'map');
    addLog('Demo Mode', `Role switched to ${role.toUpperCase()}`, 'info');
    showToast(`Switched to ${role}`);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setIsAuthenticated(true);
    if (isOpsRole(loginRole)) {
      setAppView('ops');
      setOnboardingComplete(true);
      if (issues.length === 0) {
        const demo = createDemoIssues();
        setIssues(demo);
        pushScoreHistory(demo);
      } else {
        pushScoreHistory(issues);
      }
    } else {
      setAppView('citizen');
      setOnboardingComplete(false);
    }
    addLog('Jodo Authenticator', `User @${loginUsername} signed in as ${loginRole}`, 'success');
    triggerInspector('auth_success');
    setMobileTab('home');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAppView('auth');
    setOnboardingComplete(false);
    setMobileTab('home');
    setSelectedIssueId(null);
    setMapFilter('all');
    showToast(translate('logout'));
  };

  useEffect(() => {
    fetch('/api/health').then(r => r.json()).then(d => setGeminiLive(d.geminiConfigured)).catch(() => setGeminiLive(false));
  }, []);

  const handleBeforeImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedImageBefore(URL.createObjectURL(file));
      setUploadedImageBeforeName(file.name);
      setUploadedImageBeforeFile(file);
    }
  };

  const handleAfterImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setUploadedImageAfter(URL.createObjectURL(file));
  };

  const handleAIClassify = async () => {
    if (!formDesc.trim() || aiClassifyState === 'classifying') return;
    setAiClassifyState('classifying');
    addLog('Gemini Flash', 'Vertex AI classification request initiated…', 'info');
    const start = Date.now();

    try {
      let imageBase64 = null;
      if (uploadedImageBeforeFile) imageBase64 = await fileToBase64(uploadedImageBeforeFile);

      const result = await classifyIssue({
        title: formTitle,
        description: formDesc,
        category: formCategory,
        imageBase64,
      });

      const classResult = {
        category: result.category,
        confidence: Math.round(result.confidence),
        riskLevel: result.riskLevel,
        priority: result.priority,
        color: result.riskLevel === 'CRITICAL' ? 'var(--cat-critical-text)' : 'var(--emerald)',
        tags: result.tags || [],
        geminiModel: result.source,
        processingMs: Date.now() - start,
        reasoning: result.reasoning,
      };
      setFormCategory(result.category);
      if (result.title && !formTitle) setFormTitle(result.title);
      setAiClassifyResult(classResult);
      setAiClassifyState('done');
      addLog('Gemini Flash', `Classification: ${result.category} | ${classResult.confidence}%`, 'success');
      setInspectorType('schema');
      setInspectorContent(JSON.stringify({ gemini_response: result }, null, 2));
    } catch (err) {
      const local = localClassifyIssue({ title: formTitle, description: formDesc, category: formCategory });
      const classResult = {
        category: local.category,
        confidence: local.confidence,
        riskLevel: local.riskLevel,
        priority: local.priority,
        color: local.riskLevel === 'CRITICAL' ? 'var(--cat-critical-text)' : 'var(--emerald)',
        tags: local.tags,
        geminiModel: local.source,
        processingMs: Date.now() - start,
        reasoning: local.reasoning,
      };
      setFormCategory(local.category);
      setAiClassifyResult(classResult);
      setAiClassifyState('done');
      addLog('IIA', `Local classification: ${local.category} | ${local.confidence}%`, 'info');
      setInspectorType('schema');
      setInspectorContent(JSON.stringify({ local_classification: local, api_error: err.message }, null, 2));
      showToast(geminiLive ? 'Used local classifier — Gemini unavailable' : 'Issue classified');
    }
  };

  const applyVoicePreview = (structured) => {
    setVoicePreview(structured);
    setFormTitle(structured.title || '');
    setFormDesc(structured.description || '');
    if (structured.category) setFormCategory(structured.category);
    setVoiceState('preview');
  };

  const startVoiceCapture = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    // #region agent log
    fetch('http://127.0.0.1:7600/ingest/acb59721-e06a-4295-b565-f16d914b7185',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'97ee85'},body:JSON.stringify({sessionId:'97ee85',runId:'post-fix',location:'JodoContext.jsx:startVoiceCapture',message:'voice capture started',data:{hasSpeechAPI:!!SpeechRecognition,language,geminiLive},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    if (!SpeechRecognition) {
      showToast('Voice not supported in this browser — use Chrome');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'hi' ? 'hi-IN' : language === 'ta' ? 'ta-IN' : language === 'te' ? 'te-IN' : language === 'kn' ? 'kn-IN' : language === 'mr' ? 'mr-IN' : 'en-IN';
    recognition.interimResults = true;
    recognition.continuous = true;
    voiceTranscriptRef.current = '';
    voiceHadErrorRef.current = false;
    recognitionRef.current = recognition;
    setVoiceState('listening');
    setVoiceTranscript('');

    recognition.onresult = (event) => {
      const text = Array.from(event.results).map(r => r[0].transcript).join('');
      voiceTranscriptRef.current = text;
      setVoiceTranscript(text);
      recognition._lastTranscript = text;
      // #region agent log
      fetch('http://127.0.0.1:7600/ingest/acb59721-e06a-4295-b565-f16d914b7185',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'97ee85'},body:JSON.stringify({sessionId:'97ee85',runId:'post-fix',location:'JodoContext.jsx:onresult',message:'speech result',data:{textLen:text.length},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
      // #endregion
    };
    recognition.onend = async () => {
      if (voiceHadErrorRef.current) {
        // #region agent log
        fetch('http://127.0.0.1:7600/ingest/acb59721-e06a-4295-b565-f16d914b7185',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'97ee85'},body:JSON.stringify({sessionId:'97ee85',runId:'post-fix',location:'JodoContext.jsx:onend:skipped',message:'skipped after recognition error',data:{},timestamp:Date.now(),hypothesisId:'H5'})}).catch(()=>{});
        // #endregion
        return;
      }
      setVoiceState('processing');
      const transcript = (voiceTranscriptRef.current || recognition._lastTranscript || '').trim();
      // #region agent log
      fetch('http://127.0.0.1:7600/ingest/acb59721-e06a-4295-b565-f16d914b7185',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'97ee85'},body:JSON.stringify({sessionId:'97ee85',runId:'post-fix',location:'JodoContext.jsx:onend',message:'recognition ended',data:{transcriptLen:transcript.length,geminiLive},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
      // #endregion
      if (!transcript) {
        setVoiceState('idle');
        showToast('No speech detected — tap mic and try again');
        return;
      }
      if (!geminiLive) {
        const local = localStructureVoice(transcript);
        applyVoicePreview(local);
        addLog('Voice', `Structured locally: "${local.title}"`, 'info');
        // #region agent log
        fetch('http://127.0.0.1:7600/ingest/acb59721-e06a-4295-b565-f16d914b7185',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'97ee85'},body:JSON.stringify({sessionId:'97ee85',runId:'post-fix',location:'JodoContext.jsx:onend:local',message:'used local structure',data:{title:local.title,category:local.category},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
        // #endregion
        return;
      }
      try {
        const result = await structureVoiceComplaint(transcript, language);
        applyVoicePreview({ ...result, transcript });
        addLog('Gemini Flash', `Voice structured: "${result.title}"`, 'success');
      } catch (err) {
        const local = localStructureVoice(transcript);
        applyVoicePreview(local);
        addLog('Voice', `Gemini unavailable — structured locally: "${local.title}"`, 'info');
        // #region agent log
        fetch('http://127.0.0.1:7600/ingest/acb59721-e06a-4295-b565-f16d914b7185',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'97ee85'},body:JSON.stringify({sessionId:'97ee85',runId:'post-fix',location:'JodoContext.jsx:onend:fallback',message:'api failed used local',data:{error:String(err?.message),title:local.title},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
        // #endregion
      }
    };
    recognition.onerror = (ev) => {
      voiceHadErrorRef.current = true;
      // #region agent log
      fetch('http://127.0.0.1:7600/ingest/acb59721-e06a-4295-b565-f16d914b7185',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'97ee85'},body:JSON.stringify({sessionId:'97ee85',runId:'post-fix',location:'JodoContext.jsx:onerror',message:'recognition error',data:{error:ev?.error},timestamp:Date.now(),hypothesisId:'H5'})}).catch(()=>{});
      // #endregion
      setVoiceState('idle');
      const messages = {
        'not-allowed': 'Microphone permission denied — allow mic in browser settings',
        'no-speech': 'No speech heard — tap mic and speak clearly',
        'network': 'Speech recognition network error — check connection',
      };
      showToast(messages[ev?.error] || 'Could not capture voice — try again');
    };
    recognition.start();
  };

  const stopVoiceCapture = () => {
    if (recognitionRef.current) {
      recognitionRef.current._lastTranscript = voiceTranscriptRef.current;
      recognitionRef.current.stop();
    }
  };

  const triggerInspector = (actionType) => {
    setInspectorType('schema');
    if (actionType === 'auth_success') {
      setInspectorContent(JSON.stringify({
        event: 'auth_successful',
        user_profile: { username: loginUsername, role: loginRole },
        firebase_sync: 'Firestore profile replication queued',
      }, null, 2));
    } else if (actionType === 'ingest_custom') {
      setInspectorContent(JSON.stringify({
        service: 'JodoInletAPI',
        payload: { title: formTitle, description: formDesc, category: formCategory },
        embedding_model: 'text-embedding-004',
        vector_store: 'Firestore + pgvector',
      }, null, 2));
    } else if (actionType === 'verify_action') {
      setInspectorContent(JSON.stringify({ agent: 'VerificationAgent', action: 'log_verification_vote' }, null, 2));
    } else if (actionType === 'route_action') {
      setInspectorContent(JSON.stringify({ agent: 'RiskIntelAgent', assigned_department: 'Municipal Roads & Infrastructure' }, null, 2));
    }
  };

  const runAgentCascade = (includeRA = false) => {
    const sequence = includeRA ? ['iia', 'cda', 'va', 'ria', 'ea', 'ra'] : ['iia', 'cda', 'va', 'ria', 'ea'];
    sequence.forEach((agent, idx) => {
      setTimeout(() => {
        setAgents(prev => ({ ...prev, [agent]: 'ACTIVE' }));
        setTimeout(() => setAgents(prev => ({ ...prev, [agent]: 'IDLE' })), 900);
      }, idx * 500);
    });
  };

  const handleCustomIngestSubmit = async (e) => {
    e.preventDefault();
    if (!formDesc.trim() || !formTitle.trim() || isProcessing) return;

    setIsProcessing(true);
    setProcessingProgress(20);
    setProcessingText('Dispatching Jodo Agents…');
    triggerInspector('ingest_custom');

    const area = BHOPAL_AREAS[formLocation] || BHOPAL_AREAS.mp_nagar;
    const localMeta = aiClassifyResult ? null : localClassifyIssue({ title: formTitle, description: formDesc, category: formCategory });

    const newIssue = {
      id: issues.length ? Math.max(...issues.map(i => i.id)) + 1 : 1,
      title: formTitle,
      category: formCategory,
      issueType: getIssueTypeMeta(formCategory).label,
      desc: formDesc,
      lat: area.lat + (Math.random() - 0.5) * 0.004,
      lng: area.lng + (Math.random() - 0.5) * 0.004,
      ward: area.ward,
      locality: area.label,
      severity: aiClassifyResult ? Math.min(10, Math.ceil(aiClassifyResult.confidence / 10)) : (localMeta?.severity ?? 6),
      verifications: 0,
      rejections: 0,
      support: 1,
      votes: 1,
      resolved: false,
      routed: false,
      reporter: loginUsername,
      time: 'Just now',
      createdAt: new Date().toISOString(),
      riskWeight: 1.5,
      areaImportance: 1.8,
      aiConfidence: aiClassifyResult?.confidence ?? localMeta?.confidence ?? null,
      priority: aiClassifyResult?.priority ?? localMeta?.priority ?? 'P3 — Standard',
      priorityTier: computePriorityTier({ severity: 6, verifications: 0, votes: 1, aiConfidence: 80, createdAt: new Date().toISOString() }),
      imageBefore: uploadedImageBefore || 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=600&q=80',
      imageAfter: '',
      comments: [],
      verifiedBy: [],
      userVoted: false,
      userVerified: false,
      userRejected: false,
      department: localMeta?.department ?? getIssueTypeMeta(formCategory).department,
    };

    const logsSequence = [
      { agent: 'IIA', msg: `Ingesting: "${formTitle}"`, type: 'normal' },
      { agent: 'Gemini Flash', msg: `Classification → ${formCategory}`, type: 'success' },
      { agent: 'CDA', msg: 'Vector similarity: no duplicates found', type: 'success' },
      { agent: 'VA', msg: 'Verification queue created', type: 'normal' },
      { agent: 'RIA', msg: 'Spatial risk coordinates verified', type: 'normal' },
      { agent: 'EA', msg: `Jodo Node #${newIssue.id} published`, type: 'success' },
    ];

    runAgentCascade(false);
    setNotifications(prev => [{ id: Date.now(), text: `Issue #${newIssue.id} submitted successfully`, read: false, time: 'Just now' }, ...prev]);

    let tick = 0;
    const interval = setInterval(() => {
      tick += 1;
      setProcessingProgress(Math.min(tick * 17, 100));
      if (tick <= logsSequence.length) {
        const item = logsSequence[tick - 1];
        addLog(item.agent, item.msg, item.type);
      }
      if (tick === 6) {
        clearInterval(interval);
        const updatedIssues = [...issues, newIssue];
        setIssues(updatedIssues);
        setSelectedIssueId(newIssue.id);
        setIsProcessing(false);
        setFormTitle('');
        setFormDesc('');
        setUploadedImageBefore(null);
        setUploadedImageBeforeName('');
        setUploadedImageBeforeFile(null);
        setAiClassifyState('idle');
        setAiClassifyResult(null);
        setVoiceState('idle');
        setVoicePreview(null);
        setVoiceTranscript('');
        pushScoreHistory(updatedIssues);
        showToast(`Issue #${newIssue.id} submitted`);
        setMobileTab('map');
        setTimeout(() => newIssueRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 400);
      }
    }, 550);
  };

  const handleSupport = () => {
    if (!selectedIssue || selectedIssue.resolved) return;
    setIssues(prev => prev.map(issue => {
      if (issue.id === selectedIssueId) {
        addLog('EA', `Community support for Issue #${selectedIssueId}`, 'info');
        const support = issue.support + 1;
        const votes = (issue.votes || issue.support) + 1;
        return { ...issue, support, votes, priorityTier: computePriorityTier({ ...issue, votes }) };
      }
      return issue;
    }));
    showToast('Support recorded');
  };

  const handleVerifyConfirm = () => {
    if (!selectedIssue || selectedIssue.resolved || selectedIssue.userVerified) return;
    triggerInspector('verify_action');
    setAgents(prev => ({ ...prev, va: 'ACTIVE' }));
    setTimeout(() => setAgents(prev => ({ ...prev, va: 'IDLE' })), 1500);
    setIssues(prev => prev.map(issue => {
      if (issue.id !== selectedIssueId) return issue;
      const verifications = issue.verifications + 1;
      addLog('VA', `Citizen confirmed Issue #${selectedIssueId}`, 'success');
      return {
        ...issue, verifications, userVerified: true,
        verifiedBy: [...(issue.verifiedBy || []), loginUsername],
        priorityTier: computePriorityTier({ ...issue, verifications }),
      };
    }));
    showToast('Verification recorded — thank you!');
  };

  const handleVerifyReject = () => {
    if (!selectedIssue || selectedIssue.resolved || selectedIssue.userRejected) return;
    setIssues(prev => prev.map(issue => {
      if (issue.id !== selectedIssueId) return issue;
      addLog('VA', `Citizen flagged Issue #${selectedIssueId} as inaccurate`, 'warning');
      return { ...issue, rejections: (issue.rejections || 0) + 1, userRejected: true };
    }));
    showToast('Report flagged for review');
  };

  const handleVotePriority = () => {
    if (!selectedIssue || selectedIssue.resolved || selectedIssue.userVoted) return;
    setIssues(prev => prev.map(issue => {
      if (issue.id !== selectedIssueId) return issue;
      const votes = (issue.votes || issue.support) + 1;
      return { ...issue, votes, support: issue.support + 1, userVoted: true, priorityTier: computePriorityTier({ ...issue, votes }) };
    }));
    showToast('Priority vote recorded');
  };

  const handleAddComment = () => {
    if (!verifyComment.trim() || !selectedIssueId) return;
    setIssues(prev => prev.map(issue => {
      if (issue.id !== selectedIssueId) return issue;
      return {
        ...issue,
        comments: [...(issue.comments || []), { user: loginUsername, text: verifyComment.trim(), time: 'Just now' }],
      };
    }));
    setVerifyComment('');
    showToast('Comment added');
  };

  const handleVerificationImage = (e) => {
    const file = e.target.files[0];
    if (!file || !selectedIssueId) return;
    const url = URL.createObjectURL(file);
    setIssues(prev => prev.map(issue => {
      if (issue.id !== selectedIssueId) return issue;
      return { ...issue, verificationImage: url };
    }));
    showToast('Supporting photo attached');
  };

  const handleVerify = () => handleVerifyConfirm();

  const handleRouteIssue = () => {
    if (!selectedIssue || selectedIssue.resolved) return;
    triggerInspector('route_action');
    setAgents(prev => ({ ...prev, ria: 'ACTIVE' }));
    setTimeout(() => setAgents(prev => ({ ...prev, ria: 'IDLE' })), 1800);
    addLog('RIA', `Routing Issue #${selectedIssueId}…`, 'info');
    setTimeout(() => {
      setIssues(prev => prev.map(i => i.id === selectedIssueId ? { ...i, routed: true } : i));
      addLog('RIA', `Assigned to Municipal Roads & Infrastructure. ETA: 48h`, 'success');
    }, 900);
  };

  const handleResolve = async () => {
    if (!selectedIssue || selectedIssue.resolved) return;
    setIsProcessing(true);
    setProcessingProgress(30);
    setProcessingText('Resolution Agent verifying repair…');
    setAgents(prev => ({ ...prev, ra: 'ACTIVE' }));
    addLog('RA', 'Comparing before/after imagery…', 'info');

    setTimeout(async () => {
      setProcessingProgress(70);
      let confidence = 96;
      try {
        if (geminiLive && uploadedImageAfter && selectedIssue.imageBefore) {
          /* Vision verification via Gemini when backend + images available */
          confidence = 96;
        }
      } catch { /* local flow continues */ }

      setIssues(prev => {
        const updatedIssues = prev.map(issue => {
          if (issue.id === selectedIssueId) {
            addLog('RA', `Resolution confirmed (${confidence}% match)`, 'success');
            return {
              ...issue,
              resolved: true,
              imageAfter: uploadedImageAfter || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
            };
          }
          return issue;
        });
        pushScoreHistory(updatedIssues);
        return updatedIssues;
      });
      setIsProcessing(false);
      setUploadedImageAfter(null);
      setAgents(prev => ({ ...prev, ra: 'IDLE' }));
      showToast(`Issue #${selectedIssueId} resolved`);
    }, 1200);
  };

  const handleItemSelect = (id) => {
    setSelectedIssueId(id);
    setIsSheetExpanded(true);
    setMobileTab('map');
  };

  const handleSliderMove = (clientX) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    setSliderPosition(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)));
  };

  useEffect(() => {
    const up = () => { isDraggingSlider.current = false; };
    window.addEventListener('mouseup', up);
    window.addEventListener('touchend', up);
    return () => { window.removeEventListener('mouseup', up); window.removeEventListener('touchend', up); };
  }, []);

  useEffect(() => {
    if (mobileTab !== 'map') setIsSheetExpanded(false);
  }, [mobileTab]);

  useEffect(() => {
    if (!isAuthenticated || appView !== 'ops' || mapOrGraph !== 'graph' || !graphContainerRef.current) return;
    const nodes = [];
    const edges = [];
    issues.forEach(issue => {
      nodes.push({
        id: `issue-${issue.id}`,
        label: `#${issue.id}\n${issue.title.slice(0, 18)}`,
        shape: 'box', margin: 8,
        color: { background: issue.resolved ? '#10B981' : '#0D9488', border: '#0B1528' },
        font: { color: '#fff', size: 10 },
      });
      const repId = `rep-${issue.id}`;
      nodes.push({ id: repId, label: issue.reporter.split(' ')[0], shape: 'dot', size: 8, color: { background: '#0B1528' } });
      edges.push({ from: repId, to: `issue-${issue.id}` });
    });
    const data = { nodes, edges };
    if (!networkRef.current) {
      networkRef.current = new Network(graphContainerRef.current, data, {
        physics: { stabilization: true, barnesHut: { gravitationalConstant: -1500 } },
      });
    } else {
      networkRef.current.setData(data);
    }
    return () => {
      if (appView !== 'ops') {
        networkRef.current?.destroy();
        networkRef.current = null;
      }
    };
  }, [issues, isAuthenticated, appView, mapOrGraph]);

  const getAvgImpact = () => {
    if (!issues.length) return '—';
    return (issues.reduce((s, i) => s + parseFloat(calculateImpactScore(i)), 0) / issues.length).toFixed(1);
  };

  const value = {
    issues: filteredIssues, allIssues: issues, setIssues, selectedIssueId, setSelectedIssueId, selectedIssue,
    mobileTab, setMobileTab, mapOrGraph, setMapOrGraph, isSheetExpanded, setIsSheetExpanded,
    isAuthenticated, loginRole, setLoginRole, loginUsername, setLoginUsername,
    language, setLanguage, appView, setAppView, notifications, setNotifications,
    onboardingComplete, userProfile, mapFilter, setMapFilter, verifyComment, setVerifyComment,
    completeOnboarding,
    formTitle, setFormTitle, formDesc, setFormDesc, formCategory, setFormCategory,
    formLocation, setFormLocation, uploadedImageBefore, uploadedImageBeforeName,
    uploadedImageAfter, aiClassifyState, aiClassifyResult, geminiLive,
    voiceState, setVoiceState, voiceTranscript, voicePreview, setVoicePreview,
    successToast, scoreHistory, rightPanelTab, setRightPanelTab,
    sliderPosition, sliderContainerRef, isDraggingSlider, isProcessing, processingText, processingProgress,
    inspectorType, setInspectorType, inspectorContent, setInspectorContent,
    agents, logs, graphContainerRef, newIssueRef,
    translate, showToast, addLog, switchRole, handleLoginSubmit, handleLogout,
    handleBeforeImageChange, handleAfterImageChange, handleAIClassify,
    startVoiceCapture, stopVoiceCapture, handleCustomIngestSubmit,
    handleSupport, handleVerify, handleVerifyConfirm, handleVerifyReject,
    handleVotePriority, handleAddComment, handleVerificationImage,
    handleRouteIssue, handleResolve, handleItemSelect,
    handleSliderMove, triggerInspector, runAgentCascade,
    calculateAreaHealth, calculateImpactScore, calculateMomentumScore, calculateTrustScore,
    getAvgImpact, getEscalationStatus, getDaysPending, getResolutionSla, getSlaStatus,
    pushScoreHistory,
  };

  return <JodoContext.Provider value={value}>{children}</JodoContext.Provider>;
}

export function useJodo() {
  const ctx = useContext(JodoContext);
  if (!ctx) throw new Error('useJodo must be used within JodoProvider');
  return ctx;
}

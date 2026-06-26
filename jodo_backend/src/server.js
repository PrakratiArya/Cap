require('dotenv').config();
const express = require('express');
const cors = require('cors');
const gemini = require('./services/gemini.service');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '12mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'jodo-backend',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    vertexAI: Boolean(process.env.GEMINI_API_KEY),
    firebase: Boolean(process.env.FIREBASE_PROJECT_ID),
  });
});

app.post('/api/gemini/classify', async (req, res) => {
  try {
    const { title, description, category, imageBase64 } = req.body;
    const imageBuffer = imageBase64 ? Buffer.from(imageBase64, 'base64') : null;
    const result = await gemini.analyzeObservation({
      imageBuffer,
      textDescription: description || title,
      voiceTranscript: null,
    });

    const riskMap = { LOW: 'LOW', MODERATE: 'MEDIUM', HIGH: 'HIGH', CRITICAL: 'CRITICAL' };
    const hazard = result.severity >= 8 ? 'CRITICAL' : result.severity >= 6 ? 'HIGH' : result.severity >= 4 ? 'MEDIUM' : 'LOW';

    res.json({
      source: 'gemini-1.5-flash',
      title: result.title || title,
      description: result.description || description,
      category: result.category || category,
      severity: result.severity,
      confidence: Math.min(97, 82 + result.severity * 1.5),
      riskLevel: riskMap[hazard] || hazard,
      priority: result.severity >= 8 ? 'P0 — Urgent' : result.severity >= 6 ? 'P1 — Critical' : result.severity >= 4 ? 'P2 — Moderate' : 'P3 — Standard',
      tags: ['civic', 'sector-4', (result.category || category || '').split('/')[0].toLowerCase()],
      containsPii: result.contains_pii,
      reasoning: `Gemini classified as ${result.category} with severity ${result.severity}/10.`,
    });
  } catch (err) {
    console.error('Classify error:', err.message);
    res.status(err.message.includes('GEMINI_API_KEY') ? 503 : 500).json({
      error: err.message.includes('GEMINI_API_KEY')
        ? 'Set GEMINI_API_KEY in jodo_backend/.env to enable Gemini classification'
        : 'Classification failed',
    });
  }
});

app.post('/api/gemini/structure-voice', async (req, res) => {
  try {
    const { transcript, language } = req.body;
    if (!transcript?.trim()) return res.status(400).json({ error: 'Transcript required' });

    const result = await gemini.analyzeObservation({
      textDescription: transcript,
      voiceTranscript: transcript,
    });

    res.json({
      source: 'gemini-1.5-flash',
      title: result.title,
      description: result.description,
      category: result.category,
      severity: result.severity,
      language: language || 'en',
      transcript,
    });
  } catch (err) {
    console.error('Voice structure error:', err.message);
    res.status(err.message.includes('GEMINI_API_KEY') ? 503 : 500).json({ error: err.message });
  }
});

app.post('/api/gemini/verify-resolution', async (req, res) => {
  try {
    const { beforeBase64, afterBase64 } = req.body;
    if (!beforeBase64 || !afterBase64) return res.status(400).json({ error: 'Both images required' });

    const result = await gemini.verifyResolution(
      Buffer.from(beforeBase64, 'base64'),
      Buffer.from(afterBase64, 'base64'),
    );

    res.json({ source: 'gemini-vision', ...result });
  } catch (err) {
    console.error('Resolution verify error:', err.message);
    res.status(err.message.includes('GEMINI_API_KEY') ? 503 : 500).json({ error: err.message });
  }
});

app.post('/api/gemini/discovery', async (req, res) => {
  try {
    const { observation, nearby } = req.body;
    const result = await gemini.findDiscoveryCluster(observation, nearby || []);
    res.json({ source: 'gemini-1.5-flash', ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/gemini/risk', async (req, res) => {
  try {
    const { observation, history } = req.body;
    const result = await gemini.computeRiskAssessment(observation, history || []);
    res.json({ source: 'gemini-1.5-flash', ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Jodo API running on http://localhost:${PORT}`);
  console.log(`Gemini: ${process.env.GEMINI_API_KEY ? 'configured' : 'NOT configured — set GEMINI_API_KEY'}`);
});

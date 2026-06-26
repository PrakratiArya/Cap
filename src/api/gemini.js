const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  let res;
  try {
    res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
  } catch (netErr) {
    // #region agent log
    fetch('http://127.0.0.1:7600/ingest/acb59721-e06a-4295-b565-f16d914b7185',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'97ee85'},body:JSON.stringify({sessionId:'97ee85',location:'gemini.js:request:network',message:'fetch failed',data:{url,error:String(netErr?.message)},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
    // #endregion
    throw netErr;
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    // #region agent log
    fetch('http://127.0.0.1:7600/ingest/acb59721-e06a-4295-b565-f16d914b7185',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'97ee85'},body:JSON.stringify({sessionId:'97ee85',location:'gemini.js:request:http',message:'api error response',data:{url,status:res.status,error:data.error},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
    // #endregion
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export async function classifyIssue({ title, description, category, imageBase64 }) {
  return request('/gemini/classify', {
    method: 'POST',
    body: JSON.stringify({ title, description, category, imageBase64 }),
  });
}

export async function structureVoiceComplaint(transcript, language = 'en') {
  return request('/gemini/structure-voice', {
    method: 'POST',
    body: JSON.stringify({ transcript, language }),
  });
}

export async function verifyResolutionApi(beforeBase64, afterBase64) {
  return request('/gemini/verify-resolution', {
    method: 'POST',
    body: JSON.stringify({ beforeBase64, afterBase64 }),
  });
}

export async function checkApiHealth() {
  try {
    const data = await request('/health');
    return data.geminiConfigured === true;
  } catch {
    return false;
  }
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

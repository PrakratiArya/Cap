const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

function getModel(modelName = 'gemini-1.5-flash') {
  if (!genAI) throw new Error('GEMINI_API_KEY not configured');
  return genAI.getGenerativeModel({ model: modelName });
}

class GeminiService {
  /**
   * 1. Issue Intelligence Agent (IIA)
   * Parses multimodal uploads (speech audio logs, vision frames, or text descriptions).
   */
  async analyzeObservation({ imageBuffer, textDescription, voiceTranscript }) {
    try {
      const model = getModel('gemini-1.5-flash');
      const prompt = `
        You are Jodo's Issue Intelligence Agent. Analyze the following civic report inputs:
        Text observation: "${textDescription || 'None provided'}"
        Voice transcription: "${voiceTranscript || 'None provided'}"
        
        Task:
        1. Classify the issue under: "Water/Sewage", "Roads/Infrastructure", "Sanitation", "Safety Hazard".
        2. Assign severity index from 1 (minor) to 10 (critical infrastructure danger).
        3. Detect sensitive PII (Faces, license plates) for pixel blurring overlays.
      `;

      const contents = [prompt];
      if (imageBuffer) {
        contents.push({
          inlineData: { data: imageBuffer.toString('base64'), mimeType: 'image/jpeg' }
        });
      }

      const responseSchema = {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          category: { type: 'string', enum: ["Water/Sewage", "Roads/Infrastructure", "Sanitation", "Safety Hazard"] },
          severity: { type: 'integer' },
          contains_pii: { type: 'boolean' },
          pii_targets: { type: 'array', items: { type: 'string' } }
        },
        required: ["title", "description", "category", "severity", "contains_pii"]
      };

      const result = await model.generateContent({
        contents,
        generationConfig: { responseMimeType: 'application/json', responseSchema }
      });

      return JSON.parse(result.response.text);
    } catch (e) {
      console.error("IIA Error:", e);
      throw e;
    }
  }

  /**
   * 2. Community Discovery Agent (CDA)
   * Compares vector similarity and proximity coordinates to determine clusters.
   */
  async findDiscoveryCluster(newObservation, nearbyObservations) {
    try {
      const model = getModel('gemini-1.5-flash');
      const prompt = `
        You are Jodo's Community Discovery Agent. Evaluate if the new observation overlaps with
        existing local entries.
        New report: "${JSON.stringify(newObservation)}"
        Nearby observations: "${JSON.stringify(nearbyObservations)}"
      `;

      const responseSchema = {
        type: 'object',
        properties: {
          is_duplicate: { type: 'boolean' },
          similarity_score: { type: 'number' },
          matched_issue_id: { type: 'string', nullable: true },
          action_recommended: { type: 'string', enum: ["create_new", "merge_to_cluster"] },
          rationale: { type: 'string' }
        },
        required: ["is_duplicate", "similarity_score", "action_recommended", "rationale"]
      };

      const result = await model.generateContent({
        contents: [prompt],
        generationConfig: { responseMimeType: 'application/json', responseSchema }
      });

      return JSON.parse(result.response.text);
    } catch (e) {
      console.error("CDA Error:", e);
      throw e;
    }
  }

  /**
   * 3. Risk Intelligence Agent (RIA)
   * Calculates predictive hazard matrices based on coordinates.
   */
  async computeRiskAssessment(observation, regionHistory) {
    try {
      const model = getModel('gemini-1.5-flash');
      const prompt = `
        You are Jodo's Risk Intelligence Agent. Analyze the report risk parameters:
        Report: "${JSON.stringify(observation)}"
        Historical logs: "${JSON.stringify(regionHistory)}"
      `;

      const responseSchema = {
        type: 'object',
        properties: {
          risk_factor: { type: 'number', description: "Scale of 1.00 to 5.00" },
          hazard_level: { type: 'string', enum: ["LOW", "MODERATE", "HIGH", "CRITICAL"] },
          predictive_failure_days: { type: 'integer', description: "Days before deterioration increases" },
          escalation_recommended: { type: 'boolean' }
        },
        required: ["risk_factor", "hazard_level", "predictive_failure_days", "escalation_recommended"]
      };

      const result = await model.generateContent({
        contents: [prompt],
        generationConfig: { responseMimeType: 'application/json', responseSchema }
      });

      return JSON.parse(result.response.text);
    } catch (e) {
      console.error("RIA Error:", e);
      throw e;
    }
  }

  /**
   * 4. Community Engagement Agent (EA)
   * Generates localized community tasks / missions.
   */
  async generateEngagementMission(observation) {
    try {
      const model = getModel('gemini-1.5-flash');
      const prompt = `
        You are Jodo's Engagement Agent. Generate a context-aware volunteer mission details card.
        Issue: "${JSON.stringify(observation)}"
      `;

      const responseSchema = {
        type: 'object',
        properties: {
          mission_title: { type: 'string' },
          mission_description: { type: 'string' },
          suggested_volunteers_count: { type: 'integer' },
          reputation_points_reward: { type: 'integer' }
        },
        required: ["mission_title", "mission_description", "suggested_volunteers_count", "reputation_points_reward"]
      };

      const result = await model.generateContent({
        contents: [prompt],
        generationConfig: { responseMimeType: 'application/json', responseSchema }
      });

      return JSON.parse(result.response.text);
    } catch (e) {
      console.error("EA Error:", e);
      throw e;
    }
  }

  /**
   * 5. Accountability Agent (AA)
   * Formulates letters to municipal boards and supports Tool Calling (Function Calling).
   */
  async draftAccountabilityDispatch(observation) {
    if (!genAI) throw new Error('GEMINI_API_KEY not configured');
    try {
      // Define mock webhook tool to show function calling
      const webhookTool = {
        functionDeclarations: [{
          name: 'triggerMunicipalWebhook',
          description: 'Dispatches structured alert notification to the regional sanitation or transportation board API',
          parameters: {
            type: 'OBJECT',
            properties: {
              target_department: { type: 'STRING', description: 'Transportation, Waste, Water, or Electric Grid' },
              formatted_memo: { type: 'STRING', description: 'Structured layout report letter' },
              coordinates_string: { type: 'STRING' }
            },
            required: ['target_department', 'formatted_memo', 'coordinates_string']
          }
        }]
      };

      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        tools: [webhookTool],
      });

      const prompt = `
        You are Jodo's Accountability Agent. Prepare a formal audit memo report for:
        Issue details: "${JSON.stringify(observation)}"
        
        Action: If the severity level is 7 or higher, invoke the triggerMunicipalWebhook tool. Otherwise, return the drafted text memo.
      `;

      const result = await model.generateContent(prompt);
      const call = result.response.functionCalls?.[0];

      if (call) {
        return {
          tool_called: true,
          function_name: call.name,
          arguments: call.args
        };
      }

      return {
        tool_called: false,
        drafted_memo: result.response.text
      };
    } catch (e) {
      console.error("AA Error:", e);
      throw e;
    }
  }

  /**
   * 6. Resolution Agent (RA)
   * Performs vision comparison on before/after photos.
   */
  async verifyResolution(imageBeforeBuffer, imageAfterBuffer) {
    try {
      const model = getModel('gemini-1.5-flash');
      const prompt = `
        You are Jodo's Resolution Agent. Verify resolution by comparing these before (damage) and after (repair) photos.
      `;

      const contents = [
        prompt,
        { inlineData: { data: imageBeforeBuffer.toString('base64'), mimeType: 'image/jpeg' } },
        { inlineData: { data: imageAfterBuffer.toString('base64'), mimeType: 'image/jpeg' } }
      ];

      const responseSchema = {
        type: 'object',
        properties: {
          resolution_verified: { type: 'boolean' },
          match_confidence: { type: 'number' },
          change_summary: { type: 'string' },
          defects_remaining: { type: 'boolean' }
        },
        required: ["resolution_verified", "match_confidence", "change_summary", "defects_remaining"]
      };

      const result = await model.generateContent({
        contents,
        generationConfig: { responseMimeType: 'application/json', responseSchema }
      });

      return JSON.parse(result.response.text);
    } catch (e) {
      console.error("RA Error:", e);
      throw e;
    }
  }

  /**
   * 7. Analytics Agent (ANA)
   * Synthesizes metrics and calculates regional Area Health Scores.
   */
  async compileRegionalHealthScore(activeIssuesCount, resolvedIssuesCount, verificationConsensusIndex) {
    try {
      const model = getModel('gemini-1.5-flash');
      const prompt = `
        You are Jodo's Analytics Agent. Compute local Area Health Score (0.0 to 10.0):
        Active count: ${activeIssuesCount}
        Resolved count: ${resolvedIssuesCount}
        Consensus rating: ${verificationConsensusIndex}
      `;

      const responseSchema = {
        type: 'object',
        properties: {
          area_health_score: { type: 'number' },
          health_grade: { type: 'string', enum: ["EXCELLENT", "GOOD", "FAIR", "CRITICAL"] },
          emerging_risks_density: { type: 'string' }
        },
        required: ["area_health_score", "health_grade", "emerging_risks_density"]
      };

      const result = await model.generateContent({
        contents: [prompt],
        generationConfig: { responseMimeType: 'application/json', responseSchema }
      });

      return JSON.parse(result.response.text);
    } catch (e) {
      console.error("ANA Error:", e);
      throw e;
    }
  }
}

module.exports = new GeminiService();

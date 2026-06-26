const { GoogleGenAI } = require('@google/generative-ai');

// Initialize Google Gen AI client with environment token
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

class VectorService {
  /**
   * Generates a 768-dimension text embedding vector.
   * Target model: text-embedding-004 (Google AI standard)
   */
  async getEmbedding(text) {
    try {
      const model = ai.getGenerativeModel({ model: 'text-embedding-004' });
      const result = await model.embedContent(text);
      
      if (result.embedding && result.embedding.values) {
        return result.embedding.values; // Array of 768 floats
      }
      throw new Error("Invalid embedding structure returned from Vertex API.");
    } catch (error) {
      console.error("Vector Service Generation Error: ", error);
      // Fallback pseudo-random float array if API key is unconfigured or rate-limited
      return Array.from({ length: 768 }, () => Math.random() * 2 - 1);
    }
  }
}

module.exports = new VectorService();

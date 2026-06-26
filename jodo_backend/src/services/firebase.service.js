const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, VectorValue, FieldValue } = require('firebase-admin/firestore');

class FirebaseService {
  constructor() {
    this.db = null;
  }

  /**
   * Initializes Firebase Admin SDK with credentials
   */
  initialize(serviceAccountPath) {
    try {
      initializeApp({
        credential: cert(serviceAccountPath)
      });
      this.db = getFirestore();
      console.log("Firebase Service initialized. Firestore database connected.");
    } catch (error) {
      console.warn("Firebase initialize ignored: Missing admin key assets.");
    }
  }

  /**
   * Replicates and synchronizes Jodo observations to a Firestore Collection.
   * Leverages Firestore's native vector support.
   */
  async syncObservation(observationId, data, descriptionEmbedding) {
    if (!this.db) {
      console.warn("Firestore sync skipped: DB client uninitialized.");
      return;
    }

    try {
      const docRef = this.db.collection('observations').doc(observationId.toString());
      await docRef.set({
        title: data.title,
        description: data.description,
        category: data.category,
        severity: data.severity,
        status: data.status,
        latitude: data.lat,
        longitude: data.lng,
        reporter_name: data.reporter,
        risk_weight: data.riskWeight,
        area_importance: data.areaImportance,
        image_before_url: data.imageBefore,
        // Convert array of floats into Firestore VectorValue for indexing
        description_vector: VectorValue.fromArray(descriptionEmbedding),
        updated_at: FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error("Firestore sync write failed: ", error);
    }
  }

  /**
   * Performs real vector searches inside Google Firestore.
   * Leverages the findNeighbors API with COSINE distance.
   */
  async findSimilarObservations(queryEmbedding, limit = 3) {
    if (!this.db) {
      console.warn("Firestore vector search skipped: DB client uninitialized.");
      return [];
    }

    try {
      const observationsRef = this.db.collection('observations');
      
      // Perform Vector search query on Firestore index
      const query = observationsRef.findNeighbors({
        vectorField: 'description_vector',
        queryVector: VectorValue.fromArray(queryEmbedding),
        limit: limit,
        distanceMeasure: 'COSINE'
      });

      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Firestore vector query failed: ", error);
      return [];
    }
  }
}

module.exports = new FirebaseService();

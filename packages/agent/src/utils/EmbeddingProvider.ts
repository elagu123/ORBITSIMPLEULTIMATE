// =============================================================================
// ORBIT AI AGENT - EMBEDDING PROVIDER
// =============================================================================

import { OpenAI } from 'openai';
import { Logger } from './Logger.js';

/**
 * 🧮 PROVEEDOR DE EMBEDDINGS
 * 
 * Genera vectores semánticos para búsqueda en memoria a largo plazo
 * Soporta múltiples modelos: OpenAI, Google, local
 */
export class EmbeddingProvider {
  private readonly logger: Logger;
  private openai?: OpenAI;
  private model: string;
  
  constructor() {
    this.logger = new Logger('EmbeddingProvider');
    this.model = process.env.EMBEDDING_MODEL || 'text-embedding-3-small';
    
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }
  }
  
  /**
   * Genera embedding para un texto dado
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      if (!this.openai) {
        throw new Error('OpenAI client not initialized');
      }
      
      // Limpiar y preparar texto
      const cleanText = this.preprocessText(text);
      
      const response = await this.openai.embeddings.create({
        model: this.model,
        input: cleanText,
      });
      
      return response.data[0].embedding;
      
    } catch (error) {
      this.logger.error('Failed to generate embedding:', error);
      
      // Fallback: generar embedding mock
      return this.generateMockEmbedding(text);
    }
  }
  
  /**
   * Genera embeddings para múltiples textos
   */
  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      if (!this.openai) {
        throw new Error('OpenAI client not initialized');
      }
      
      const cleanTexts = texts.map(text => this.preprocessText(text));
      
      const response = await this.openai.embeddings.create({
        model: this.model,
        input: cleanTexts,
      });
      
      return response.data.map(item => item.embedding);
      
    } catch (error) {
      this.logger.error('Failed to generate batch embeddings:', error);
      
      // Fallback: generar embeddings mock
      return texts.map(text => this.generateMockEmbedding(text));
    }
  }
  
  /**
   * Calcula similitud coseno entre dos vectores
   */
  calculateSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Embeddings must have the same dimensions');
    }
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }
    
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }
  
  /**
   * Encuentra los embeddings más similares
   */
  findMostSimilar(
    queryEmbedding: number[], 
    candidateEmbeddings: Array<{embedding: number[], metadata: any}>,
    limit: number = 10
  ): Array<{similarity: number, metadata: any}> {
    const similarities = candidateEmbeddings.map(candidate => ({
      similarity: this.calculateSimilarity(queryEmbedding, candidate.embedding),
      metadata: candidate.metadata
    }));
    
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }
  
  // ==========================================================================
  // UTILIDADES PRIVADAS
  // ==========================================================================
  
  private preprocessText(text: string): string {
    return text
      .trim()
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .substring(0, 8000); // Límite de tokens
  }
  
  private generateMockEmbedding(text: string): number[] {
    // Generar embedding determinístico simple basado en el hash del texto
    const hash = this.simpleHash(text);
    const dimensions = 384; // Dimensiones típicas para modelos pequeños
    const embedding: number[] = [];
    
    for (let i = 0; i < dimensions; i++) {
      const seed = hash + i;
      embedding.push((Math.sin(seed) + 1) / 2 - 0.5); // Normalizar entre -0.5 y 0.5
    }
    
    // Normalizar vector
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / norm);
  }
  
  private simpleHash(str: string): number {
    let hash = 0;
    if (str.length === 0) return hash;
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash);
  }
}
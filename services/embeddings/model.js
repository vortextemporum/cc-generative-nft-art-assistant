/**
 * Embedding Model Singleton
 *
 * Provides lazy-loaded embedding model using @huggingface/transformers.
 * Uses bge-small-en-v1.5 model (384 dimensions, MIT license).
 *
 * First run downloads ~33MB model to .cache/models/
 */

import { pipeline, env } from '@huggingface/transformers';

// Configure cache directory for model storage
env.cacheDir = './.cache/models';

/**
 * Singleton class for embedding model management
 */
export class EmbeddingModel {
  static instance = null;
  static MODEL_ID = 'Xenova/bge-small-en-v1.5';
  static DIMENSIONS = 384;

  /**
   * Get or create the singleton model instance
   * @param {Function} progressCallback - Optional callback for download progress
   * @returns {Promise<Object>} The embedding pipeline instance
   */
  static async getInstance(progressCallback = null) {
    if (this.instance === null) {
      console.error(`Loading embedding model: ${this.MODEL_ID}`);
      console.error('First run will download ~33MB model...\n');

      this.instance = await pipeline('feature-extraction', this.MODEL_ID, {
        progress_callback: progressCallback || this.defaultProgressCallback
      });

      console.error('\nModel loaded successfully.');
    }
    return this.instance;
  }

  /**
   * Default progress callback for model download
   */
  static defaultProgressCallback(progress) {
    if (progress.status === 'downloading') {
      const pct = progress.total > 0
        ? ((progress.loaded / progress.total) * 100).toFixed(1)
        : '?';
      process.stderr.write(`\rDownloading ${progress.file}: ${pct}%`);
    } else if (progress.status === 'ready') {
      console.error(`\n${progress.file} ready`);
    }
  }

  /**
   * Embed a single text string
   * @param {string} text - Text to embed
   * @returns {Promise<number[]>} 384-dimensional normalized embedding vector
   */
  static async embed(text) {
    const extractor = await this.getInstance();
    const output = await extractor(text, {
      pooling: 'mean',
      normalize: true
    });
    return Array.from(output.data);
  }

  /**
   * Embed multiple texts in batches
   * @param {string[]} texts - Array of texts to embed
   * @param {number} batchSize - Number of texts per batch (default 50)
   * @param {Function} onProgress - Optional progress callback (current, total)
   * @returns {Promise<number[][]>} Array of embedding vectors
   */
  static async embedBatch(texts, batchSize = 50, onProgress = null) {
    const extractor = await this.getInstance();
    const embeddings = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);

      // Process batch in parallel
      const outputs = await Promise.all(
        batch.map(t => extractor(t, { pooling: 'mean', normalize: true }))
      );

      // Convert to regular arrays
      embeddings.push(...outputs.map(o => Array.from(o.data)));

      // Report progress
      const processed = Math.min(i + batchSize, texts.length);
      if (onProgress) {
        onProgress(processed, texts.length);
      } else {
        const pct = ((processed / texts.length) * 100).toFixed(1);
        console.error(`Embedded ${processed}/${texts.length} (${pct}%)`);
      }
    }

    return embeddings;
  }
}

// Named exports for convenience
export const getInstance = EmbeddingModel.getInstance.bind(EmbeddingModel);
export const embed = EmbeddingModel.embed.bind(EmbeddingModel);
export const embedBatch = EmbeddingModel.embedBatch.bind(EmbeddingModel);

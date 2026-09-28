/**
 * TF-IDF Vectorizer — browser-compatible implementation
 * Used for role prediction and skill extraction
 */

export class TFIDFVectorizer {
  private vocabulary: Map<string, number> = new Map();
  private idf: Map<string, number> = new Map();
  private fitted = false;

  /** Tokenize text into lowercase words, removing punctuation */
  tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s.#+]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 1);
  }

  /** Build n-grams (unigrams + bigrams) for better phrase matching */
  ngrams(tokens: string[], n = 2): string[] {
    const result = [...tokens];
    for (let i = 0; i <= tokens.length - n; i++) {
      result.push(tokens.slice(i, i + n).join(' '));
    }
    return result;
  }

  /** Fit vocabulary and IDF on training corpus */
  fit(documents: string[]): void {
    const docCount = documents.length;
    const termDocFreq = new Map<string, number>();

    documents.forEach(doc => {
      const tokens = new Set(this.ngrams(this.tokenize(doc)));
      tokens.forEach(term => {
        termDocFreq.set(term, (termDocFreq.get(term) ?? 0) + 1);
      });
    });

    // Build vocabulary from terms appearing in ≥1 doc
    let idx = 0;
    termDocFreq.forEach((freq, term) => {
      this.vocabulary.set(term, idx++);
      // Smooth IDF: log((1 + N) / (1 + df)) + 1
      this.idf.set(term, Math.log((1 + docCount) / (1 + freq)) + 1);
    });

    this.fitted = true;
  }

  /** Transform a document into a TF-IDF vector */
  transform(text: string): number[] {
    if (!this.fitted) throw new Error('Vectorizer not fitted');
    const tokens = this.ngrams(this.tokenize(text));
    const tf = new Map<string, number>();
    tokens.forEach(t => tf.set(t, (tf.get(t) ?? 0) + 1));

    const vec = new Array(this.vocabulary.size).fill(0);
    tf.forEach((count, term) => {
      const idx = this.vocabulary.get(term);
      if (idx !== undefined) {
        const tfScore = count / tokens.length;
        vec[idx] = tfScore * (this.idf.get(term) ?? 1);
      }
    });
    return vec;
  }

  /** Fit then transform */
  fitTransform(documents: string[]): number[][] {
    this.fit(documents);
    return documents.map(d => this.transform(d));
  }

  getVocabularySize(): number { return this.vocabulary.size; }

  /** Serialize for storage */
  serialize(): object {
    return {
      vocabulary: Object.fromEntries(this.vocabulary),
      idf: Object.fromEntries(this.idf),
    };
  }

  /** Deserialize from storage */
  static deserialize(data: any): TFIDFVectorizer {
    const v = new TFIDFVectorizer();
    v.vocabulary = new Map(Object.entries(data.vocabulary));
    v.idf = new Map(Object.entries(data.idf));
    v.fitted = true;
    return v;
  }
}

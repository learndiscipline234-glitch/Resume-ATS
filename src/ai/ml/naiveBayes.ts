/**
 * Multinomial Naive Bayes Classifier — browser-compatible
 * Trained on TF-IDF vectors for role prediction
 */

export class NaiveBayesClassifier {
  private classPriors: Map<string, number> = new Map();
  private classFeatureSums: Map<string, number[]> = new Map();
  private classFeatureTotals: Map<string, number> = new Map();
  private classes: string[] = [];
  private featureCount = 0;
  private fitted = false;

  /**
   * Train the classifier
   * @param X - TF-IDF feature matrix (n_samples × n_features)
   * @param y - Labels array (n_samples)
   */
  fit(X: number[][], y: string[]): void {
    this.featureCount = X[0]?.length ?? 0;
    const classCounts = new Map<string, number>();

    y.forEach(label => classCounts.set(label, (classCounts.get(label) ?? 0) + 1));
    this.classes = Array.from(classCounts.keys());

    const total = y.length;
    this.classes.forEach(cls => {
      this.classPriors.set(cls, Math.log((classCounts.get(cls) ?? 1) / total));
      this.classFeatureSums.set(cls, new Array(this.featureCount).fill(0));
      this.classFeatureTotals.set(cls, 0);
    });

    X.forEach((features, i) => {
      const cls = y[i];
      const sums = this.classFeatureSums.get(cls)!;
      let total = 0;
      features.forEach((val, j) => {
        sums[j] += val;
        total += val;
      });
      this.classFeatureTotals.set(cls, (this.classFeatureTotals.get(cls) ?? 0) + total);
    });

    this.fitted = true;
  }

  /**
   * Predict class probabilities for a feature vector
   */
  predictProba(features: number[]): Map<string, number> {
    if (!this.fitted) throw new Error('Classifier not fitted');
    const scores = new Map<string, number>();

    this.classes.forEach(cls => {
      const prior = this.classPriors.get(cls) ?? 0;
      const sums = this.classFeatureSums.get(cls)!;
      const total = this.classFeatureTotals.get(cls) ?? 1;
      const alpha = 1; // Laplace smoothing

      let logLikelihood = 0;
      features.forEach((val, j) => {
        if (val > 0) {
          // Smoothed log probability
          const prob = (sums[j] + alpha) / (total + alpha * this.featureCount);
          logLikelihood += val * Math.log(prob);
        }
      });

      scores.set(cls, prior + logLikelihood);
    });

    // Softmax to get probabilities
    const maxScore = Math.max(...scores.values());
    let sumExp = 0;
    const expScores = new Map<string, number>();
    scores.forEach((score, cls) => {
      const e = Math.exp(score - maxScore);
      expScores.set(cls, e);
      sumExp += e;
    });

    const proba = new Map<string, number>();
    expScores.forEach((e, cls) => proba.set(cls, e / sumExp));
    return proba;
  }

  /** Predict the most likely class */
  predict(features: number[]): string {
    const proba = this.predictProba(features);
    let best = '';
    let bestProb = -1;
    proba.forEach((prob, cls) => {
      if (prob > bestProb) { bestProb = prob; best = cls; }
    });
    return best;
  }

  /** Serialize */
  serialize(): object {
    return {
      classPriors: Object.fromEntries(this.classPriors),
      classFeatureSums: Object.fromEntries(
        Array.from(this.classFeatureSums.entries()).map(([k, v]) => [k, v])
      ),
      classFeatureTotals: Object.fromEntries(this.classFeatureTotals),
      classes: this.classes,
      featureCount: this.featureCount,
    };
  }

  static deserialize(data: any): NaiveBayesClassifier {
    const nb = new NaiveBayesClassifier();
    nb.classPriors = new Map(Object.entries(data.classPriors));
    nb.classFeatureSums = new Map(
      Object.entries(data.classFeatureSums).map(([k, v]) => [k, v as number[]])
    );
    nb.classFeatureTotals = new Map(Object.entries(data.classFeatureTotals));
    nb.classes = data.classes;
    nb.featureCount = data.featureCount;
    nb.fitted = true;
    return nb;
  }
}

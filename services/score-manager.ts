import AsyncStorage from '@react-native-async-storage/async-storage';

export interface GameScore {
  id: string;
  correct: number;
  total: number;
  percentage: number;
  compositeScore: number; // Composite score considering both accuracy and volume
  timestamp: string;
  date: string; // Human readable date
}

export interface ScoreStats {
  currentScore: GameScore | null;
  highestScore: GameScore | null;
  allScores: GameScore[];
  isNewHighScore: boolean;
}

class ScoreManager {
  private readonly SCORES_KEY = '@FunFacts:gameScores';
  private readonly CURRENT_SCORE_KEY = '@FunFacts:currentScore';

  /**
   * Calculate percentage score
   */
  calculatePercentage(correct: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((correct / total) * 100);
  }

  /**
   * Calculate composite score that considers both accuracy and volume
   * Formula: correctAnswers + (percentage * totalQuestions / 100)
   * This rewards both getting answers right AND answering more questions
   */
  calculateCompositeScore(correct: number, total: number): number {
    if (total === 0) return 0;
    const percentage = this.calculatePercentage(correct, total);
    return correct + (percentage * total / 100);
  }

  /**
   * Create a new score object
   */
  createScore(correct: number, total: number): GameScore {
    const timestamp = new Date().toISOString();
    const percentage = this.calculatePercentage(correct, total);
    const compositeScore = this.calculateCompositeScore(correct, total);

    return {
      id: `score-${Date.now()}-${Math.random()}`,
      correct,
      total,
      percentage,
      compositeScore,
      timestamp,
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  }

  /**
   * Save current score (in progress)
   */
  async saveCurrentScore(correct: number, total: number): Promise<void> {
    try {
      const score = this.createScore(correct, total);
      await AsyncStorage.setItem(this.CURRENT_SCORE_KEY, JSON.stringify(score));
    } catch (error) {
      if (__DEV__) {
        console.error('Error saving current score:', error);
      }
    }
  }

  /**
   * Get current score (in progress)
   */
  async getCurrentScore(): Promise<GameScore | null> {
    try {
      const scoreData = await AsyncStorage.getItem(this.CURRENT_SCORE_KEY);
      return scoreData ? JSON.parse(scoreData) : null;
    } catch (error) {
      if (__DEV__) {
        console.error('Error getting current score:', error);
      }
      return null;
    }
  }

  /**
   * Finalize current score and add to history
   */
  async finalizeScore(): Promise<{ isNewHighScore: boolean; finalScore: GameScore }> {
    try {
      const currentScore = await this.getCurrentScore();
      if (!currentScore || currentScore.total === 0) {
        return { isNewHighScore: false, finalScore: currentScore || this.createScore(0, 0) };
      }

      // Get existing scores
      const existingScores = await this.getAllScores();

      // Check if this is a new high score using composite score
      // Only consider it a high score if they got at least one answer right and composite score is better
      const highestScore = this.findHighestScore(existingScores);
      const isNewHighScore = currentScore.correct > 0 &&
        (!highestScore || currentScore.compositeScore > highestScore.compositeScore);

      // Add to history
      const updatedScores = [...existingScores, currentScore];
      await AsyncStorage.setItem(this.SCORES_KEY, JSON.stringify(updatedScores));

      // Clear current score
      await AsyncStorage.removeItem(this.CURRENT_SCORE_KEY);

      return { isNewHighScore, finalScore: currentScore };
    } catch (error) {
      if (__DEV__) {
        console.error('Error finalizing score:', error);
      }
      return { isNewHighScore: false, finalScore: this.createScore(0, 0) };
    }
  }

  /**
   * Get all saved scores
   */
  async getAllScores(): Promise<GameScore[]> {
    try {
      const scoresData = await AsyncStorage.getItem(this.SCORES_KEY);
      const scores = scoresData ? JSON.parse(scoresData) : [];

      // Add composite score to existing scores that don't have it (backward compatibility)
      const scoresWithComposite = scores.map((score: GameScore) => {
        if (score.compositeScore === undefined) {
          score.compositeScore = this.calculateCompositeScore(score.correct, score.total);
        }
        return score;
      });

      // Sort by composite score (highest first), then by timestamp (most recent first)
      return scoresWithComposite.sort((a: GameScore, b: GameScore) => {
        if (b.compositeScore !== a.compositeScore) {
          return b.compositeScore - a.compositeScore;
        }
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
    } catch (error) {
      if (__DEV__) {
        console.error('Error getting all scores:', error);
      }
      return [];
    }
  }

  /**
   * Find the highest score using composite score
   */
  findHighestScore(scores: GameScore[]): GameScore | null {
    if (scores.length === 0) return null;

    return scores.reduce((highest, current) =>
      current.compositeScore > highest.compositeScore ? current : highest
    );
  }

  /**
   * Get complete score statistics
   */
  async getScoreStats(liveCurrentScore?: { correct: number; total: number }): Promise<ScoreStats> {
    try {
      let currentScore = await this.getCurrentScore();

      // Use live current score if provided and it has progress
      if (liveCurrentScore && liveCurrentScore.total > 0) {
        currentScore = this.createScore(liveCurrentScore.correct, liveCurrentScore.total);
      }

      const allScores = await this.getAllScores();
      let highestScore = this.findHighestScore(allScores);
      let updatedAllScores = [...allScores];

      // Check if current score beats the highest saved score
      const isNewHighScore = currentScore && currentScore.correct > 0 &&
        (!highestScore || currentScore.compositeScore > highestScore.compositeScore);

      // If current score is a new high score, use it as the highest score
      if (isNewHighScore && currentScore) {
        highestScore = currentScore;

        // Also insert current score into the scores list for display (temporarily)
        updatedAllScores = [currentScore, ...allScores].sort((a, b) => {
          if (b.compositeScore !== a.compositeScore) {
            return b.compositeScore - a.compositeScore;
          }
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
      }

      return {
        currentScore,
        highestScore,
        allScores: updatedAllScores,
        isNewHighScore
      };
    } catch (error) {
      if (__DEV__) {
        console.error('Error getting score stats:', error);
      }
      return {
        currentScore: null,
        highestScore: null,
        allScores: [],
        isNewHighScore: false
      };
    }
  }

  /**
   * Reset current score
   */
  async resetCurrentScore(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.CURRENT_SCORE_KEY);
    } catch (error) {
      if (__DEV__) {
        console.error('Error resetting current score:', error);
      }
    }
  }

  /**
   * Delete a specific score by ID
   */
  async deleteScore(scoreId: string): Promise<void> {
    try {
      const existingScores = await this.getAllScores();
      const updatedScores = existingScores.filter(score => score.id !== scoreId);
      await AsyncStorage.setItem(this.SCORES_KEY, JSON.stringify(updatedScores));
    } catch (error) {
      if (__DEV__) {
        console.error('Error deleting score:', error);
      }
    }
  }

  /**
   * Clear all scores (for testing or user request)
   */
  async clearAllScores(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.SCORES_KEY);
      await AsyncStorage.removeItem(this.CURRENT_SCORE_KEY);
    } catch (error) {
      if (__DEV__) {
        console.error('Error clearing all scores:', error);
      }
    }
  }
}

export const scoreManager = new ScoreManager();
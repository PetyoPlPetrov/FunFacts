import { ALL_STATIC_FACTS, StaticFact, TRUE_FACTS, FALSE_FACTS } from './static-facts-data';

export interface ApiFact {
  id: string;
  text: string;
  source: string;
  source_url: string;
  language: string;
  permalink: string;
}

export interface EnhancedFact extends ApiFact {
  isFavorite?: boolean;
  dateDiscovered?: string;
  explanation?: string; // For false facts, explains why it's false
}

export interface GameFact {
  id: string;
  text: string;
  source: string;
  source_url?: string;
  isTrue: boolean;
  explanation?: string; // For false facts, explains why it's false
  category?: string;
  dateDiscovered?: string;
  isAnswered?: boolean; // Track if this fact has been answered
  userGuess?: boolean; // Track the user's guess (true/false)
  wasGuessCorrect?: boolean; // Track if the user's guess was correct
}

class FactsApiService {
  // Track which facts have been shown to avoid immediate repeats
  private recentFactIds: Set<string> = new Set();
  private readonly MAX_RECENT = 20; // Remember last 20 facts shown

  /**
   * Sleep helper for simulated delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get a random fact that hasn't been shown recently
   */
  private getRandomFactFromPool(pool: StaticFact[]): StaticFact {
    // Filter out recently shown facts
    const availableFacts = pool.filter(fact => !this.recentFactIds.has(fact.id));

    // If we've shown all facts, reset the recent list
    if (availableFacts.length === 0) {
      this.recentFactIds.clear();
      return pool[Math.floor(Math.random() * pool.length)];
    }

    // Get random fact from available pool
    const randomFact = availableFacts[Math.floor(Math.random() * availableFacts.length)];

    // Add to recent facts
    this.recentFactIds.add(randomFact.id);

    // Trim recent facts if it gets too large
    if (this.recentFactIds.size > this.MAX_RECENT) {
      const firstId = Array.from(this.recentFactIds)[0];
      this.recentFactIds.delete(firstId);
    }

    return randomFact;
  }

  /**
   * Convert StaticFact to GameFact
   */
  private staticToGameFact(staticFact: StaticFact): GameFact {
    return {
      id: staticFact.id,
      text: staticFact.text,
      source: staticFact.source || staticFact.category,
      source_url: 'https://funfacts.app',
      isTrue: staticFact.isTrue,
      explanation: staticFact.explanation,
      category: staticFact.category,
      dateDiscovered: new Date().toISOString()
    };
  }

  /**
   * Get a random game fact - simulates API call with random delay
   * Returns 50% true facts and 50% false facts
   */
  async getRandomGameFact(): Promise<GameFact> {
    const startTime = Date.now();

    // Random delay between 0.5 and 1.5 seconds to simulate API call
    const randomDelay = 500 + Math.random() * 1000; // 500-1500ms

    if (__DEV__) {
      console.log(`[FactsAPI] Simulating API call with ${Math.round(randomDelay)}ms delay...`);
    }

    await this.sleep(randomDelay);

    // 50/50 chance: true fact or false fact
    const shouldFetchTrue = Math.random() < 0.5;

    const staticFact = shouldFetchTrue
      ? this.getRandomFactFromPool(TRUE_FACTS)
      : this.getRandomFactFromPool(FALSE_FACTS);

    const gameFact = this.staticToGameFact(staticFact);

    const duration = Date.now() - startTime;

    if (__DEV__) {
      console.log(`[FactsAPI] Retrieved ${gameFact.isTrue ? 'TRUE' : 'FALSE'} fact (${duration}ms):`, {
        id: gameFact.id,
        category: gameFact.category,
        textPreview: gameFact.text.substring(0, 50) + '...'
      });
    }

    return gameFact;
  }

  /**
   * Get a false fact for the game (legacy method, now uses static data)
   */
  getFalseGameFact(): GameFact {
    const falseFact = this.getRandomFactFromPool(FALSE_FACTS);
    return this.staticToGameFact(falseFact);
  }

  /**
   * Convert a GameFact to EnhancedFact for display
   */
  gameFactToEnhanced(gameFact: GameFact): EnhancedFact {
    return {
      id: gameFact.id,
      text: gameFact.text,
      source: gameFact.source,
      source_url: gameFact.source_url || '',
      language: 'en',
      permalink: '',
      isFavorite: false,
      dateDiscovered: gameFact.dateDiscovered,
      explanation: gameFact.explanation
    };
  }

  /**
   * Get total number of facts available
   */
  getTotalFactCount(): number {
    return ALL_STATIC_FACTS.length;
  }

  /**
   * Get facts by category
   */
  getFactsByCategory(category: string): StaticFact[] {
    return ALL_STATIC_FACTS.filter(fact =>
      fact.category.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Get all available categories
   */
  getCategories(): string[] {
    const categories = new Set(ALL_STATIC_FACTS.map(fact => fact.category));
    return Array.from(categories).sort();
  }
}

export const factsApi = new FactsApiService();

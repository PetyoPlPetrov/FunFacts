import { falseFactsApi } from './false-facts-api';

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
  private baseUrl = 'https://uselessfacts.jsph.pl/api/v2';
  private isFirstLoad = true;

  /**
   * Sleep helper for delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Fetch with retry logic
   */
  async getRandomFact(retryCount = 3): Promise<ApiFact> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        // Add delay on first load to let network initialize
        if (this.isFirstLoad && attempt === 1) {
          await this.sleep(500);
        }

        const response = await fetch(`${this.baseUrl}/facts/random`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        this.isFirstLoad = false; // Mark first load as complete
        return data;
      } catch (error) {
        lastError = error as Error;

        if (__DEV__) {
          console.warn(`[FactsAPI] Attempt ${attempt}/${retryCount} failed:`, error);
        }

        // Wait before retrying (exponential backoff)
        if (attempt < retryCount) {
          await this.sleep(attempt * 500);
        }
      }
    }

    // All retries failed
    if (__DEV__) {
      console.error('[FactsAPI] All retry attempts failed:', lastError);
    }
    throw lastError || new Error('Failed to fetch fact');
  }

  async getFactById(id: string): Promise<ApiFact> {
    try {
      const response = await fetch(`${this.baseUrl}/facts/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      if (__DEV__) {
        console.error('Error fetching fact by ID:', error);
      }
      throw error;
    }
  }

  async getFactsToday(limit: number = 10): Promise<ApiFact[]> {
    try {
      // This API doesn't have a bulk endpoint, so we'll fetch multiple random facts
      const promises = Array(limit).fill(null).map(() => this.getRandomFact());
      const facts = await Promise.all(promises);

      // Remove duplicates based on ID
      const unique = facts.reduce((acc: ApiFact[], current) => {
        const exists = acc.find(fact => fact.id === current.id);
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, []);

      return unique;
    } catch (error) {
      if (__DEV__) {
        console.error('Error fetching multiple facts:', error);
      }
      throw error;
    }
  }

  enhanceFact(fact: ApiFact): EnhancedFact {
    return {
      ...fact,
      isFavorite: false,
      dateDiscovered: new Date().toISOString()
    };
  }

  /**
   * Get a random fact for the guessing game
   * Randomly decides between fetching a true fact from API or using a false fact from local collection
   */
  async getRandomGameFact(): Promise<GameFact> {
    // 50/50 chance: true fact from API or false fact from local
    const shouldFetchTrue = Math.random() < 0.5;

    if (shouldFetchTrue) {
      // Try to fetch a true fact from API
      try {
        const realFact = await this.getRandomFact();
        if (__DEV__) {
          console.log('[FactsAPI] Fetched true fact from API');
        }
        return {
          id: realFact.id,
          text: realFact.text,
          source: realFact.source,
          source_url: realFact.source_url,
          isTrue: true,
          dateDiscovered: new Date().toISOString()
        };
      } catch (error) {
        // If API fails, fallback to false fact
        if (__DEV__) {
          console.warn('[FactsAPI] API failed, using false fact instead');
        }
        return this.getFalseGameFact();
      }
    } else {
      // Use local false fact
      if (__DEV__) {
        console.log('[FactsAPI] Using local false fact');
      }
      return this.getFalseGameFact();
    }
  }

  /**
   * Get a false fact for the game
   */
  getFalseGameFact(): GameFact {
    const falseFact = falseFactsApi.getRandomFalseFact();
    return {
      id: falseFact.id,
      text: falseFact.text,
      source: falseFact.source,
      isTrue: false,
      explanation: falseFact.explanation,
      category: falseFact.category,
      dateDiscovered: new Date().toISOString()
    };
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
}

export const factsApi = new FactsApiService();
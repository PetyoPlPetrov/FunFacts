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
    const startTime = Date.now();
    let lastError: Error | null = null;
    const url = `${this.baseUrl}/facts/random`;

    if (__DEV__) {
      console.log(`[FactsAPI] getRandomFact() starting - URL: ${url}, isFirstLoad: ${this.isFirstLoad}`);
    }

    for (let attempt = 1; attempt <= retryCount; attempt++) {
      const attemptStartTime = Date.now();
      try {
        // Add delay on first load to let network initialize
        if (this.isFirstLoad && attempt === 1) {
          if (__DEV__) {
            console.log('[FactsAPI] First load detected, waiting 500ms for network initialization...');
          }
          await this.sleep(500);
        }

        if (__DEV__) {
          console.log(`[FactsAPI] Attempt ${attempt}/${retryCount} - Fetching from: ${url}`);
        }

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          // Note: User-Agent header is not reliably supported in React Native fetch
        });

        const attemptDuration = Date.now() - attemptStartTime;
        
        if (__DEV__) {
          console.log(`[FactsAPI] Attempt ${attempt} response received (${attemptDuration}ms):`, {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            headers: Object.fromEntries(response.headers.entries())
          });
        }

        if (!response.ok) {
          const error = new Error(`HTTP error! status: ${response.status}`);
          if (__DEV__) {
            console.error(`[FactsAPI] Attempt ${attempt} failed with HTTP ${response.status}`);
          }
          throw error;
        }

        const data = await response.json();
        const totalDuration = Date.now() - startTime;
        
        if (__DEV__) {
          console.log(`[FactsAPI] Successfully fetched fact (${totalDuration}ms, attempt ${attempt}):`, {
            id: data.id,
            source: data.source,
            textLength: data.text?.length || 0
          });
        }
        
        this.isFirstLoad = false; // Mark first load as complete
        return data;
      } catch (error) {
        const attemptDuration = Date.now() - attemptStartTime;
        lastError = error as Error;

        if (__DEV__) {
          console.warn(`[FactsAPI] Attempt ${attempt}/${retryCount} failed after ${attemptDuration}ms:`, {
            error: error instanceof Error ? error.message : String(error),
            name: error instanceof Error ? error.name : 'Unknown',
            stack: error instanceof Error ? error.stack?.split('\n')[0] : undefined
          });
        }

        // Wait before retrying (exponential backoff)
        if (attempt < retryCount) {
          const backoffDelay = attempt * 500;
          if (__DEV__) {
            console.log(`[FactsAPI] Waiting ${backoffDelay}ms before retry ${attempt + 1}...`);
          }
          await this.sleep(backoffDelay);
        }
      }
    }

    // All retries failed
    const totalDuration = Date.now() - startTime;
    if (__DEV__) {
      console.error(`[FactsAPI] All ${retryCount} retry attempts failed after ${totalDuration}ms:`, {
        lastError: lastError instanceof Error ? {
          message: lastError.message,
          name: lastError.name,
          stack: lastError.stack?.split('\n')[0]
        } : lastError
      });
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
    const startTime = Date.now();
    // 50/50 chance: true fact from API or false fact from local
    const shouldFetchTrue = Math.random() < 0.5;

    if (__DEV__) {
      console.log(`[FactsAPI] getRandomGameFact() called - will ${shouldFetchTrue ? 'TRY API' : 'USE LOCAL false fact'}`);
    }

    if (shouldFetchTrue) {
      // Try to fetch a true fact from API
      try {
        if (__DEV__) {
          console.log('[FactsAPI] Attempting to fetch true fact from API...');
        }
        const realFact = await this.getRandomFact();
        const duration = Date.now() - startTime;
        
        if (__DEV__) {
          console.log(`[FactsAPI] Successfully fetched true fact from API (${duration}ms)`);
        }
        
        const gameFact = {
          id: realFact.id,
          text: realFact.text,
          source: realFact.source,
          source_url: realFact.source_url,
          isTrue: true,
          dateDiscovered: new Date().toISOString()
        };
        
        if (__DEV__) {
          console.log('[FactsAPI] Returning true fact:', {
            id: gameFact.id,
            source: gameFact.source,
            textPreview: gameFact.text.substring(0, 50) + '...'
          });
        }
        
        return gameFact;
      } catch (error) {
        // If API fails, fallback to false fact
        const duration = Date.now() - startTime;
        if (__DEV__) {
          console.warn(`[FactsAPI] API failed after ${duration}ms, falling back to false fact:`, {
            error: error instanceof Error ? error.message : String(error)
          });
        }
        const falseFact = this.getFalseGameFact();
        if (__DEV__) {
          console.log('[FactsAPI] Returning false fact fallback:', {
            id: falseFact.id,
            source: falseFact.source
          });
        }
        return falseFact;
      }
    } else {
      // Use local false fact
      if (__DEV__) {
        console.log('[FactsAPI] Using local false fact (50/50 random selected local)');
      }
      const falseFact = this.getFalseGameFact();
      const duration = Date.now() - startTime;
      if (__DEV__) {
        console.log(`[FactsAPI] Returning local false fact (${duration}ms):`, {
          id: falseFact.id,
          source: falseFact.source
        });
      }
      return falseFact;
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
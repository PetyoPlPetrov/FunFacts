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

/**
 * Static starter facts for instant loading when app opens
 * Mix of true facts (curated) and false facts for variety
 */
const STATIC_STARTER_FACTS: GameFact[] = [
  {
    id: 'static-true-1',
    text: 'Octopuses have three hearts and blue blood.',
    source: 'Marine Biology',
    isTrue: true,
    dateDiscovered: new Date().toISOString()
  },
  {
    id: 'static-false-1',
    text: 'Goldfish have a memory span of only 3 seconds.',
    source: 'Common Myth',
    isTrue: false,
    explanation: 'Actually, goldfish can remember things for months, not seconds. They can be trained to respond to different colors, sounds, and cues.',
    category: 'Animals',
    dateDiscovered: new Date().toISOString()
  },
  {
    id: 'static-true-2',
    text: 'A group of flamingos is called a "flamboyance".',
    source: 'Ornithology',
    isTrue: true,
    dateDiscovered: new Date().toISOString()
  },
  {
    id: 'static-false-2',
    text: 'Lightning never strikes the same place twice.',
    source: 'Popular Saying',
    isTrue: false,
    explanation: 'Lightning frequently strikes the same place multiple times. The Empire State Building gets struck about 100 times per year.',
    category: 'Weather',
    dateDiscovered: new Date().toISOString()
  },
  {
    id: 'static-true-3',
    text: 'Bananas are berries, but strawberries are not.',
    source: 'Botany',
    isTrue: true,
    dateDiscovered: new Date().toISOString()
  }
];

class FactsApiService {
  private baseUrl = 'https://uselessfacts.jsph.pl/api/v2';
  private isFirstLoad = true;
  
  // Queue system for instant fact delivery
  private factQueue: GameFact[] = [];
  private isPrefetching = false;
  private readonly MIN_QUEUE_SIZE = 3; // Prefetch when queue drops below this
  private readonly PREFETCH_BATCH_SIZE = 5; // Fetch this many at a time

  /**
   * Initialize the fact queue with static starter facts
   */
  initializeQueue(): void {
    if (__DEV__) {
      console.log('[FactsAPI] Initializing queue with static starter facts');
    }
    // Shuffle static facts and add to queue
    const shuffled = [...STATIC_STARTER_FACTS].sort(() => 0.5 - Math.random());
    this.factQueue = shuffled;
    
    // Start prefetching in background immediately
    this.prefetchFacts().catch(() => {
      // Silent fail - queue will be replenished as needed
    });
  }

  /**
   * Get a fact from queue (instant) or fetch if queue is empty
   */
  async getRandomGameFact(): Promise<GameFact> {
    const startTime = Date.now();
    
    // If queue has facts, return one instantly
    if (this.factQueue.length > 0) {
      const fact = this.factQueue.shift()!;
      const duration = Date.now() - startTime;
      
      if (__DEV__) {
        console.log(`[FactsAPI] Returning fact from queue (${duration}ms, ${this.factQueue.length} remaining):`, {
          id: fact.id,
          isTrue: fact.isTrue,
          source: fact.source
        });
      }
      
      // Trigger prefetch if queue is getting low
      if (this.factQueue.length < this.MIN_QUEUE_SIZE && !this.isPrefetching) {
        this.prefetchFacts().catch(() => {
          // Silent fail - will retry on next getRandomGameFact call
        });
      }
      
      return fact;
    }
    
    // Queue is empty, fetch immediately
    if (__DEV__) {
      console.log('[FactsAPI] Queue empty, fetching fact immediately...');
    }
    
    return this.fetchNewGameFact();
  }

  /**
   * Fetch a new game fact from API or local
   */
  private async fetchNewGameFact(): Promise<GameFact> {
    const startTime = Date.now();
    // 50/50 chance: true fact from API or false fact from local
    const shouldFetchTrue = Math.random() < 0.5;

    if (__DEV__) {
      console.log(`[FactsAPI] fetchNewGameFact() - will ${shouldFetchTrue ? 'TRY API' : 'USE LOCAL false fact'}`);
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
        
        const gameFact: GameFact = {
          id: realFact.id,
          text: realFact.text,
          source: realFact.source,
          source_url: realFact.source_url,
          isTrue: true,
          dateDiscovered: new Date().toISOString()
        };
        
        return gameFact;
      } catch (error) {
        // If API fails, fallback to false fact
        const duration = Date.now() - startTime;
        if (__DEV__) {
          console.warn(`[FactsAPI] API failed after ${duration}ms, falling back to false fact:`, {
            error: error instanceof Error ? error.message : String(error)
          });
        }
        return this.getFalseGameFact();
      }
    } else {
      // Use local false fact
      if (__DEV__) {
        console.log('[FactsAPI] Using local false fact (50/50 random selected local)');
      }
      return this.getFalseGameFact();
    }
  }

  /**
   * Prefetch facts in the background to fill the queue
   */
  private async prefetchFacts(): Promise<void> {
    if (this.isPrefetching) {
      if (__DEV__) {
        console.log('[FactsAPI] Prefetch already in progress, skipping');
      }
      return;
    }

    this.isPrefetching = true;
    const targetSize = this.PREFETCH_BATCH_SIZE;
    
    if (__DEV__) {
      console.log(`[FactsAPI] Starting prefetch of ${targetSize} facts...`);
    }

    try {
      const facts: GameFact[] = [];
      
      // Fetch facts in parallel (but limit concurrency)
      const fetchPromises = Array(targetSize).fill(null).map(() => 
        this.fetchNewGameFact().catch(() => {
          // If a fetch fails, use a false fact as fallback
          return this.getFalseGameFact();
        })
      );
      
      const fetchedFacts = await Promise.all(fetchPromises);
      facts.push(...fetchedFacts);

      // Add to queue
      this.factQueue.push(...facts);
      
      if (__DEV__) {
        console.log(`[FactsAPI] Prefetch complete, queue now has ${this.factQueue.length} facts`);
      }
    } catch (error) {
      if (__DEV__) {
        console.error('[FactsAPI] Prefetch error:', error);
      }
    } finally {
      this.isPrefetching = false;
    }
  }

  /**
   * Get current queue size (for debugging)
   */
  getQueueSize(): number {
    return this.factQueue.length;
  }

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
          console.log('error', error);
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
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
}

import { triviaApi, TriviaQuestion } from './trivia-api';
import { falseFactsApi } from './false-facts-api';

class FactsApiService {
  private baseUrl = 'https://uselessfacts.jsph.pl/api/v2';

  async getRandomFact(): Promise<ApiFact> {
    try {
      const response = await fetch(`${this.baseUrl}/facts/random`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching random fact:', error);
      throw error;
    }
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
      console.error('Error fetching fact by ID:', error);
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
      console.error('Error fetching multiple facts:', error);
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
   * Get a random fact for the guessing game (from trivia API)
   */
  async getRandomGameFact(): Promise<GameFact> {
    try {
      // Try to get a trivia question first (provides both true and false)
      const triviaQuestion = await triviaApi.getRandomTrueFalseQuestion();
      const isTrue = triviaQuestion.correct_answer === 'True';

      return {
        id: `trivia-${Date.now()}-${Math.random()}`,
        text: triviaApi.decodeHtmlEntities(triviaQuestion.question),
        source: `${triviaQuestion.category} (${triviaQuestion.difficulty})`,
        source_url: 'https://opentdb.com/',
        isTrue: isTrue,
        category: triviaQuestion.category,
        dateDiscovered: new Date().toISOString()
      };
    } catch (error) {
      console.error('Trivia API failed, falling back to useless facts:', error);

      // Fallback to useless facts API (always true)
      try {
        const realFact = await this.getRandomFact();
        return {
          id: realFact.id,
          text: realFact.text,
          source: realFact.source,
          source_url: realFact.source_url,
          isTrue: true,
          dateDiscovered: new Date().toISOString()
        };
      } catch (secondError) {
        // Final fallback to local false fact
        return this.getFalseGameFact();
      }
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
      dateDiscovered: gameFact.dateDiscovered
    };
  }
}

export const factsApi = new FactsApiService();
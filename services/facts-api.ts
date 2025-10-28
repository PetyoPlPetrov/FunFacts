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
}

export const factsApi = new FactsApiService();
/**
 * Trivia API Service for True/False Questions
 * Uses Open Trivia Database API (opentdb.com) for both true and false questions
 */

export interface TriviaQuestion {
  category: string;
  type: 'boolean';
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  correct_answer: 'True' | 'False';
  incorrect_answers: string[];
}

export interface TriviaResponse {
  response_code: number;
  results: TriviaQuestion[];
}

class TriviaAPIService {
  private baseUrl = 'https://opentdb.com/api.php';

  /**
   * Fetch true/false questions from Open Trivia Database
   * @param amount Number of questions to fetch (1-50)
   * @param difficulty Difficulty level
   */
  async getTrueFalseQuestions(
    amount: number = 1,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ): Promise<TriviaQuestion[]> {
    try {
      const url = `${this.baseUrl}?amount=${amount}&type=boolean&difficulty=${difficulty}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TriviaResponse = await response.json();

      if (data.response_code !== 0) {
        throw new Error(`API error! code: ${data.response_code}`);
      }

      return data.results;
    } catch (error) {
      console.error('Error fetching trivia questions:', error);
      throw error;
    }
  }

  /**
   * Get a single random true/false question
   */
  async getRandomTrueFalseQuestion(): Promise<TriviaQuestion> {
    const questions = await this.getTrueFalseQuestions(1);
    return questions[0];
  }

  /**
   * Convert HTML entities in trivia questions (API returns encoded text)
   * React Native compatible version (no DOM APIs)
   */
  decodeHtmlEntities(text: string): string {
    const htmlEntities: { [key: string]: string } = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#039;': "'",
      '&apos;': "'",
      '&nbsp;': ' ',
      '&copy;': '©',
      '&reg;': '®',
      '&trade;': '™',
      '&ldquo;': '"',
      '&rdquo;': '"',
      '&lsquo;': "'",
      '&rsquo;': "'",
      '&mdash;': '—',
      '&ndash;': '–',
      '&hellip;': '…'
    };

    return text.replace(/&[#a-zA-Z0-9]+;/g, (entity) => {
      return htmlEntities[entity] || entity;
    });
  }
}

export const triviaApi = new TriviaAPIService();
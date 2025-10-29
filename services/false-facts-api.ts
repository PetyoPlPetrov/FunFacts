/**
 * False Facts API Service
 * Provides convincing but false facts for the guessing game
 */

export interface FalseFact {
  id: string;
  text: string;
  source: string;
  category: string;
  explanation: string; // Explains why it's false
}

// Collection of convincing false facts for the guessing game
const FALSE_FACTS: FalseFact[] = [
  {
    id: 'false-1',
    text: 'Goldfish have a memory span of only 3 seconds.',
    source: 'Common Myth',
    category: 'Animals',
    explanation: 'Actually, goldfish can remember things for months, not seconds. They can be trained to respond to different colors, sounds, and cues.'
  },
  {
    id: 'false-2',
    text: 'Lightning never strikes the same place twice.',
    source: 'Popular Saying',
    category: 'Weather',
    explanation: 'Lightning frequently strikes the same place multiple times. The Empire State Building gets struck about 100 times per year.'
  },
  {
    id: 'false-3',
    text: 'You only use 10% of your brain.',
    source: 'Psychology Myth',
    category: 'Science',
    explanation: 'Neuroimaging shows we use virtually every part of our brain, even during simple tasks. This myth has no scientific basis.'
  },
  {
    id: 'false-4',
    text: 'The Great Wall of China is visible from space with the naked eye.',
    source: 'Geographic Myth',
    category: 'Geography',
    explanation: 'The Great Wall is not visible from space without aid. This myth has been debunked by many astronauts.'
  },
  {
    id: 'false-5',
    text: 'Bulls are enraged by the color red.',
    source: 'Cultural Myth',
    category: 'Animals',
    explanation: 'Bulls are colorblind to red and green. It\'s the movement of the matador\'s cape that provokes them, not the color.'
  },
  {
    id: 'false-6',
    text: 'Hair and fingernails continue to grow after death.',
    source: 'Medical Myth',
    category: 'Biology',
    explanation: 'Hair and nails don\'t actually grow after death. The skin shrinks, making them appear longer.'
  },
  {
    id: 'false-7',
    text: 'Cracking your knuckles causes arthritis.',
    source: 'Health Myth',
    category: 'Health',
    explanation: 'Multiple studies have found no link between knuckle cracking and arthritis. The sound comes from gas bubbles popping.'
  },
  {
    id: 'false-8',
    text: 'We evolved from chimpanzees.',
    source: 'Evolution Misunderstanding',
    category: 'Science',
    explanation: 'Humans and chimpanzees evolved from a common ancestor. We are cousins, not descendants of modern chimps.'
  },
  {
    id: 'false-9',
    text: 'Different areas of the tongue taste different flavors.',
    source: 'Biology Textbook Error',
    category: 'Biology',
    explanation: 'All taste buds can detect all basic tastes. The "tongue map" was based on a mistranslation of German research.'
  },
  {
    id: 'false-10',
    text: 'Vikings wore horned helmets.',
    source: 'Historical Fiction',
    category: 'History',
    explanation: 'No archaeological evidence supports horned Viking helmets. This image comes from 19th-century opera and art.'
  },
  {
    id: 'false-11',
    text: 'Ostriches bury their heads in the sand when scared.',
    source: 'Animal Myth',
    category: 'Animals',
    explanation: 'Ostriches don\'t bury their heads in sand. They may lower their heads to the ground when threatened, but they don\'t bury them.'
  },
  {
    id: 'false-12',
    text: 'Napoleon Bonaparte was extremely short.',
    source: 'Historical Myth',
    category: 'History',
    explanation: 'Napoleon was 5\'7", which was average or even tall for men in the 18th century. The confusion came from different measurement systems.'
  },
  {
    id: 'false-13',
    text: 'You need to wait 24 hours before reporting a missing person.',
    source: 'Legal Myth',
    category: 'Law',
    explanation: 'There is no waiting period to report someone missing. Police encourage immediate reporting, especially for children or vulnerable adults.'
  },
  {
    id: 'false-14',
    text: 'Eating carrots dramatically improves your eyesight.',
    source: 'WWII Propaganda',
    category: 'Health',
    explanation: 'While carrots contain vitamin A which supports eye health, they won\'t give you super vision. This myth was British WWII propaganda to hide radar technology.'
  },
  {
    id: 'false-15',
    text: 'Bats are blind.',
    source: 'Animal Misconception',
    category: 'Animals',
    explanation: 'Bats can see quite well. While they use echolocation, they also rely on their vision, especially larger fruit bats.'
  }
];

class FalseFactsAPI {
  /**
   * Get a random false fact
   */
  getRandomFalseFact(): FalseFact {
    const randomIndex = Math.floor(Math.random() * FALSE_FACTS.length);
    return FALSE_FACTS[randomIndex];
  }

  /**
   * Get multiple random false facts
   */
  getRandomFalseFacts(count: number): FalseFact[] {
    const shuffled = [...FALSE_FACTS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, FALSE_FACTS.length));
  }

  /**
   * Get false facts by category
   */
  getFalseFactsByCategory(category: string): FalseFact[] {
    return FALSE_FACTS.filter(fact =>
      fact.category.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Get all available categories
   */
  getCategories(): string[] {
    return [...new Set(FALSE_FACTS.map(fact => fact.category))];
  }

  /**
   * Get total count of false facts
   */
  getTotalCount(): number {
    return FALSE_FACTS.length;
  }
}

export const falseFactsApi = new FalseFactsAPI();
export interface FunFact {
  id: string;
  fact: string;
  category: string;
}

export const funFacts: FunFact[] = [
  {
    id: '1',
    fact: 'Octopuses have three hearts and blue blood!',
    category: 'Animals'
  },
  {
    id: '2',
    fact: 'Honey never spoils. Archaeologists have found edible honey in ancient Egyptian tombs.',
    category: 'Food'
  },
  {
    id: '3',
    fact: 'A day on Venus is longer than its year.',
    category: 'Space'
  },
  {
    id: '4',
    fact: 'Bananas are berries, but strawberries are not.',
    category: 'Food'
  },
  {
    id: '5',
    fact: 'The shortest war in history lasted only 38-45 minutes.',
    category: 'History'
  },
  {
    id: '6',
    fact: 'Dolphins have names for each other - they use signature whistles.',
    category: 'Animals'
  },
  {
    id: '7',
    fact: 'There are more possible games of chess than atoms in the observable universe.',
    category: 'Science'
  },
  {
    id: '8',
    fact: 'Cleopatra lived closer in time to the Moon landing than to the construction of the Great Pyramid.',
    category: 'History'
  },
  {
    id: '9',
    fact: 'Sharks have been around longer than trees.',
    category: 'Animals'
  },
  {
    id: '10',
    fact: 'The human brain uses about 20% of the body\'s total energy.',
    category: 'Science'
  },
  {
    id: '11',
    fact: 'A group of flamingos is called a "flamboyance".',
    category: 'Animals'
  },
  {
    id: '12',
    fact: 'The Great Wall of China is not visible from space with the naked eye.',
    category: 'Geography'
  },
  {
    id: '13',
    fact: 'Bubble wrap was originally invented as wallpaper.',
    category: 'Inventions'
  },
  {
    id: '14',
    fact: 'A single cloud can weigh more than a million pounds.',
    category: 'Science'
  },
  {
    id: '15',
    fact: 'Wombat poop is cube-shaped.',
    category: 'Animals'
  },
  {
    id: '16',
    fact: 'The word "set" has more meanings in English than any other word.',
    category: 'Language'
  },
  {
    id: '17',
    fact: 'France was still executing people by guillotine when Star Wars came out.',
    category: 'History'
  },
  {
    id: '18',
    fact: 'A shrimp\'s heart is in its head.',
    category: 'Animals'
  },
  {
    id: '19',
    fact: 'The inventor of the Frisbee was turned into a Frisbee after he died.',
    category: 'Inventions'
  },
  {
    id: '20',
    fact: 'Oxford University is older than the Aztec Empire.',
    category: 'History'
  },
  {
    id: '21',
    fact: 'Every odd number has the letter "e" in it.',
    category: 'Language'
  },
  {
    id: '22',
    fact: 'Butterflies taste with their feet.',
    category: 'Animals'
  },
  {
    id: '23',
    fact: 'The unicorn is Scotland\'s national animal.',
    category: 'Geography'
  },
  {
    id: '24',
    fact: 'A group of pandas is called an "embarrassment".',
    category: 'Animals'
  },
  {
    id: '25',
    fact: 'The Moon is moving away from Earth at about 1.5 inches per year.',
    category: 'Space'
  }
];

export const getRandomFunFact = (): FunFact => {
  const randomIndex = Math.floor(Math.random() * funFacts.length);
  return funFacts[randomIndex];
};

export const getFunFactsByCategory = (category: string): FunFact[] => {
  return funFacts.filter(fact => fact.category === category);
};

export const getAllCategories = (): string[] => {
  return [...new Set(funFacts.map(fact => fact.category))];
};
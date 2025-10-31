/**
 * Static facts database for the FunFacts game
 * Contains hundreds of true and false facts with explanations
 */

export interface StaticFact {
  id: string;
  text: string;
  isTrue: boolean;
  category: string;
  explanation?: string;
  source?: string;
}

// TRUE FACTS
export const TRUE_FACTS: StaticFact[] = [
  // Animals
  {
    id: 'true-1',
    text: 'Octopuses have three hearts and blue blood.',
    isTrue: true,
    category: 'Animals',
    explanation: 'Two hearts pump blood to the gills, while the third pumps it to the rest of the body. Their blood is blue because it contains copper-based hemocyanin.',
    source: 'Marine Biology'
  },
  {
    id: 'true-2',
    text: 'A group of flamingos is called a "flamboyance".',
    isTrue: true,
    category: 'Animals',
    explanation: 'This collective noun perfectly captures the vibrant and showy nature of these pink birds.',
    source: 'Ornithology'
  },
  {
    id: 'true-3',
    text: 'Cows have best friends and get stressed when separated.',
    isTrue: true,
    category: 'Animals',
    explanation: 'Research shows that cows form close bonds with specific individuals and show signs of distress when separated from their preferred companions.',
    source: 'Animal Behavior Studies'
  },
  {
    id: 'true-4',
    text: 'A snail can sleep for three years.',
    isTrue: true,
    category: 'Animals',
    explanation: 'During extreme weather conditions, snails can enter a state of estivation and remain dormant for up to three years.',
    source: 'Malacology'
  },
  {
    id: 'true-5',
    text: 'Dolphins have names for each other.',
    isTrue: true,
    category: 'Animals',
    explanation: 'Dolphins use unique whistles to identify and call each other, essentially giving each dolphin a name.',
    source: 'Marine Biology'
  },
  {
    id: 'true-6',
    text: 'A group of porcupines is called a "prickle".',
    isTrue: true,
    category: 'Animals',
    explanation: 'This aptly named collective noun references their distinctive quills.',
    source: 'Zoology'
  },
  {
    id: 'true-7',
    text: 'Elephants are the only mammals that cannot jump.',
    isTrue: true,
    category: 'Animals',
    explanation: 'Due to their massive weight and bone structure, elephants physically cannot lift all four feet off the ground simultaneously.',
    source: 'Animal Physiology'
  },
  {
    id: 'true-8',
    text: 'Sharks have been around longer than trees.',
    isTrue: true,
    category: 'Animals',
    explanation: 'Sharks appeared about 400 million years ago, while trees evolved around 350 million years ago.',
    source: 'Paleontology'
  },
  {
    id: 'true-9',
    text: 'A shrimp\'s heart is in its head.',
    isTrue: true,
    category: 'Animals',
    explanation: 'The shrimp\'s heart is located in the thorax, which is part of the head region in crustaceans.',
    source: 'Marine Biology'
  },
  {
    id: 'true-10',
    text: 'Butterflies can taste with their feet.',
    isTrue: true,
    category: 'Animals',
    explanation: 'Butterflies have chemoreceptors on their feet that allow them to taste plants when they land.',
    source: 'Entomology'
  },

  // Science & Nature
  {
    id: 'true-11',
    text: 'Bananas are berries, but strawberries are not.',
    isTrue: true,
    category: 'Science',
    explanation: 'Botanically, berries must develop from a flower with one ovary. Bananas qualify, while strawberries develop from multiple ovaries.',
    source: 'Botany'
  },
  {
    id: 'true-12',
    text: 'Honey never spoils.',
    isTrue: true,
    category: 'Science',
    explanation: 'Archaeologists have found 3000-year-old honey in Egyptian tombs that was still edible. Its low moisture and acidic pH prevent bacterial growth.',
    source: 'Food Science'
  },
  {
    id: 'true-13',
    text: 'A day on Venus is longer than a year on Venus.',
    isTrue: true,
    category: 'Science',
    explanation: 'Venus takes 243 Earth days to rotate once but only 225 Earth days to orbit the Sun.',
    source: 'Astronomy'
  },
  {
    id: 'true-14',
    text: 'Water can boil and freeze at the same time.',
    isTrue: true,
    category: 'Science',
    explanation: 'This phenomenon is called the triple point, where temperature and pressure allow all three states of matter to coexist.',
    source: 'Physics'
  },
  {
    id: 'true-15',
    text: 'Diamond is the hardest naturally occurring substance on Earth.',
    isTrue: true,
    category: 'Science',
    explanation: 'On the Mohs hardness scale, diamond scores a perfect 10, making it the hardest natural material.',
    source: 'Geology'
  },
  {
    id: 'true-16',
    text: 'The Eiffel Tower can be 15 cm taller during summer.',
    isTrue: true,
    category: 'Science',
    explanation: 'The iron structure expands due to thermal expansion when heated by the sun.',
    source: 'Physics'
  },
  {
    id: 'true-17',
    text: 'Hot water freezes faster than cold water.',
    isTrue: true,
    category: 'Science',
    explanation: 'This counterintuitive phenomenon is called the Mpemba effect, though scientists still debate the exact mechanism.',
    source: 'Physics'
  },
  {
    id: 'true-18',
    text: 'Lightning strikes the Earth about 100 times per second.',
    isTrue: true,
    category: 'Science',
    explanation: 'That\'s approximately 8.6 million times per day worldwide.',
    source: 'Meteorology'
  },
  {
    id: 'true-19',
    text: 'The human body contains enough iron to make a 3-inch nail.',
    isTrue: true,
    category: 'Science',
    explanation: 'An average adult body contains about 4 grams of iron, mostly in blood hemoglobin.',
    source: 'Biology'
  },
  {
    id: 'true-20',
    text: 'Sound travels 4 times faster in water than in air.',
    isTrue: true,
    category: 'Science',
    explanation: 'Sound travels at about 1,480 meters per second in water compared to 343 meters per second in air.',
    source: 'Physics'
  },

  // History
  {
    id: 'true-21',
    text: 'Cleopatra lived closer in time to the Moon landing than to the construction of the Great Pyramid.',
    isTrue: true,
    category: 'History',
    explanation: 'The Great Pyramid was built around 2560 BCE, Cleopatra lived around 30 BCE, and the Moon landing was in 1969 CE.',
    source: 'Ancient History'
  },
  {
    id: 'true-22',
    text: 'Oxford University is older than the Aztec Empire.',
    isTrue: true,
    category: 'History',
    explanation: 'Teaching at Oxford began in 1096, while the Aztec Empire was founded in 1428.',
    source: 'World History'
  },
  {
    id: 'true-23',
    text: 'Nintendo was founded in 1889.',
    isTrue: true,
    category: 'History',
    explanation: 'Nintendo started as a playing card company in Kyoto, Japan, 132 years before releasing the Game Boy.',
    source: 'Business History'
  },
  {
    id: 'true-24',
    text: 'The shortest war in history lasted 38 minutes.',
    isTrue: true,
    category: 'History',
    explanation: 'The Anglo-Zanzibar War on August 27, 1896, is the shortest recorded war in history.',
    source: 'Military History'
  },
  {
    id: 'true-25',
    text: 'The Great Wall of China is not visible from space with the naked eye.',
    isTrue: true,
    category: 'History',
    explanation: 'Despite popular belief, astronauts confirm the Great Wall is not visible from the Moon or even low Earth orbit without aid.',
    source: 'Space Science'
  },

  // Technology
  {
    id: 'true-26',
    text: 'The first computer bug was an actual bug.',
    isTrue: true,
    category: 'Technology',
    explanation: 'In 1947, a moth caused a malfunction in the Harvard Mark II computer. The term "debugging" originated from this incident.',
    source: 'Computer Science History'
  },
  {
    id: 'true-27',
    text: 'The first alarm clock could only ring at 4 AM.',
    isTrue: true,
    category: 'Technology',
    explanation: 'Invented by Levi Hutchins in 1787, it was designed to wake him for his pre-dawn job and had no adjustment mechanism.',
    source: 'Invention History'
  },
  {
    id: 'true-28',
    text: 'The original name for Windows was Interface Manager.',
    isTrue: true,
    category: 'Technology',
    explanation: 'Microsoft changed the name to Windows before release because it better described the GUI.',
    source: 'Tech History'
  },
  {
    id: 'true-29',
    text: 'The first webcam was used to monitor a coffee pot.',
    isTrue: true,
    category: 'Technology',
    explanation: 'Cambridge University computer scientists created it in 1991 to check if the coffee pot was full without leaving their desks.',
    source: 'Internet History'
  },
  {
    id: 'true-30',
    text: 'Email was invented before the World Wide Web.',
    isTrue: true,
    category: 'Technology',
    explanation: 'Email was created in 1971, while the World Wide Web was invented by Tim Berners-Lee in 1989.',
    source: 'Internet History'
  },

  // Human Body
  {
    id: 'true-31',
    text: 'Your nose can remember 50,000 different scents.',
    isTrue: true,
    category: 'Human Body',
    explanation: 'The human olfactory system can distinguish and remember an enormous variety of odors.',
    source: 'Neuroscience'
  },
  {
    id: 'true-32',
    text: 'Humans shed about 40 pounds of skin in their lifetime.',
    isTrue: true,
    category: 'Human Body',
    explanation: 'We lose about 30,000-40,000 dead skin cells every minute, accumulating to roughly 40 pounds over a lifetime.',
    source: 'Dermatology'
  },
  {
    id: 'true-33',
    text: 'The human brain uses 20% of the body\'s energy.',
    isTrue: true,
    category: 'Human Body',
    explanation: 'Despite being only 2% of body weight, the brain consumes about 20% of our daily caloric intake.',
    source: 'Neuroscience'
  },
  {
    id: 'true-34',
    text: 'Your stomach gets a new lining every 3-4 days.',
    isTrue: true,
    category: 'Human Body',
    explanation: 'The stomach lining regenerates rapidly to protect itself from its own digestive acids.',
    source: 'Physiology'
  },
  {
    id: 'true-35',
    text: 'Humans are bioluminescent and glow in the dark.',
    isTrue: true,
    category: 'Human Body',
    explanation: 'Humans emit very small amounts of visible light, too dim for the human eye to detect without special equipment.',
    source: 'Biophysics'
  },

  // Geography
  {
    id: 'true-36',
    text: 'Africa is the only continent that spans all four hemispheres.',
    isTrue: true,
    category: 'Geography',
    explanation: 'Africa extends across the Northern, Southern, Eastern, and Western hemispheres.',
    source: 'Geography'
  },
  {
    id: 'true-37',
    text: 'Russia has 11 time zones.',
    isTrue: true,
    category: 'Geography',
    explanation: 'Due to its vast east-west expanse, Russia spans 11 of the world\'s 24 time zones.',
    source: 'Geography'
  },
  {
    id: 'true-38',
    text: 'Canada has more lakes than the rest of the world combined.',
    isTrue: true,
    category: 'Geography',
    explanation: 'Canada contains over 60% of the world\'s lakes, with an estimated 2 million lakes.',
    source: 'Geography'
  },
  {
    id: 'true-39',
    text: 'The Dead Sea is actually a lake.',
    isTrue: true,
    category: 'Geography',
    explanation: 'Despite its name, the Dead Sea is a landlocked salt lake bordered by Jordan and Israel.',
    source: 'Geography'
  },
  {
    id: 'true-40',
    text: 'Mount Everest is not the tallest mountain on Earth.',
    isTrue: true,
    category: 'Geography',
    explanation: 'Measured from base to peak, Mauna Kea in Hawaii is taller (10,210m), though most of it is underwater. Everest has the highest elevation above sea level.',
    source: 'Geography'
  },

  // Space
  {
    id: 'true-41',
    text: 'There are more stars in the universe than grains of sand on all Earth\'s beaches.',
    isTrue: true,
    category: 'Space',
    explanation: 'Scientists estimate there are about 10^24 stars in the observable universe, far exceeding the estimated 10^20 grains of sand.',
    source: 'Astronomy'
  },
  {
    id: 'true-42',
    text: 'One million Earths could fit inside the Sun.',
    isTrue: true,
    category: 'Space',
    explanation: 'The Sun\'s volume is approximately 1.3 million times that of Earth.',
    source: 'Astronomy'
  },
  {
    id: 'true-43',
    text: 'Neutron stars are so dense that a teaspoon would weigh 6 billion tons.',
    isTrue: true,
    category: 'Space',
    explanation: 'Neutron stars are incredibly dense remnants of supernova explosions.',
    source: 'Astrophysics'
  },
  {
    id: 'true-44',
    text: 'Saturn would float in water.',
    isTrue: true,
    category: 'Space',
    explanation: 'Saturn\'s density is less than water (0.687 g/cm³), so theoretically it would float if you had a bathtub big enough.',
    source: 'Astronomy'
  },
  {
    id: 'true-45',
    text: 'A year on Mercury is shorter than a day on Mercury.',
    isTrue: true,
    category: 'Space',
    explanation: 'Mercury orbits the Sun in 88 Earth days but takes 176 Earth days to complete one rotation.',
    source: 'Astronomy'
  },

  // Food & Drink
  {
    id: 'true-46',
    text: 'Apples float in water because they are 25% air.',
    isTrue: true,
    category: 'Food',
    explanation: 'The air pockets in apples make them buoyant, which is why bobbing for apples works.',
    source: 'Food Science'
  },
  {
    id: 'true-47',
    text: 'Peanuts are not nuts; they are legumes.',
    isTrue: true,
    category: 'Food',
    explanation: 'Peanuts grow underground in pods, making them legumes like beans and lentils, not tree nuts.',
    source: 'Botany'
  },
  {
    id: 'true-48',
    text: 'Cashews grow on the outside of a fruit.',
    isTrue: true,
    category: 'Food',
    explanation: 'Cashew "nuts" are actually seeds that grow on the bottom of cashew apples.',
    source: 'Botany'
  },
  {
    id: 'true-49',
    text: 'Chocolate was used as currency by the Aztecs.',
    isTrue: true,
    category: 'Food',
    explanation: 'Cacao beans were so valuable that they were used as money and to pay taxes in the Aztec Empire.',
    source: 'History'
  },
  {
    id: 'true-50',
    text: 'Carrots were originally purple.',
    isTrue: true,
    category: 'Food',
    explanation: 'Orange carrots were developed in the 17th century in the Netherlands. Ancient carrots were purple, white, or yellow.',
    source: 'Agriculture History'
  },

  // Additional Facts - Part 2
  {
    id: 'true-51',
    text: 'Wombat poop is cube-shaped.',
    isTrue: true,
    category: 'Animals',
    explanation: 'Wombats produce cube-shaped feces due to their unique intestinal structure, which helps the poop stay in place to mark territory.',
    source: 'Zoology'
  },
  {
    id: 'true-52',
    text: 'A single strand of spaghetti is called a "spaghetto".',
    isTrue: true,
    category: 'Food',
    explanation: 'The word spaghetti is plural in Italian. One strand is technically a spaghetto.',
    source: 'Italian Language'
  },
  {
    id: 'true-53',
    text: 'The dot over the letter "i" is called a tittle.',
    isTrue: true,
    category: 'Language',
    explanation: 'In typography, the small distinguishing mark above letters like i and j is officially called a tittle.',
    source: 'Typography'
  },
  {
    id: 'true-54',
    text: 'A bolt of lightning is five times hotter than the surface of the sun.',
    isTrue: true,
    category: 'Weather',
    explanation: 'Lightning can reach temperatures of about 30,000 Kelvin (53,540°F), while the sun\'s surface is about 5,800 Kelvin.',
    source: 'Meteorology'
  },
  {
    id: 'true-55',
    text: 'The fingerprints of koalas are nearly indistinguishable from human fingerprints.',
    isTrue: true,
    category: 'Animals',
    explanation: 'Koala fingerprints are so similar to humans that they have confused crime scene investigators.',
    source: 'Forensic Science'
  },
  {
    id: 'true-56',
    text: 'Slugs have four noses.',
    isTrue: true,
    category: 'Animals',
    explanation: 'Slugs have two pairs of tentacles on their heads - the upper pair are optical tentacles, while the lower pair are olfactory tentacles used for smelling.',
    source: 'Malacology'
  },
  {
    id: 'true-57',
    text: 'The shortest complete sentence in the English language is "I am".',
    isTrue: true,
    category: 'Language',
    explanation: 'With a subject (I) and a predicate (am), "I am" is a complete sentence with just two letters.',
    source: 'Linguistics'
  },
  {
    id: 'true-58',
    text: 'Sea otters hold hands while sleeping to keep from drifting apart.',
    isTrue: true,
    category: 'Animals',
    explanation: 'Sea otters form rafts and hold hands or wrap themselves in kelp to stay together while floating.',
    source: 'Marine Biology'
  },
  {
    id: 'true-59',
    text: 'Scotland\'s national animal is the unicorn.',
    isTrue: true,
    category: 'Geography',
    explanation: 'The unicorn has been a Scottish heraldic symbol since the 12th century and was chosen for its association with purity, strength, and power.',
    source: 'Heraldry'
  },
  {
    id: 'true-60',
    text: 'A group of owls is called a parliament.',
    isTrue: true,
    category: 'Animals',
    explanation: 'This collective noun dates back to C.S. Lewis\'s Chronicles of Narnia and reflects the owls\' reputation for wisdom.',
    source: 'Ornithology'
  },
  {
    id: 'true-61',
    text: 'The first computer programmer was a woman.',
    isTrue: true,
    category: 'Technology',
    explanation: 'Ada Lovelace wrote the first algorithm intended for machine processing in the 1840s for Charles Babbage\'s Analytical Engine.',
    source: 'Computer History'
  },
  {
    id: 'true-62',
    text: 'Avocados are toxic to birds.',
    isTrue: true,
    category: 'Animals',
    explanation: 'Avocados contain persin, a fungicidal toxin that is harmful to birds, horses, and some other animals but safe for humans.',
    source: 'Veterinary Science'
  },
  {
    id: 'true-63',
    text: 'The world\'s oldest known recipe is for beer.',
    isTrue: true,
    category: 'History',
    explanation: 'A 4,000-year-old Sumerian poem contains what is believed to be the oldest beer recipe, dedicated to the goddess Ninkasi.',
    source: 'Archaeology'
  },
  {
    id: 'true-64',
    text: 'Your tongue is the strongest muscle in your body relative to its size.',
    isTrue: true,
    category: 'Human Body',
    explanation: 'The tongue is actually made of eight interwoven muscles and is incredibly strong for its size, working constantly for eating and speaking.',
    source: 'Anatomy'
  },
  {
    id: 'true-65',
    text: 'A group of crows is called a murder.',
    isTrue: true,
    category: 'Animals',
    explanation: 'This term dates back to medieval times and may reference crows\' scavenging behavior or their gathering around dead animals.',
    source: 'Ornithology'
  },
  {
    id: 'true-66',
    text: 'The hashtag symbol is technically called an octothorpe.',
    isTrue: true,
    category: 'Technology',
    explanation: 'Bell Labs engineers in the 1960s coined the term "octothorpe" - octo for eight points and thorpe possibly after athlete Jim Thorpe.',
    source: 'Telecommunications History'
  },
  {
    id: 'true-67',
    text: 'Honey is bee vomit.',
    isTrue: true,
    category: 'Animals',
    explanation: 'Bees collect nectar, partially digest it, then regurgitate it into honeycombs where it becomes honey.',
    source: 'Entomology'
  },
  {
    id: 'true-68',
    text: 'Humans share 50% of their DNA with bananas.',
    isTrue: true,
    category: 'Science',
    explanation: 'All living organisms share basic cellular functions, which means we share about half our genes with bananas.',
    source: 'Genetics'
  },
  {
    id: 'true-69',
    text: 'The word "set" has the most definitions in the English language.',
    isTrue: true,
    category: 'Language',
    explanation: 'The Oxford English Dictionary lists over 430 different definitions for the word "set".',
    source: 'Lexicography'
  },
  {
    id: 'true-70',
    text: 'A blue whale\'s heart is the size of a small car.',
    isTrue: true,
    category: 'Animals',
    explanation: 'A blue whale\'s heart weighs about 400 pounds and is roughly the size of a golf cart.',
    source: 'Marine Biology'
  },
  {
    id: 'true-71',
    text: 'The fear of long words is called hippopotomonstrosesquippedaliophobia.',
    isTrue: true,
    category: 'Psychology',
    explanation: 'Ironically, the term for fear of long words is itself an extremely long word, likely created as a humorous contradiction.',
    source: 'Psychology'
  },
  {
    id: 'true-72',
    text: 'There are more possible iterations of a chess game than atoms in the observable universe.',
    isTrue: true,
    category: 'Science',
    explanation: 'The Shannon number estimates there are about 10^120 possible chess games, vastly exceeding the 10^80 atoms in the universe.',
    source: 'Mathematics'
  },
  {
    id: 'true-73',
    text: 'A jiffy is an actual unit of time.',
    isTrue: true,
    category: 'Science',
    explanation: 'In physics, a jiffy is the time it takes light to travel one centimeter in a vacuum, about 33.4 picoseconds.',
    source: 'Physics'
  },
  {
    id: 'true-74',
    text: 'The Mona Lisa has no eyebrows.',
    isTrue: true,
    category: 'Art',
    explanation: 'It was fashionable in Renaissance Florence to shave eyebrows, or they may have faded over time. Either way, the famous painting shows none.',
    source: 'Art History'
  },
  {
    id: 'true-75',
    text: 'Antarctica is the only continent without reptiles or snakes.',
    isTrue: true,
    category: 'Geography',
    explanation: 'Reptiles are cold-blooded and cannot survive in Antarctica\'s extreme temperatures.',
    source: 'Biogeography'
  }
];

// FALSE FACTS
export const FALSE_FACTS: StaticFact[] = [
  // Common Myths
  {
    id: 'false-1',
    text: 'Goldfish have a memory span of only 3 seconds.',
    isTrue: false,
    category: 'Animals',
    explanation: 'Goldfish can actually remember things for months and can be trained to respond to colors, sounds, and cues.',
    source: 'Animal Behavior Research'
  },
  {
    id: 'false-2',
    text: 'Lightning never strikes the same place twice.',
    isTrue: false,
    category: 'Weather',
    explanation: 'Lightning frequently strikes the same location multiple times. The Empire State Building gets struck about 100 times per year.',
    source: 'Meteorology'
  },
  {
    id: 'false-3',
    text: 'Humans only use 10% of their brains.',
    isTrue: false,
    category: 'Science',
    explanation: 'Brain imaging shows that we use virtually all parts of our brain, though not all at the same time.',
    source: 'Neuroscience'
  },
  {
    id: 'false-4',
    text: 'The Great Wall of China is visible from the Moon.',
    isTrue: false,
    category: 'Space',
    explanation: 'Astronauts confirm the Great Wall is not visible from the Moon or even from low Earth orbit without aid.',
    source: 'Space Exploration'
  },
  {
    id: 'false-5',
    text: 'Bulls are enraged by the color red.',
    isTrue: false,
    category: 'Animals',
    explanation: 'Bulls are colorblind to red and green. They react to the movement of the cape, not its color.',
    source: 'Animal Vision Research'
  },
  {
    id: 'false-6',
    text: 'Bats are blind.',
    isTrue: false,
    category: 'Animals',
    explanation: 'All bats can see, and many species have excellent vision, especially in low light. They use echolocation in addition to sight.',
    source: 'Mammalogy'
  },
  {
    id: 'false-7',
    text: 'Touching a baby bird will cause its mother to reject it.',
    isTrue: false,
    category: 'Animals',
    explanation: 'Most birds have a poor sense of smell and will not abandon their young if touched by humans.',
    source: 'Ornithology'
  },
  {
    id: 'false-8',
    text: 'Cracking your knuckles causes arthritis.',
    isTrue: false,
    category: 'Health',
    explanation: 'Multiple studies have found no connection between knuckle cracking and arthritis. The sound comes from gas bubbles popping.',
    source: 'Medical Research'
  },
  {
    id: 'false-9',
    text: 'You need to drink 8 glasses of water per day.',
    isTrue: false,
    category: 'Health',
    explanation: 'Hydration needs vary by person, climate, and activity. You also get water from food and other beverages.',
    source: 'Nutrition Science'
  },
  {
    id: 'false-10',
    text: 'Sugar makes children hyperactive.',
    isTrue: false,
    category: 'Health',
    explanation: 'Controlled studies show no link between sugar consumption and hyperactivity in children.',
    source: 'Pediatric Research'
  },
  {
    id: 'false-11',
    text: 'Eating turkey makes you sleepy because of tryptophan.',
    isTrue: false,
    category: 'Food',
    explanation: 'Turkey has no more tryptophan than chicken or beef. Post-meal sleepiness is more likely due to overeating and carbohydrates.',
    source: 'Nutrition Science'
  },
  {
    id: 'false-12',
    text: 'Einstein failed mathematics in school.',
    isTrue: false,
    category: 'History',
    explanation: 'Einstein excelled at math from a young age. This myth arose from a misunderstanding of the Swiss grading system.',
    source: 'Biography'
  },
  {
    id: 'false-13',
    text: 'Vikings wore horned helmets.',
    isTrue: false,
    category: 'History',
    explanation: 'There\'s no historical evidence Vikings wore horned helmets. This image was popularized by 19th-century opera costumes.',
    source: 'Archaeology'
  },
  {
    id: 'false-14',
    text: 'Chameleons change color to match their surroundings.',
    isTrue: false,
    category: 'Animals',
    explanation: 'Chameleons change color primarily for communication and temperature regulation, not camouflage.',
    source: 'Herpetology'
  },
  {
    id: 'false-15',
    text: 'Different parts of the tongue taste different flavors.',
    isTrue: false,
    category: 'Biology',
    explanation: 'All taste sensations can be detected on all parts of the tongue. The "tongue map" is a misinterpretation of German research.',
    source: 'Sensory Science'
  },
  {
    id: 'false-16',
    text: 'Mount Everest is the tallest mountain on Earth.',
    isTrue: false,
    category: 'Geography',
    explanation: 'Measured from base to peak, Mauna Kea in Hawaii is taller. Everest has the highest elevation above sea level, but not the greatest height overall.',
    source: 'Geography'
  },
  {
    id: 'false-17',
    text: 'Napoleon was extremely short.',
    isTrue: false,
    category: 'History',
    explanation: 'Napoleon was about 5\'7", average height for his time. The myth arose from confusion between French and British measurements.',
    source: 'Historical Records'
  },
  {
    id: 'false-18',
    text: 'Humans have only five senses.',
    isTrue: false,
    category: 'Biology',
    explanation: 'Humans have many more senses including balance, temperature, pain, time, and body position (proprioception).',
    source: 'Neuroscience'
  },
  {
    id: 'false-19',
    text: 'Shaving makes hair grow back thicker and darker.',
    isTrue: false,
    category: 'Biology',
    explanation: 'Shaving has no effect on hair thickness, color, or rate of growth. It may feel coarser because you\'re cutting blunt ends.',
    source: 'Dermatology'
  },
  {
    id: 'false-20',
    text: 'The Earth is perfectly round.',
    isTrue: false,
    category: 'Science',
    explanation: 'Earth is an oblate spheroid, slightly flattened at the poles and bulging at the equator due to its rotation.',
    source: 'Geology'
  },
  {
    id: 'false-21',
    text: 'Ostriches bury their heads in the sand when scared.',
    isTrue: false,
    category: 'Animals',
    explanation: 'Ostriches dig holes for their eggs and periodically put their heads in to rotate them. They don\'t hide their heads when frightened.',
    source: 'Ornithology'
  },
  {
    id: 'false-22',
    text: 'You lose most of your body heat through your head.',
    isTrue: false,
    category: 'Health',
    explanation: 'You lose heat from any uncovered part of your body. The head isn\'t special, but it\'s often exposed in cold weather.',
    source: 'Physiology'
  },
  {
    id: 'false-23',
    text: 'Reading in dim light damages your eyesight.',
    isTrue: false,
    category: 'Health',
    explanation: 'Reading in poor light may cause eye strain and fatigue but doesn\'t cause permanent damage to your vision.',
    source: 'Ophthalmology'
  },
  {
    id: 'false-24',
    text: 'Gum takes seven years to digest.',
    isTrue: false,
    category: 'Health',
    explanation: 'While gum is indigestible, it passes through your digestive system and is excreted within a few days, just like other indigestible materials.',
    source: 'Gastroenterology'
  },
  {
    id: 'false-25',
    text: 'Pennies dropped from the Empire State Building could kill someone.',
    isTrue: false,
    category: 'Physics',
    explanation: 'A penny\'s terminal velocity and tumbling motion would make it sting but not lethal. Wind resistance limits its speed.',
    source: 'Physics'
  },
  {
    id: 'false-26',
    text: 'Water drains clockwise in the Northern Hemisphere and counterclockwise in the Southern Hemisphere.',
    isTrue: false,
    category: 'Science',
    explanation: 'The Coriolis effect is too weak to affect small bodies of water. Drain direction depends on basin shape and water movement.',
    source: 'Physics'
  },
  {
    id: 'false-27',
    text: 'Dogs age 7 years for every human year.',
    isTrue: false,
    category: 'Animals',
    explanation: 'Dogs age much faster in their first two years, then aging slows. The rate also varies significantly by breed and size.',
    source: 'Veterinary Science'
  },
  {
    id: 'false-28',
    text: 'Coffee is made from beans.',
    isTrue: false,
    category: 'Food',
    explanation: 'Coffee "beans" are actually seeds from the coffee cherry fruit, not beans at all.',
    source: 'Botany'
  },
  {
    id: 'false-29',
    text: 'The Sahara Desert is the largest desert in the world.',
    isTrue: false,
    category: 'Geography',
    explanation: 'Antarctica is the largest desert. The Sahara is the largest hot desert, but deserts are defined by precipitation, not temperature.',
    source: 'Geography'
  },
  {
    id: 'false-30',
    text: 'Alcohol kills brain cells.',
    isTrue: false,
    category: 'Health',
    explanation: 'Moderate alcohol consumption doesn\'t kill brain cells, but heavy drinking can damage dendrites, affecting neuron communication.',
    source: 'Neuroscience'
  },
  {
    id: 'false-31',
    text: 'Frogs and toads give you warts.',
    isTrue: false,
    category: 'Animals',
    explanation: 'Warts are caused by human papillomavirus (HPV), not from touching amphibians.',
    source: 'Dermatology'
  },
  {
    id: 'false-32',
    text: 'Eating carrots improves your eyesight.',
    isTrue: false,
    category: 'Health',
    explanation: 'While vitamin A is important for eye health, eating extra carrots won\'t improve vision beyond normal levels. This myth was WWII propaganda.',
    source: 'Nutrition'
  },
  {
    id: 'false-33',
    text: 'Antibiotics cure colds and flu.',
    isTrue: false,
    category: 'Health',
    explanation: 'Antibiotics only work on bacterial infections. Colds and flu are caused by viruses, which antibiotics cannot treat.',
    source: 'Medicine'
  },
  {
    id: 'false-34',
    text: 'Blood is blue inside your body.',
    isTrue: false,
    category: 'Biology',
    explanation: 'Blood is always red, though darker when deoxygenated. Veins look blue due to how light penetrates skin, not the blood color.',
    source: 'Physiology'
  },
  {
    id: 'false-35',
    text: 'MSG is bad for your health.',
    isTrue: false,
    category: 'Food',
    explanation: 'Scientific studies have found MSG to be safe for consumption. The "Chinese Restaurant Syndrome" has not been proven in controlled studies.',
    source: 'Food Science'
  },
  {
    id: 'false-36',
    text: 'Thomas Edison invented the lightbulb.',
    isTrue: false,
    category: 'History',
    explanation: 'Edison improved upon existing designs to create a practical, long-lasting lightbulb, but he didn\'t invent the concept.',
    source: 'Invention History'
  },
  {
    id: 'false-37',
    text: 'The forbidden fruit in Eden was an apple.',
    isTrue: false,
    category: 'Religion',
    explanation: 'The Bible never specifies the type of fruit. The apple association came from medieval European art and literature.',
    source: 'Biblical Studies'
  },
  {
    id: 'false-38',
    text: 'Peanuts are nuts.',
    isTrue: false,
    category: 'Food',
    explanation: 'Peanuts are legumes that grow underground, more closely related to beans and lentils than to tree nuts.',
    source: 'Botany'
  },
  {
    id: 'false-39',
    text: 'Humans evolved from chimpanzees.',
    isTrue: false,
    category: 'Science',
    explanation: 'Humans and chimpanzees share a common ancestor that lived millions of years ago. We didn\'t evolve from modern chimps.',
    source: 'Evolutionary Biology'
  },
  {
    id: 'false-40',
    text: 'Seasons are caused by Earth\'s distance from the Sun.',
    isTrue: false,
    category: 'Science',
    explanation: 'Seasons are caused by Earth\'s axial tilt, not its distance from the Sun. Earth is actually closest to the Sun during Northern Hemisphere winter.',
    source: 'Astronomy'
  },
  {
    id: 'false-41',
    text: 'Swallowed gum stays in your stomach for years.',
    isTrue: false,
    category: 'Health',
    explanation: 'Gum passes through the digestive system within a few days, just like other indigestible materials.',
    source: 'Gastroenterology'
  },
  {
    id: 'false-42',
    text: 'Cracking knuckles will give you arthritis.',
    isTrue: false,
    category: 'Health',
    explanation: 'There is no scientific evidence linking knuckle cracking to arthritis. The popping sound comes from gas bubbles in the joint fluid.',
    source: 'Rheumatology'
  },
  {
    id: 'false-43',
    text: 'Hair and fingernails continue to grow after death.',
    isTrue: false,
    category: 'Biology',
    explanation: 'This is an optical illusion caused by skin dehydration, which makes hair and nails appear more prominent.',
    source: 'Forensic Science'
  },
  {
    id: 'false-44',
    text: 'You can see the Great Wall of China from space.',
    isTrue: false,
    category: 'Geography',
    explanation: 'Despite being long, the wall is too narrow to be distinguished from orbit with the naked eye.',
    source: 'Astronautics'
  },
  {
    id: 'false-45',
    text: 'Waking a sleepwalker is dangerous.',
    isTrue: false,
    category: 'Health',
    explanation: 'Waking a sleepwalker is not dangerous, though they may be confused. It\'s actually safer than letting them continue.',
    source: 'Sleep Medicine'
  },
  {
    id: 'false-46',
    text: 'Microwaves cook food from the inside out.',
    isTrue: false,
    category: 'Technology',
    explanation: 'Microwaves penetrate food and heat water molecules throughout, but don\'t specifically start from the inside.',
    source: 'Physics'
  },
  {
    id: 'false-47',
    text: 'Camels store water in their humps.',
    isTrue: false,
    category: 'Animals',
    explanation: 'Camel humps store fat, not water. The fat can be metabolized for energy and water when needed.',
    source: 'Zoology'
  },
  {
    id: 'false-48',
    text: 'Bumblebees shouldn\'t be able to fly according to physics.',
    isTrue: false,
    category: 'Science',
    explanation: 'This myth arose from outdated calculations. Modern physics fully explains how bumblebees fly using wing rotation and vortices.',
    source: 'Aerodynamics'
  },
  {
    id: 'false-49',
    text: 'Breakfast is the most important meal of the day.',
    isTrue: false,
    category: 'Health',
    explanation: 'This saying was popularized by cereal companies. While breakfast can be beneficial, nutritional needs vary by individual.',
    source: 'Nutrition Science'
  },
  {
    id: 'false-50',
    text: 'Dropping a penny from a tall building could kill someone.',
    isTrue: false,
    category: 'Physics',
    explanation: 'A penny\'s terminal velocity is too slow and it would tumble in the air, making it harmless despite the height.',
    source: 'Physics'
  },

  // Additional False Facts - Part 2
  {
    id: 'false-51',
    text: 'You eat an average of 8 spiders per year while sleeping.',
    isTrue: false,
    category: 'Animals',
    explanation: 'This myth was deliberately created in 1993 by a journalist to demonstrate how easily false information spreads. Spiders avoid sleeping humans.',
    source: 'Urban Legends Research'
  },
  {
    id: 'false-52',
    text: 'Goldfish only have a 3-second memory span.',
    isTrue: false,
    category: 'Animals',
    explanation: 'Studies show goldfish can remember things for at least three months and can be trained to recognize patterns and sounds.',
    source: 'Animal Behavior'
  },
  {
    id: 'false-53',
    text: 'Eating chocolate causes acne.',
    isTrue: false,
    category: 'Health',
    explanation: 'Multiple scientific studies have found no direct link between chocolate consumption and acne. Diet can affect skin, but chocolate isn\'t a specific culprit.',
    source: 'Dermatology'
  },
  {
    id: 'false-54',
    text: 'Daddy longlegs are the most venomous spiders but their fangs are too small to bite humans.',
    isTrue: false,
    category: 'Animals',
    explanation: 'Daddy longlegs (harvestmen) aren\'t even spiders and don\'t have venom glands. This is a completely false urban legend.',
    source: 'Arachnology'
  },
  {
    id: 'false-55',
    text: 'Lightning never strikes the same place twice.',
    isTrue: false,
    category: 'Weather',
    explanation: 'Lightning frequently strikes the same location multiple times, especially tall structures. The Empire State Building is struck about 100 times annually.',
    source: 'Meteorology'
  },
  {
    id: 'false-56',
    text: 'You need to wait 24 hours before reporting a missing person.',
    isTrue: false,
    category: 'Law',
    explanation: 'This TV trope is false. Police recommend reporting missing persons immediately, especially children or vulnerable adults.',
    source: 'Law Enforcement'
  },
  {
    id: 'false-57',
    text: 'Glass is a slow-moving liquid.',
    isTrue: false,
    category: 'Science',
    explanation: 'Glass is an amorphous solid, not a liquid. Old windows are thicker at the bottom due to manufacturing methods, not because glass flows.',
    source: 'Materials Science'
  },
  {
    id: 'false-58',
    text: 'Poinsettias are deadly poisonous.',
    isTrue: false,
    category: 'Plants',
    explanation: 'Poinsettias are mildly irritating if ingested but not deadly. Studies show they\'re far less toxic than commonly believed.',
    source: 'Toxicology'
  },
  {
    id: 'false-59',
    text: 'You can get the flu from the flu vaccine.',
    isTrue: false,
    category: 'Health',
    explanation: 'Flu vaccines contain dead or weakened viruses that cannot cause infection. Some people experience mild immune responses but not the actual flu.',
    source: 'Immunology'
  },
  {
    id: 'false-60',
    text: 'Shaved hair grows back thicker and darker.',
    isTrue: false,
    category: 'Health',
    explanation: 'Shaving doesn\'t change hair texture, color, or growth rate. Blunt ends may feel coarser initially, but it\'s the same hair.',
    source: 'Dermatology'
  },
  {
    id: 'false-61',
    text: 'A dog\'s mouth is cleaner than a human\'s.',
    isTrue: false,
    category: 'Animals',
    explanation: 'Dogs\' mouths contain different bacteria than humans, but not fewer. They lick things that would make humans sick.',
    source: 'Veterinary Science'
  },
  {
    id: 'false-62',
    text: 'You lose most body heat through your head.',
    isTrue: false,
    category: 'Health',
    explanation: 'Heat loss is proportional to the amount of exposed skin. Your head loses about 10% of body heat, not the majority.',
    source: 'Physiology'
  },
  {
    id: 'false-63',
    text: 'Humans evolved from monkeys.',
    isTrue: false,
    category: 'Science',
    explanation: 'Humans and modern primates share a common ancestor from millions of years ago. We didn\'t evolve from today\'s monkeys or apes.',
    source: 'Evolutionary Biology'
  },
  {
    id: 'false-64',
    text: 'Mount Everest is the tallest mountain from base to peak.',
    isTrue: false,
    category: 'Geography',
    explanation: 'Mauna Kea in Hawaii is taller when measured from its base on the ocean floor. Everest has the highest elevation above sea level.',
    source: 'Geography'
  },
  {
    id: 'false-65',
    text: 'Fortune cookies come from China.',
    isTrue: false,
    category: 'Food',
    explanation: 'Fortune cookies were invented in California in the early 1900s and are virtually unknown in China.',
    source: 'Culinary History'
  },
  {
    id: 'false-66',
    text: 'You can\'t fold a piece of paper more than 7 times.',
    isTrue: false,
    category: 'Science',
    explanation: 'With a large enough piece of paper, you can fold it more than 7 times. The record is 13 folds using a massive sheet.',
    source: 'Mathematics'
  },
  {
    id: 'false-67',
    text: 'Searing meat seals in juices.',
    isTrue: false,
    category: 'Food',
    explanation: 'Searing doesn\'t seal in moisture. It creates flavor through the Maillard reaction, but meat loses moisture regardless of searing.',
    source: 'Food Science'
  },
  {
    id: 'false-68',
    text: 'Coca-Cola was originally green.',
    isTrue: false,
    category: 'History',
    explanation: 'Coca-Cola has always been brown, colored by caramel. This persistent myth has no basis in fact.',
    source: 'Corporate History'
  },
  {
    id: 'false-69',
    text: 'Lemmings commit mass suicide by jumping off cliffs.',
    isTrue: false,
    category: 'Animals',
    explanation: 'This myth was fabricated by a 1958 Disney documentary where filmmakers actually pushed lemmings off a cliff for dramatic effect.',
    source: 'Wildlife Biology'
  },
  {
    id: 'false-70',
    text: 'You need to drink milk for strong bones.',
    isTrue: false,
    category: 'Health',
    explanation: 'While milk contains calcium, many studies show no reduction in fracture risk from high dairy consumption. Other foods provide calcium too.',
    source: 'Nutrition Science'
  },
  {
    id: 'false-71',
    text: 'Eating at night makes you gain more weight.',
    isTrue: false,
    category: 'Health',
    explanation: 'Total caloric intake matters, not timing. Weight gain depends on eating more calories than you burn, regardless of when you eat.',
    source: 'Nutrition Science'
  },
  {
    id: 'false-72',
    text: 'Toilets flush in opposite directions in different hemispheres.',
    isTrue: false,
    category: 'Science',
    explanation: 'The Coriolis effect is too weak to affect toilets or sinks. Flush direction depends on basin design and water flow, not hemisphere.',
    source: 'Physics'
  },
  {
    id: 'false-73',
    text: 'Vaccines cause autism.',
    isTrue: false,
    category: 'Health',
    explanation: 'This claim has been thoroughly debunked by extensive research. The original study was fraudulent and has been retracted.',
    source: 'Medical Research'
  },
  {
    id: 'false-74',
    text: 'The tongue has different taste zones for different flavors.',
    isTrue: false,
    category: 'Science',
    explanation: 'The tongue map is a myth. All taste buds can detect all basic tastes (sweet, salty, sour, bitter, umami) across the entire tongue.',
    source: 'Sensory Science'
  },
  {
    id: 'false-75',
    text: 'George Washington had wooden teeth.',
    isTrue: false,
    category: 'History',
    explanation: 'Washington\'s dentures were made from ivory, gold, lead, and human and animal teeth, but never wood.',
    source: 'Historical Records'
  }
];

// Combine all facts
export const ALL_STATIC_FACTS: StaticFact[] = [...TRUE_FACTS, ...FALSE_FACTS];

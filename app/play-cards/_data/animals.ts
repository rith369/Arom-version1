// Guess the animal (Rith, 17 Oct 2026): one person sees an animal and acts
// it out, makes its sound or gives clues; everyone else guesses. A friendly
// total at the end, no winners. Several animals are from Cambodia.

export type Animal = { id: string; emoji: string; en: string; km: string };

const animal = (id: string, emoji: string, en: string, km: string): Animal => ({ id, emoji, en, km });

export const ANIMALS: Animal[] = [
  animal("elephant", "🐘", "Elephant", "ដំរី"),
  animal("buffalo", "🐃", "Water buffalo", "ក្របី"),
  animal("monkey", "🐒", "Monkey", "ស្វា"),
  animal("chicken", "🐔", "Chicken", "មាន់"),
  animal("duck", "🦆", "Duck", "ទា"),
  animal("cat", "🐈", "Cat", "ឆ្មា"),
  animal("dog", "🐕", "Dog", "ឆ្កែ"),
  animal("pig", "🐖", "Pig", "ជ្រូក"),
  animal("cow", "🐄", "Cow", "គោ"),
  animal("horse", "🐎", "Horse", "សេះ"),
  animal("snake", "🐍", "Snake", "ពស់"),
  animal("frog", "🐸", "Frog", "កង្កែប"),
  animal("crocodile", "🐊", "Crocodile", "ក្រពើ"),
  animal("fish", "🐟", "Fish", "ត្រី"),
  animal("crab", "🦀", "Crab", "ក្តាម"),
  animal("shrimp", "🦐", "Shrimp", "បង្គា"),
  animal("tiger", "🐅", "Tiger", "ខ្លា"),
  animal("bear", "🐻", "Bear", "ខ្លាឃ្មុំ"),
  animal("rabbit", "🐇", "Rabbit", "ទន្សាយ"),
  animal("mouse", "🐁", "Mouse", "កណ្តុរ"),
  animal("owl", "🦉", "Owl", "មៀម"),
  animal("peacock", "🦚", "Peacock", "ក្ងោក"),
  animal("parrot", "🦜", "Parrot", "សេក"),
  animal("turtle", "🐢", "Turtle", "អណ្តើក"),
  animal("snail", "🐌", "Snail", "ខ្យង"),
  animal("butterfly", "🦋", "Butterfly", "មេអំបៅ"),
  animal("bee", "🐝", "Bee", "ឃ្មុំ"),
  animal("mosquito", "🦟", "Mosquito", "មូស"),
  animal("ant", "🐜", "Ant", "ស្រមោច"),
  animal("gecko", "🦎", "Gecko", "តុកកែ"),
  animal("dolphin", "🐬", "Mekong dolphin", "ផ្សោត"),
  animal("penguin", "🐧", "Penguin", "ភេនឃ្វីន"),
  animal("kangaroo", "🦘", "Kangaroo", "កង់ហ្គូរូ"),
  animal("giraffe", "🦒", "Giraffe", "សត្វហ្សីរ៉ាហ្វ"),
  animal("lion", "🦁", "Lion", "តោ"),
  animal("panda", "🐼", "Panda", "ខ្លាឃ្មុំផេនដា"),
  animal("bat", "🦇", "Bat", "ប្រចៀវ"),
  animal("goat", "🐐", "Goat", "ពពែ"),
  animal("squirrel", "🐿️", "Squirrel", "កំប្រុក"),
  animal("whale", "🐋", "Whale", "ត្រីបាឡែន"),
];

export const TURN_SECONDS = [45, 60, 90] as const;
export type TurnSeconds = (typeof TURN_SECONDS)[number];

// How many times the phone goes around the table.
export const ROUNDS_AROUND = [1, 2, 3] as const;
export type RoundsAround = (typeof ROUNDS_AROUND)[number];

/** A shuffled stack of animals. Call in an event handler. */
export function shuffledAnimals(): Animal[] {
  const copy = [...ANIMALS];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

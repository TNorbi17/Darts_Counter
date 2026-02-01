export type CheckoutMode = 'DOUBLE' | 'STRAIGHT';

export interface Player {
  id: number;
  name: string;
  currentScore: number;
  history: number[]; // Az aktuális leg dobásai
  matchHistory: number[]; // A teljes meccs dobásai (statisztikához)
  sets: number;
  legs: number;
  stats: {
    lastLegAvg: number;
    matchAvg: number;
    highestScore: number;
  };
}

export interface GameSettings {
  gameType: number; 
  targetSets: number;
  targetLegs: number;
  checkoutMode: CheckoutMode; // Új mező a kiszálló típusának
}
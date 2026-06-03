import type { Outcome, Rated } from './types';

// Glicko-2 rating system (Glickman 2013). One "match" = one rated solve, where
// the puzzle is the opponent. We update both the player and the puzzle.

const SCALE = 173.7178; // Glicko-2 scale factor
const CENTER = 1500; // Glicko scale center for the transform
const TAU = 0.5; // system volatility constraint
const EPSILON = 1e-6;

export const DEFAULT_RATING = 1200;
export const DEFAULT_RD = 350;
export const DEFAULT_SIGMA = 0.06;

export function newRated(rating = DEFAULT_RATING): Rated {
  return { rating, rd: DEFAULT_RD, sigma: DEFAULT_SIGMA };
}

function g(phi: number): number {
  return 1 / Math.sqrt(1 + (3 * phi * phi) / (Math.PI * Math.PI));
}

function expectedScore(mu: number, muOpp: number, phiOpp: number): number {
  return 1 / (1 + Math.exp(-g(phiOpp) * (mu - muOpp)));
}

/**
 * Compute the updated Glicko-2 rating for `player` after a single result
 * against `opponent`. `score` is 1 for a win, 0 for a loss.
 */
export function updateGlicko(player: Rated, opponent: Rated, score: Outcome): Rated {
  // Step 2: convert to Glicko-2 scale.
  const mu = (player.rating - CENTER) / SCALE;
  const phi = player.rd / SCALE;
  const sigma = player.sigma;
  const muOpp = (opponent.rating - CENTER) / SCALE;
  const phiOpp = opponent.rd / SCALE;

  // Step 3: variance.
  const gOpp = g(phiOpp);
  const e = expectedScore(mu, muOpp, phiOpp);
  const v = 1 / (gOpp * gOpp * e * (1 - e));

  // Step 4: improvement delta.
  const delta = v * gOpp * (score - e);

  // Step 5: new volatility via Illinois (regula falsi) iteration.
  const a = Math.log(sigma * sigma);
  const f = (x: number): number => {
    const ex = Math.exp(x);
    const num = ex * (delta * delta - phi * phi - v - ex);
    const den = 2 * (phi * phi + v + ex) * (phi * phi + v + ex);
    return num / den - (x - a) / (TAU * TAU);
  };

  let A = a;
  let B: number;
  if (delta * delta > phi * phi + v) {
    B = Math.log(delta * delta - phi * phi - v);
  } else {
    let k = 1;
    while (f(a - k * TAU) < 0) k++;
    B = a - k * TAU;
  }

  let fA = f(A);
  let fB = f(B);
  while (Math.abs(B - A) > EPSILON) {
    const C = A + ((A - B) * fA) / (fB - fA);
    const fC = f(C);
    if (fC * fB <= 0) {
      A = B;
      fA = fB;
    } else {
      fA = fA / 2;
    }
    B = C;
    fB = fC;
  }
  const newSigma = Math.exp(A / 2);

  // Step 6: pre-rating-period RD.
  const phiStar = Math.sqrt(phi * phi + newSigma * newSigma);

  // Step 7: new RD and rating on the Glicko-2 scale.
  const newPhi = 1 / Math.sqrt(1 / (phiStar * phiStar) + 1 / v);
  const newMu = mu + newPhi * newPhi * gOpp * (score - e);

  // Step 8: convert back.
  return {
    rating: Math.round(newMu * SCALE + CENTER),
    rd: Math.round(newPhi * SCALE),
    sigma: newSigma,
  };
}

/** Convenience: a win/loss boolean to the Glicko outcome value. */
export function outcomeOf(won: boolean): Outcome {
  return won ? 1.0 : 0.0;
}

import { gfMultiply } from './galois.js';

export const mixColumns = state => {
  const out = [[], [], [], []];
  for (let c = 0; c < 4; c++) {
    const [a0, a1, a2, a3] = [state[0][c], state[1][c], state[2][c], state[3][c]];
    out[0][c] = (gfMultiply(a0, 2) ^ gfMultiply(a1, 3) ^ a2 ^ a3) & 255;
    out[1][c] = (a0 ^ gfMultiply(a1, 2) ^ gfMultiply(a2, 3) ^ a3) & 255;
    out[2][c] = (a0 ^ a1 ^ gfMultiply(a2, 2) ^ gfMultiply(a3, 3)) & 255;
    out[3][c] = (gfMultiply(a0, 3) ^ a1 ^ a2 ^ gfMultiply(a3, 2)) & 255;
  }
  return out;
};

export const invMixColumns = state => {
  const out = [[], [], [], []];
  for (let c = 0; c < 4; c++) {
    const [a0, a1, a2, a3] = [state[0][c], state[1][c], state[2][c], state[3][c]];
    out[0][c] = (gfMultiply(a0, 14) ^ gfMultiply(a1, 11) ^ gfMultiply(a2, 13) ^ gfMultiply(a3, 9)) & 255;
    out[1][c] = (gfMultiply(a0, 9) ^ gfMultiply(a1, 14) ^ gfMultiply(a2, 11) ^ gfMultiply(a3, 13)) & 255;
    out[2][c] = (gfMultiply(a0, 13) ^ gfMultiply(a1, 9) ^ gfMultiply(a2, 14) ^ gfMultiply(a3, 11)) & 255;
    out[3][c] = (gfMultiply(a0, 11) ^ gfMultiply(a1, 13) ^ gfMultiply(a2, 9) ^ gfMultiply(a3, 14)) & 255;
  }
  return out;
};
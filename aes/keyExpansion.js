import { SBOX, RCON, NK, NR } from './constants.js';
import { bytesToState, xorByte } from './utils.js';

function rotWord(w) {
  return [w[1], w[2], w[3], w[0]];
}

function subWord(w) {
  return w.map(b => SBOX[b]);
}

function wordToState(word) {
  return [
    [word[0], word[0], word[0], word[0]],
    [word[1], word[1], word[1], word[1]],
    [word[2], word[2], word[2], word[2]],
    [word[3], word[3], word[3], word[3]]
  ];
}

export function keyExpansion(keyBytes) {
  const w = [];
  const steps = [];

  for (let i = 0; i < NK; i++) w[i] = keyBytes.slice(4 * i, 4 * i + 4);

  for (let i = NK; i < 4 * (NR + 1); i++) {
    let temp = w[i - 1].slice();
    if (i % NK === 0) {
      temp = subWord(rotWord(temp));
      temp[0] ^= (RCON[i / NK] >>> 24) & 0xff;
    }
    w[i] = w[i - NK].map((v, j) => xorByte(v, temp[j]));
    steps.push({
      round: `W${i}`,
      operation: 'KeyExpansion',
      state: wordToState(w[i])
    });
  }

  const roundKeys = [];
  for (let r = 0; r <= NR; r++) {
    roundKeys.push([].concat(...w.slice(r * 4, r * 4 + 4)));
  }

  return { words: w, roundKeys, steps };
}

export { rotWord, subWord };
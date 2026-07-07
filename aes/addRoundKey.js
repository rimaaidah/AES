export const addRoundKey = (state, roundKeyBytes) => {
  const out = [[], [], [], []];
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      out[r][c] = (state[r][c] ^ roundKeyBytes[r + 4 * c]) & 255;
    }
  }
  return out;
};
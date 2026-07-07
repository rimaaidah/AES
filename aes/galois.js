export const xtime = a => (((a << 1) ^ ((a & 0x80) ? 0x1b : 0)) & 0xff);

export const gfMultiply = (a, b) => {
  let p = 0;
  for (let i = 0; i < 8; i++) {
    if (b & 1) p ^= a;
    const hi = a & 0x80;
    a = (a << 1) & 0xff;
    if (hi) a ^= 0x1b;
    b >>= 1;
  }
  return p & 0xff;
};

export const mixSingleColumn = col => {
  const [a0, a1, a2, a3] = col;
  return [
    gfMultiply(a0, 2) ^ gfMultiply(a1, 3) ^ a2 ^ a3,
    a0 ^ gfMultiply(a1, 2) ^ gfMultiply(a2, 3) ^ a3,
    a0 ^ a1 ^ gfMultiply(a2, 2) ^ gfMultiply(a3, 3),
    gfMultiply(a0, 3) ^ a1 ^ a2 ^ gfMultiply(a3, 2)
  ].map(v => v & 0xff);
};
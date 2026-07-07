export const hexToBytes = hex => Array.from(hex.match(/.{1,2}/g) || [], b => parseInt(b, 16));
export const hexToBytesStrict = hex => {
  if (!/^[0-9a-fA-F]+$/.test(hex) || hex.length % 2) throw new Error('Hex tidak valid');
  return hexToBytes(hex);
};
export const bytesToHex = bytes => bytes.map(b => b.toString(16).padStart(2, '0')).join('');
export const cloneState = state => state.map(r => [...r]);
export const xorByte = (a, b) => (a ^ b) & 0xff;
export const bytesToState = bytes => {
  if (bytes.length !== 16) throw new Error('Block harus 16 byte');
  const s = [[], [], [], []];
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) s[r][c] = bytes[r + 4 * c] & 0xff;
  return s;
};
export const stateToBytes = state => {
  const out = [];
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) out.push(state[r][c] & 0xff);
  return out;
};
export const stateToHex = state => bytesToHex(stateToBytes(state));
export const isHex = s => /^[0-9a-fA-F]*$/.test(s);
export const textToBytes16 = text => {
  const enc = new TextEncoder().encode(text);
  const b = Array.from(enc);
  if (b.length > 16) throw new Error('Plaintext teks maksimal 16 byte');
  while (b.length < 16) b.push(0);
  return b.slice(0, 16);
};
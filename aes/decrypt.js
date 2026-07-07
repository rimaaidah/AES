import { bytesToState, cloneState, stateToHex } from './utils.js';
import { invSubBytes } from './subBytes.js';
import { invShiftRows } from './shiftRows.js';
import { invMixColumns } from './mixColumns.js';
import { addRoundKey } from './addRoundKey.js';

export function decrypt(cipherBytes, ks) {
  const steps = [];
  let state = bytesToState(cipherBytes);
  steps.push({ round: 'Cipher', operation: 'State Awal', state: cloneState(state) });

  state = addRoundKey(state, ks.roundKeys[10]);
  steps.push({ round: 10, operation: 'AddRoundKey RK10', state: cloneState(state) });

  for (let round = 9; round >= 1; round--) {
    state = invShiftRows(state);
    steps.push({ round, operation: 'InvShiftRows', state: cloneState(state) });

    state = invSubBytes(state);
    steps.push({ round, operation: 'InvSubBytes', state: cloneState(state) });

    state = addRoundKey(state, ks.roundKeys[round]);
    steps.push({ round, operation: 'AddRoundKey', state: cloneState(state) });

    state = invMixColumns(state);
    steps.push({ round, operation: 'InvMixColumns', state: cloneState(state) });
  }

  state = invShiftRows(state);
  steps.push({ round: 0, operation: 'InvShiftRows', state: cloneState(state) });

  state = invSubBytes(state);
  steps.push({ round: 0, operation: 'InvSubBytes', state: cloneState(state) });

  state = addRoundKey(state, ks.roundKeys[0]);
  steps.push({ round: 0, operation: 'AddRoundKey RK0', state: cloneState(state) });

  return { plaintext: stateToHex(state), steps, state };
}
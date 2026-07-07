import { bytesToState, cloneState, stateToHex } from './utils.js';
import { subBytes } from './subBytes.js';
import { shiftRows } from './shiftRows.js';
import { mixColumns } from './mixColumns.js';
import { addRoundKey } from './addRoundKey.js';

export function encrypt(plainBytes, ks) {
  const steps = [];
  let state = bytesToState(plainBytes);
  steps.push({ round: 'Initial', operation: 'State Awal', state: cloneState(state) });

  state = addRoundKey(state, ks.roundKeys[0]);
  steps.push({ round: 0, operation: 'AddRoundKey RK0', state: cloneState(state) });

  for (let round = 1; round <= 9; round++) {
    state = subBytes(state);
    steps.push({ round, operation: 'SubBytes', state: cloneState(state) });

    state = shiftRows(state);
    steps.push({ round, operation: 'ShiftRows', state: cloneState(state) });

    state = mixColumns(state);
    steps.push({ round, operation: 'MixColumns', state: cloneState(state) });

    state = addRoundKey(state, ks.roundKeys[round]);
    steps.push({ round, operation: 'AddRoundKey', state: cloneState(state) });
  }

  state = subBytes(state);
  steps.push({ round: 10, operation: 'SubBytes', state: cloneState(state) });

  state = shiftRows(state);
  steps.push({ round: 10, operation: 'ShiftRows', state: cloneState(state) });

  state = addRoundKey(state, ks.roundKeys[10]);
  steps.push({ round: 10, operation: 'AddRoundKey RK10', state: cloneState(state) });

  return { ciphertext: stateToHex(state), steps, state };
}
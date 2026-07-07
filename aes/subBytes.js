import { SBOX, INV_SBOX } from './constants.js';

export const subBytes = state => state.map(row => row.map(v => SBOX[v]));
export const invSubBytes = state => state.map(row => row.map(v => INV_SBOX[v]));
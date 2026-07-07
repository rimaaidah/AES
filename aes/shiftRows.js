export const shiftRows = s => s.map((row, r) => row.slice(r).concat(row.slice(0, r)));
export const invShiftRows = s => s.map((row, r) => row.slice(4 - r).concat(row.slice(0, 4 - r)));
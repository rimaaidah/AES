import { keyExpansion } from './aes/keyExpansion.js';
import { encrypt } from './aes/encrypt.js';
import { decrypt } from './aes/decrypt.js';
import { bytesToHex, hexToBytesStrict, textToBytes16, isHex } from './aes/utils.js';

const el = id => document.getElementById(id);
const state = { detail:true, result:'' };

const elements = {
  themeToggle: el('themeToggle'),
  detailsToggle: el('detailsToggle'),
  modeSelect: el('modeSelect'),
  operationSelect: el('operationSelect'),
  plaintextInput: el('plaintextInput'),
  keyInput: el('keyInput'),
  encryptBtn: el('encryptBtn'),
  decryptBtn: el('decryptBtn'),
  resetBtn: el('resetBtn'),
  copyBtn: el('copyBtn'),
  cipherOutput: el('cipherOutput'),
  plainOutput: el('plainOutput'),
  errorMessage: el('errorMessage'),
  statusPill: el('statusPill'),
  statusText: el('statusText'),
  modeText: el('modeText'),
  detailText: el('detailText'),
  loadingSpinner: el('loadingSpinner'),
  toast: el('toast'),
  keyExpansionAccordion: el('keyExpansionAccordion'),
  processAccordion: el('processAccordion')
};

const showToast = msg => {
  elements.toast.textContent = msg;
  elements.toast.classList.remove('hidden');
  setTimeout(() => elements.toast.classList.add('hidden'), 1800);
};

const setLoading = on => elements.loadingSpinner.classList.toggle('hidden', !on);
const setStatus = msg => {
  elements.statusPill.textContent = msg;
  elements.statusText.textContent = msg;
};

const ripple = e => {
  const b = e.currentTarget;
  const s = document.createElement('span');
  const d = Math.max(b.clientWidth, b.clientHeight);
  s.className = 'ripple';
  s.style.width = s.style.height = `${d}px`;
  s.style.left = `${e.clientX - b.getBoundingClientRect().left - d / 2}px`;
  s.style.top = `${e.clientY - b.getBoundingClientRect().top - d / 2}px`;
  b.appendChild(s);
  setTimeout(() => s.remove(), 600);
};

[elements.encryptBtn, elements.decryptBtn, elements.resetBtn, elements.copyBtn, elements.themeToggle, elements.detailsToggle].forEach(b => b.addEventListener('click', ripple));

function validate() {
  const key = elements.keyInput.value.trim();
  const mode = elements.modeSelect.value;
  const op = elements.operationSelect.value;
  const input = elements.plaintextInput.value.trim();

  if (!isHex(key) || key.length !== 32) return ['Error: AES Key harus 32 karakter hex.', null, null, null];

  if (op === 'encrypt') {
    if (mode === 'text') {
      if (input.length > 16) return ['Error: Plaintext teks maksimal 16 karakter.', null, null, null];
      return [null, textToBytes16(input), hexToBytesStrict(key), mode];
    }
    if (!isHex(input) || input.length !== 32) return ['Error: Plaintext hex harus 32 karakter hex.', null, null, null];
    return [null, hexToBytesStrict(input), hexToBytesStrict(key), mode];
  }

  if (!isHex(input) || input.length !== 32) return ['Error: Ciphertext untuk dekripsi harus 32 karakter hex.', null, null, null];
  return [null, hexToBytesStrict(input), hexToBytesStrict(key), mode];
}

function matrixHTML(matrix) {
  return `<table class="matrix">${matrix.map(r => `<tr>${r.map(v => `<td>${v.toString(16).padStart(2, '0').toUpperCase()}</td>`).join('')}</tr>`).join('')}</table>`;
}

function rkToMatrix(rk) {
  return [
    [rk[0], rk[4], rk[8], rk[12]],
    [rk[1], rk[5], rk[9], rk[13]],
    [rk[2], rk[6], rk[10], rk[14]],
    [rk[3], rk[7], rk[11], rk[15]]
  ];
}

function sectionHTML(title, cls, content) {
  return `<div class="acc-item open"><div class="acc-head ${cls}"><strong>${title}</strong><span>collapse</span></div><div class="acc-body"><div class="acc-content">${content}</div></div></div>`;
}

function renderAccordion(container, sections) {
  container.innerHTML = sections.map(s => sectionHTML(s.title, s.cls, s.content)).join('');
  container.querySelectorAll('.acc-head').forEach(head => head.addEventListener('click', () => head.parentElement.classList.toggle('open')));
}

function stepBlock(step, idx) {
  return `<div style="margin-bottom:14px"><div class="card-title"><h4>${idx + 1}. ${step.operation}</h4><span>Round ${step.round}</span></div>${matrixHTML(step.state)}</div>`;
}

function renderSteps(steps) {
  return steps.map((s, i) => stepBlock(s, i)).join('');
}

function makeKeySections(roundKeys) {
  return roundKeys.map((rk, i) => ({
    title: `RK${i}`,
    cls: 'op-keyexp',
    content: matrixHTML(rkToMatrix(rk))
  }));
}

function makeProcessSections(steps) {
  const groups = [];
  const map = new Map();

  steps.forEach(s => {
    const key = `${s.round}__${s.operation}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(s);
  });

  for (const [k, v] of map.entries()) {
    groups.push({
      title: k.replace('__', ' - '),
      cls: k.includes('SubBytes') ? 'op-subbytes'
        : k.includes('ShiftRows') ? 'op-shiftrows'
        : k.includes('MixColumns') ? 'op-mixcolumns'
        : k.includes('AddRoundKey') ? 'op-addrk'
        : 'op-initial',
      content: renderSteps(v)
    });
  }

  return groups;
}

function run() {
  const [err, bytes, key] = validate();
  elements.errorMessage.textContent = err || '';

  if (err) {
    setStatus('Error');
    showToast(err);
    return;
  }

  setLoading(true);
  try {
    elements.modeText.textContent = elements.operationSelect.value === 'encrypt' ? 'Encrypt' : 'Decrypt';
    const ks = keyExpansion(key);
    renderAccordion(elements.keyExpansionAccordion, makeKeySections(ks.roundKeys));

    let result, steps;
    if (elements.operationSelect.value === 'encrypt') {
      ({ ciphertext: result, steps } = encrypt(bytes, ks));
      elements.cipherOutput.textContent = result;
      elements.plainOutput.textContent = bytesToHex(bytes);
    } else {
      ({ plaintext: result, steps } = decrypt(bytes, ks));
      elements.plainOutput.textContent = result;
      elements.cipherOutput.textContent = bytesToHex(bytes);
    }

    state.result = result;
    renderAccordion(elements.processAccordion, makeProcessSections(steps));
    setStatus('Sukses');
    showToast('Proses AES selesai');
  } catch (e) {
    elements.errorMessage.textContent = e.message;
    setStatus('Error');
    showToast(e.message);
  } finally {
    setLoading(false);
  }
}

function reset() {
  elements.plaintextInput.value = '';
  elements.keyInput.value = '';
  elements.cipherOutput.textContent = '';
  elements.plainOutput.textContent = '';
  elements.errorMessage.textContent = '';
  elements.keyExpansionAccordion.innerHTML = '';
  elements.processAccordion.innerHTML = '';
  setStatus('Menunggu input');
  state.result = '';
}

function toggleTheme() {
  const html = document.documentElement;
  const dark = html.getAttribute('data-theme') !== 'light';
  html.setAttribute('data-theme', dark ? 'light' : 'dark');
  elements.themeToggle.textContent = dark ? 'Dark Mode' : 'Light Mode';
}

function toggleDetail() {
  state.detail = !state.detail;
  elements.detailText.textContent = state.detail ? 'Aktif' : 'Nonaktif';
  elements.detailsToggle.textContent = state.detail ? 'Hide Detail' : 'Show Detail';
}

elements.encryptBtn.addEventListener('click', () => { elements.operationSelect.value = 'encrypt'; run(); });
elements.decryptBtn.addEventListener('click', () => { elements.operationSelect.value = 'decrypt'; run(); });
elements.resetBtn.addEventListener('click', reset);
elements.copyBtn.addEventListener('click', async () => {
  if (!state.result) return showToast('Belum ada hasil');
  await navigator.clipboard.writeText(state.result);
  showToast('Hasil disalin');
});
elements.themeToggle.addEventListener('click', toggleTheme);
elements.detailsToggle.addEventListener('click', toggleDetail);
elements.modeSelect.addEventListener('change', () => elements.operationSelect.value = 'encrypt');

elements.modeSelect.value = 'hex';
elements.operationSelect.value = 'encrypt';
elements.plaintextInput.value = '00112233445566778899aabbccddeeff';
elements.keyInput.value = '000102030405060708090a0b0c0d0e0f';
setStatus('Siap');

const CNPJ_BASE_LENGTH = 12;
const CNPJ_LENGTH = 14;
const FIRST_DIGIT_WEIGHTS = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] as const;
const SECOND_DIGIT_WEIGHTS = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] as const;

export function normalizeCnpj(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, CNPJ_LENGTH);
}

export function formatCnpj(value: string): string {
  const raw = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const base = raw.slice(0, CNPJ_BASE_LENGTH);

  const digits = raw.slice(CNPJ_BASE_LENGTH).replace(/\D/g, '').slice(0, 2);
  const complete = `${base}${digits}`;

  let formatted = complete.slice(0, 2);
  if (complete.length > 2) formatted += `.${complete.slice(2, 5)}`;
  if (complete.length > 5) formatted += `.${complete.slice(5, 8)}`;
  if (complete.length > 8) formatted += `/${complete.slice(8, 12)}`;
  if (complete.length > 12) formatted += `-${complete.slice(12, 14)}`;
  return formatted;
}

function cnpjCharacterValue(character: string): number {

  return character.charCodeAt(0) - 48;
}

function calculateCheckDigit(value: string, weights: readonly number[]): number {
  const sum = [...value].reduce(
    (total, character, index) => total + cnpjCharacterValue(character) * weights[index],
    0,
  );
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

export function isValidCnpj(value: string): boolean {
  const cnpj = normalizeCnpj(value);
  if (!/^[A-Z0-9]{12}\d{2}$/.test(cnpj)) return false;
  if (/^(.)\1{13}$/.test(cnpj)) return false;

  const base = cnpj.slice(0, CNPJ_BASE_LENGTH);
  const firstDigit = calculateCheckDigit(base, FIRST_DIGIT_WEIGHTS);
  const secondDigit = calculateCheckDigit(`${base}${firstDigit}`, SECOND_DIGIT_WEIGHTS);
  return cnpj.endsWith(`${firstDigit}${secondDigit}`);
}

export function getCnpjValidationMessage(value: string): string | undefined {
  const normalized = normalizeCnpj(value);
  if (normalized.length === 0) return undefined;
  if (normalized.length < CNPJ_LENGTH) return 'Informe os 14 caracteres do CNPJ.';
  if (!isValidCnpj(normalized)) return 'CNPJ inválido. Confira os dígitos verificadores.';
  return undefined;
}

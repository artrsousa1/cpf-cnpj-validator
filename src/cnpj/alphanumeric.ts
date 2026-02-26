import { ALPHABET, CNPJ_LENGTH } from '../constants.js';

/**
 * Converte uma letra em seu valor numérico conforme tabela da Receita Federal (A=17 até Z=42).
 *
 * Usado no cálculo dos dígitos verificadores do CNPJ alfanumérico.
 *
 * @param letter - Uma letra maiúscula (A–Z)
 * @returns Valor numérico de 17 (A) a 42 (Z), ou 0 se inválido
 *
 * @example
 * convertLetterToNumber('A')  // 17
 * convertLetterToNumber('Z')  // 42
 */
export function convertLetterToNumber(letter: string): number {
  return letter.charCodeAt(0) - 48;
}

/**
 * Converte um CNPJ alfanumérico em array de números para cálculo dos dígitos verificadores.
 *
 * Letras A–Z são mapeadas para 17–42 conforme tabela da Receita Federal;
 * dígitos 0–9 permanecem como números.
 *
 * @param value - CNPJ alfanumérico (ex.: "AB123CDE000142")
 * @returns Array de números onde letras foram convertidas (17–42) e dígitos mantidos
 *
 * @example
 * convertCnpjToNumbers("AB12")  // [17, 18, 1, 2]
 */
export function convertCnpjToNumbers(value: string): number[] {
  return Array.from(value).map((char) =>
    isNaN(Number(char)) ? convertLetterToNumber(char) : Number(char)
  );
}

/**
 * Remove formatação (. / -) de um CNPJ alfanumérico.
 */
function stripFormatting(value: string): string {
  return value.replace(/[.\/\-]/g, '');
}

/**
 * Gera a base alfanumérica do CNPJ (12 caracteres aleatórios: dígitos 0–9 ou letras A–Z).
 *
 * Cada posição tem 50% de chance de ser dígito e 50% de ser letra.
 *
 * @returns Array com 12 caracteres (números ou letras) que será usada para calcular os dígitos verificadores
 */
export function generateBaseAlphanumeric(): (number | string)[] {
  const base: (number | string)[] = [];
  for (let i = 0; i < 12; i++) {
    if (Math.random() < 0.5) {
      base.push(Math.floor(Math.random() * 10));
    } else {
      base.push(ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length)));
    }
  }
  return base;
}

/**
 * Calcula um dígito verificador para a base usando pesos 2–9 (da direita para esquerda).
 *
 * Algoritmo mod 11 conforme especificação do CNPJ alfanumérico da Receita Federal.
 *
 * @param digits - Array com a base (12 caracteres numéricos ou letras convertidas)
 * @returns Dígito verificador (0–9)
 */
function calculateCheckDigit(digits: (number | string)[]): number {
  let sum = 0;
  let weight = 2;

  for (let i = digits.length - 1; i >= 0; i--) {
    const digit = digits[i];
    const numericValue =
      typeof digit === 'string' ? convertLetterToNumber(digit) : digit;
    sum += numericValue * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }

  const rest = sum % 11;
  return rest < 2 ? 0 : 11 - rest;
}

/**
 * Calcula os dois dígitos verificadores do CNPJ alfanumérico.
 *
 * O primeiro dígito é calculado sobre a base de 12 caracteres; o segundo,
 * sobre a base mais o primeiro dígito.
 *
 * @param baseCNPJ - Array com os 12 caracteres da base (números ou letras)
 * @returns Tupla [primeiro_dígito, segundo_dígito]
 */
export function calculateCheckDigits(
  baseCNPJ: (number | string)[]
): [number, number] {
  const firstDigit = calculateCheckDigit(baseCNPJ);
  const secondDigit = calculateCheckDigit([...baseCNPJ, firstDigit]);
  return [firstDigit, secondDigit];
}

/**
 * Gera um CNPJ alfanumérico válido (14 caracteres, sem formatação).
 *
 * A base (12 caracteres) combina letras A–Z e dígitos 0–9 aleatoriamente.
 * Os dois últimos caracteres são os dígitos verificadores calculados pelo algoritmo mod 11.
 *
 * @returns String com 14 caracteres (letras e números), sem formatação
 *
 * @example
 * generateAlphanumeric()  // ex: "AB123CDE000142"
 */
export function generateAlphanumeric(): string {
  const base = generateBaseAlphanumeric();
  const [d1, d2] = calculateCheckDigits(base);
  const chars = base.map((c) => String(c));
  return [...chars, String(d1), String(d2)].join('');
}

/**
 * Valida um CNPJ alfanumérico verificando se os dígitos verificadores estão corretos.
 *
 * Remove formatação (. / -) antes de validar. O valor deve ter exatamente 14 caracteres
 * (letras e dígitos) e os dois últimos devem corresponder ao cálculo mod 11 da base.
 *
 * @param value - CNPJ alfanumérico com ou sem formatação (ex.: "AB.123.CDE/0001-42")
 * @returns `true` se o CNPJ alfanumérico for válido
 */
export function validateAlphanumeric(value: string): boolean {
  const raw = stripFormatting(value);
  if (raw.length !== CNPJ_LENGTH) return false;

  const base = raw.slice(0, 12);
  const digits = convertCnpjToNumbers(base);
  const [dv1, dv2] = calculateCheckDigits(digits);
  const originalDv = parseInt(raw.slice(-2), 10);
  const calculatedDv = dv1 * 10 + dv2;
  return originalDv === calculatedDv;
}

/**
 * Formata CNPJ alfanumérico no padrão oficial: XX.XXX.XXX/XXXX-XX.
 *
 * Remove formatação (. / -) antes de aplicar a máscara.
 * Funciona igual ao CNPJ numérico, mas aceita letras nas posições da base.
 *
 * @param value - CNPJ alfanumérico com ou sem formatação (ex.: "AB123CDE000142")
 * @returns String no formato XX.XXX.XXX/XXXX-XX, ou `null` se não houver 14 caracteres
 *
 * @example
 * formatAlphanumeric('AB123CDE000142')  // "AB.123.CDE/0001-42"
 */
export function formatAlphanumeric(value: string): string | null {
  const raw = stripFormatting(value);
  if (raw.length !== CNPJ_LENGTH) return null;
  return raw.replace(
    /^(.{2})(.{3})(.{3})(.{4})(.{2})$/,
    '$1.$2.$3/$4-$5'
  );
}

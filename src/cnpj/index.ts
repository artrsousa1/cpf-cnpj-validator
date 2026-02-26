import {
  generateAlphanumeric,
  formatAlphanumeric,
  validateAlphanumeric,
} from './alphanumeric.js';

function onlyDigits(str: string): string {
  return String(str).replace(/\D/g, '');
}

function cnpjFirstDigit(digits: number[]): number {
  const weights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const sum = digits.reduce((acc, d, i) => acc + d * weights[i], 0);
  const rest = sum % 11;
  return rest < 2 ? 0 : 11 - rest;
}

function cnpjSecondDigit(digits: number[]): number {
  const weights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const sum = digits.reduce((acc, d, i) => acc + d * weights[i], 0);
  const rest = sum % 11;
  return rest < 2 ? 0 : 11 - rest;
}

/**
 * Verifica se um CNPJ é válido conforme algoritmo oficial da Receita Federal.
 *
 * Suporta CNPJ numérico e alfanumérico. Para numérico: valida os dois dígitos
 * verificadores calculados com pesos mod 11 e rejeita sequências repetidas
 * (11.111.111/1111-11, 00.000.000/0000-00, etc.). Para alfanumérico: usa o
 * algoritmo específico com pesos 2–9. Aceita o valor com ou sem máscara.
 *
 * @param value - CNPJ em qualquer formato (ex.: "11.222.333/0001-81" ou "AB.123.CDE/0001-42")
 * @returns `true` se o CNPJ for válido (numérico ou alfanumérico)
 *
 * @example
 * isValid('11.222.333/0001-81')  // true (numérico)
 * isValid('11222333000181')      // true (numérico)
 * isValid('AB.123.CDE/0001-42')  // true (alfanumérico)
 * isValid('11.111.111/1111-11')  // false (sequência inválida)
 * isValid('12345')               // false (incompleto)
 */
function isValid(value: string): boolean {
  const raw = String(value).replace(/[.\/\-]/g, '');
  if (/[A-Za-z]/.test(raw)) {
    return validateAlphanumeric(value);
  }
  const digits = onlyDigits(value).split('').map(Number);
  if (digits.length !== 14) return false;
  if (new Set(digits).size === 1) return false;
  const base = digits.slice(0, 12);
  const d1 = cnpjFirstDigit(base);
  const d2 = cnpjSecondDigit([...base, d1]);
  return digits[12] === d1 && digits[13] === d2;
}

/** Opções para geração de CNPJ. */
export type CnpjGenerateOptions = {
  /**
   * Tipo de CNPJ a gerar:
   * - `'numeric'` (padrão): apenas dígitos 0–9
   * - `'alphanumeric'`: letras A–Z e dígitos (formato futuro da Receita Federal)
   */
  type?: 'numeric' | 'alphanumeric';
  /** Se `true` (padrão), retorna formatado como 00.000.000/0000-00; se `false`, retorna apenas os 14 caracteres. */
  formatted?: boolean;
};

/**
 * Gera um CNPJ válido aleatoriamente, com dígitos verificadores calculados corretamente.
 *
 * Para `type: 'numeric'`, a base (12 primeiros dígitos) é sorteada; os dois últimos
 * são calculados pelo algoritmo mod 11. Para `type: 'alphanumeric'`, usa letras A–Z
 * e dígitos conforme especificação futura da Receita Federal.
 *
 * @param options - Opções de geração
 * @param options.type - `'numeric'` (padrão) ou `'alphanumeric'`
 * @param options.formatted - Se `true` (padrão), retorna formatado; se `false`, retorna sem formatação
 * @returns CNPJ válido, com ou sem formatação conforme as opções
 *
 * @example
 * generate()                              // ex: "11.222.333/0001-81"
 * generate({ formatted: false })          // ex: "11222333000181"
 * generate({ type: 'alphanumeric' })      // ex: "AB.123.CDE/0001-42"
 * generate({ type: 'alphanumeric', formatted: false })  // ex: "AB123CDE000142"
 */
function generate(options?: CnpjGenerateOptions): string {
  const { type = 'numeric', formatted = true } = options ?? {};
  let raw: string;

  if (type === 'alphanumeric') {
    raw = generateAlphanumeric();
    return formatted ? (formatAlphanumeric(raw) ?? raw) : raw;
  }

  const base = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10));
  const d1 = cnpjFirstDigit(base);
  const d2 = cnpjSecondDigit([...base, d1]);
  raw = [...base, d1, d2].join('');
  return formatted ? (format(raw) ?? raw) : raw;
}

/**
 * Formata o CNPJ no padrão oficial brasileiro: 00.000.000/0000-00.
 *
 * Remove caracteres de formatação (. / -) antes de formatar.
 * Funciona tanto para CNPJ numérico quanto alfanumérico.
 * Se o valor não tiver exatamente 14 caracteres, retorna `null`.
 *
 * @param value - CNPJ com ou sem formatação (pontos, barra, traço são ignorados)
 * @returns String no formato 00.000.000/0000-00, ou `null` se não houver 14 caracteres
 *
 * @example
 * format('11222333000181')  // "11.222.333/0001-81"
 * format('11.222.333/0001-81') // "11.222.333/0001-81"
 * format('AB123CDE000142')  // "AB.123.CDE/0001-42"
 * format('123')             // null
 */
function format(value: string): string | null {
  const digits = onlyDigits(value);
  if (digits.length !== 14) return null;
  return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

/**
 * API para validação, geração e formatação de CNPJ (Cadastro Nacional da Pessoa Jurídica).
 *
 * Suporta CNPJ numérico (padrão atual) e alfanumérico (formato futuro da Receita Federal).
 * Todas as funções aceitam CNPJ com ou sem formatação.
 */
export interface CNPJ {
  /**
   * Verifica se o CNPJ é válido (14 caracteres, dígitos verificadores corretos, não sequência repetida).
   * @param value - CNPJ com ou sem máscara (numérico ou alfanumérico)
   * @returns `true` se válido
   */
  isValid(value: string): boolean;
  /**
   * Gera um CNPJ válido aleatoriamente (numérico ou alfanumérico).
   * @param options - `type` ('numeric' | 'alphanumeric'), `formatted` (default: true)
   * @returns CNPJ válido
   */
  generate(options?: CnpjGenerateOptions): string;
  /**
   * Formata o CNPJ no padrão 00.000.000/0000-00.
   * @param value - CNPJ com ou sem formatação
   * @returns String formatada ou `null` se não houver 14 caracteres
   */
  format(value: string): string | null;
}

export const cnpj: CNPJ = {
  isValid,
  generate,
  format,
};

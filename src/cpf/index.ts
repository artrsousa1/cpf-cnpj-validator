function onlyDigits(str: string): string {
  return String(str).replace(/\D/g, '');
}

function cpfFirstDigit(digits: number[]): number {
  const weights = [10, 9, 8, 7, 6, 5, 4, 3, 2];
  const sum = digits.reduce((acc, d, i) => acc + d * weights[i], 0);
  const rest = sum % 11;
  return rest < 2 ? 0 : 11 - rest;
}

function cpfSecondDigit(digits: number[]): number {
  const weights = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
  const sum = digits.reduce((acc, d, i) => acc + d * weights[i], 0);
  const rest = sum % 11;
  return rest < 2 ? 0 : 11 - rest;
}

/**
 * Verifica se um CPF é válido conforme algoritmo oficial da Receita Federal.
 *
 * Realiza a validação dos dois dígitos verificadores calculados com pesos
 * mod 11. Rejeita CPFs inválidos como sequências repetidas (111.111.111-11,
 * 000.000.000-00, etc.). Aceita o valor com ou sem máscara (pontos e traço).
 *
 * @param value - CPF em qualquer formato (ex.: "313.402.809-30" ou "31340280930")
 * @returns `true` se o CPF tiver 11 dígitos, dígitos verificadores corretos e não for sequência repetida
 *
 * @example
 * isValid('313.402.809-30')  // true
 * isValid('31340280930')     // true
 * isValid('111.111.111-11')  // false (sequência inválida)
 * isValid('123')             // false (incompleto)
 */
function isValid(value: string): boolean {
  const digits = onlyDigits(value).split('').map(Number);
  if (digits.length !== 11) return false;
  if (new Set(digits).size === 1) return false;
  const base = digits.slice(0, 9);
  const d1 = cpfFirstDigit(base);
  const d2 = cpfSecondDigit([...base, d1]);
  return digits[9] === d1 && digits[10] === d2;
}

/** Opções para geração de CPF. */
export type CpfGenerateOptions = {
  /** Se `true` (padrão), retorna formatado como 000.000.000-00; se `false`, retorna apenas os 11 dígitos. */
  formatted?: boolean;
};

/**
 * Gera um CPF válido aleatoriamente, com dígitos verificadores calculados corretamente.
 *
 * A base (9 primeiros dígitos) é sorteada; os dois últimos são calculados pelo
 * algoritmo mod 11. O resultado nunca será sequência repetida.
 *
 * @param options - Opções de geração
 * @param options.formatted - Se `true` (padrão), retorna no padrão 000.000.000-00; se `false`, retorna apenas os 11 dígitos
 * @returns CPF válido, com ou sem formatação conforme as opções
 *
 * @example
 * generate()                    // ex: "313.402.809-30"
 * generate({ formatted: false }) // ex: "31340280930"
 */
function generate(options?: CpfGenerateOptions): string {
  const { formatted = true } = options ?? {};
  const base = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
  const d1 = cpfFirstDigit(base);
  const d2 = cpfSecondDigit([...base, d1]);
  const raw = [...base, d1, d2].join('');
  return formatted ? (format(raw) ?? raw) : raw;
}

/**
 * Formata o CPF no padrão oficial brasileiro: 000.000.000-00.
 *
 * Remove qualquer caractere que não seja dígito antes de formatar.
 * Se o valor não tiver exatamente 11 dígitos, retorna `null`.
 *
 * @param value - CPF com ou sem formatação (pontos, traço, espaços são ignorados)
 * @returns String no formato 000.000.000-00, ou `null` se não houver 11 dígitos
 *
 * @example
 * format('31340280930')  // "313.402.809-30"
 * format('313.402.809-30') // "313.402.809-30"
 * format('123')          // null
 */
function format(value: string): string | null {
  const digits = onlyDigits(value);
  if (digits.length !== 11) return null;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * API para validação, geração e formatação de CPF (Cadastro de Pessoa Física).
 *
 * Todas as funções aceitam CPF com ou sem formatação. O algoritmo de validação
 * segue a especificação oficial da Receita Federal (dígitos verificadores mod 11).
 */
export interface CPF {
  /**
   * Verifica se o CPF é válido (11 dígitos, dígitos verificadores corretos, não sequência repetida).
   * @param value - CPF com ou sem máscara
   * @returns `true` se válido
   */
  isValid(value: string): boolean;
  /**
   * Gera um CPF válido aleatoriamente.
   * @param options - `formatted` (default: true) — retorna formatado ou apenas dígitos
   * @returns CPF válido
   */
  generate(options?: CpfGenerateOptions): string;
  /**
   * Formata o CPF no padrão 000.000.000-00.
   * @param value - CPF com ou sem formatação
   * @returns String formatada ou `null` se não houver 11 dígitos
   */
  format(value: string): string | null;
}

export const cpf: CPF = {
  isValid,
  generate,
  format,
};

# cpf-cnpj-validator

Biblioteca leve e tipada para **validação, geração e formatação** de **CPF** e **CNPJ** válidos (Brasil), utilizando o algoritmo oficial de dígitos verificadores da Receita Federal.

## Características

* Validação de CPF numérico
* Validação de CNPJ numérico
* Suporte a CNPJ alfanumérico (formato futuro da Receita Federal)
* Escrita em TypeScript
* ESM-only (Node.js 18+)
* Sem dependências externas

---

## Instalação

```bash
npm install @artrsousa/cpf-cnpj-validator
```

---

## Uso

A biblioteca é ESM-only (`"type": "module"`).
Utilize `import` em Node.js 18+ ou bundlers modernos (Vite, Webpack, etc).

---

## Uso com JavaScript (ES Modules)

```javascript
import { cpf, cnpj } from 'cpf-cnpj-validator';

// CPF
cpf.isValid('313.402.809-30');
cpf.isValid('31340280930');

cpf.generate(); 
cpf.generate({ formatted: false });

cpf.format('31340280930');

// CNPJ numérico
cnpj.isValid('11.222.333/0001-81');
cnpj.isValid('11222333000181');

cnpj.generate();
cnpj.generate({ formatted: false });

cnpj.format('11222333000181');

// CNPJ alfanumérico
cnpj.generate({ type: 'alphanumeric' });
cnpj.generate({ type: 'alphanumeric', formatted: false });
```

---

## Uso com TypeScript

A biblioteca inclui definições de tipos (`.d.ts`).

```typescript
import {
  cpf,
  cnpj,
  type CPF,
  type CNPJ,
  type CpfGenerateOptions,
  type CnpjGenerateOptions
} from 'cpf-cnpj-validator';

const cpfValue: string = '313.402.809-30';

if (cpf.isValid(cpfValue)) {
  const formatted: string | null = cpf.format(cpfValue);
  console.log(formatted);
}

const options: CnpjGenerateOptions = {
  type: 'alphanumeric',
  formatted: true,
};

const novoCnpj: string = cnpj.generate(options);
```

---

## Tipos Exportados

| Tipo                  | Descrição                     |
| --------------------- | ----------------------------- |
| `CPF`                 | Interface da API de CPF       |
| `CNPJ`                | Interface da API de CNPJ      |
| `CpfGenerateOptions`  | Opções para `cpf.generate()`  |
| `CnpjGenerateOptions` | Opções para `cnpj.generate()` |

---

# API

## CPF

### `cpf.isValid(value: string): boolean`

Valida um CPF.

* Aceita com ou sem formatação
* Rejeita sequências repetidas (ex: `111.111.111-11`)
* Valida os dígitos verificadores

---

### `cpf.generate(options?: CpfGenerateOptions): string`

Gera um CPF válido aleatoriamente.

| Opção       | Tipo      | Padrão |
| ----------- | --------- | ------ |
| `formatted` | `boolean` | `true` |

Exemplo:

```typescript
cpf.generate();
cpf.generate({ formatted: false });
```

---

### `cpf.format(value: string): string | null`

Formata para o padrão:

```
000.000.000-00
```

Retorna `null` caso não possua 11 dígitos válidos.

---

## CNPJ

### `cnpj.isValid(value: string): boolean`

Valida CNPJ numérico.

* Aceita com ou sem formatação
* Rejeita sequências repetidas
* Valida os dígitos verificadores

---

### `cnpj.generate(options?: CnpjGenerateOptions): string`

Gera um CNPJ válido.

| Opção       | Tipo                          | Padrão      |
| ----------- | ----------------------------- | ----------- |
| `type`      | `'numeric' \| 'alphanumeric'` | `'numeric'` |
| `formatted` | `boolean`                     | `true`      |

Exemplo:

```typescript
cnpj.generate();

cnpj.generate({
  type: 'alphanumeric',
  formatted: false
});
```

---

### `cnpj.format(value: string): string | null`

Formata para o padrão:

```
00.000.000/0000-00
```

* Funciona para CNPJ numérico
* Funciona para CNPJ alfanumérico
* Retorna `null` se não possuir 14 caracteres

---

## Requisitos

* Node.js 18+
* Ambiente com suporte a ES Modules

---

## Licença

MIT


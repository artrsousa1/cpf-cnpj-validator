import { describe, it } from 'node:test';
import assert from 'node:assert';
import { cnpj } from '../dist/index.js';

describe('CNPJ', () => {
  describe('cnpj.isValid', () => {
    it('retorna true para CNPJ válido (apenas dígitos)', () => {
      assert.strictEqual(cnpj.isValid('11222333000181'), true);
    });
    it('retorna true para CNPJ válido formatado', () => {
      assert.strictEqual(cnpj.isValid('11.222.333/0001-81'), true);
    });
    it('retorna false para CNPJ inválido (dígito errado)', () => {
      assert.strictEqual(cnpj.isValid('11222333000182'), false);
    });
    it('retorna false para sequência repetida', () => {
      assert.strictEqual(cnpj.isValid('11111111111111'), false);
      assert.strictEqual(cnpj.isValid('00000000000000'), false);
    });
    it('retorna false para quantidade errada de dígitos', () => {
      assert.strictEqual(cnpj.isValid('123'), false);
      assert.strictEqual(cnpj.isValid('123456789012345'), false);
    });
    it('retorna true para CNPJ alfanumérico válido (sem formatação)', () => {
      const value = cnpj.generate({ type: 'alphanumeric', formatted: false });
      assert.strictEqual(cnpj.isValid(value), true);
    });
    it('retorna true para CNPJ alfanumérico válido (formatado)', () => {
      const value = cnpj.generate({ type: 'alphanumeric' });
      assert.strictEqual(cnpj.isValid(value), true);
    });
    it('retorna false para CNPJ alfanumérico inválido (dígito errado)', () => {
      const valid = cnpj.generate({ type: 'alphanumeric', formatted: false });
      const lastDigit = (parseInt(valid[13], 10) + 1) % 10;
      const invalid = valid.slice(0, 13) + lastDigit;
      assert.strictEqual(cnpj.isValid(invalid), false);
    });
    it('retorna false para CNPJ alfanumérico com quantidade errada', () => {
      assert.strictEqual(cnpj.isValid('AB123'), false);
      assert.strictEqual(cnpj.isValid('AB123CDE00014299'), false);
    });
    it('valida CNPJs alfanuméricos gerados', () => {
      for (let i = 0; i < 30; i++) {
        const value = cnpj.generate({ type: 'alphanumeric', formatted: false });
        assert.strictEqual(cnpj.isValid(value), true);
      }
    });
  });

  describe('cnpj.generate', () => {
    it('retorna string formatada por default (00.000.000/0000-00)', () => {
      const value = cnpj.generate();
      assert.strictEqual(value.length, 18);
      assert.match(value, /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/);
    });
    it('retorna string sem formatação quando formatted: false', () => {
      const value = cnpj.generate({ formatted: false });
      assert.strictEqual(value.length, 14);
      assert.match(value, /^\d{14}$/);
    });
    it('gera CNPJ alfanumérico quando type: alphanumeric', () => {
      const value = cnpj.generate({ type: 'alphanumeric' });
      assert.match(value, /^[A-Z0-9]{2}\.[A-Z0-9]{3}\.[A-Z0-9]{3}\/[A-Z0-9]{4}-[0-9]{2}$/);
    });
    it('gera CNPJ alfanumérico sem formatação quando type: alphanumeric, formatted: false', () => {
      const value = cnpj.generate({ type: 'alphanumeric', formatted: false });
      assert.strictEqual(value.length, 14);
      assert.match(value, /^[A-Z0-9]{14}$/);
    });
    it('gera CNPJ válido', () => {
      for (let i = 0; i < 50; i++) {
        assert.strictEqual(cnpj.isValid(cnpj.generate()), true);
      }
    });
  });

  describe('cnpj.format', () => {
    it('formata como 00.000.000/0000-00', () => {
      assert.strictEqual(cnpj.format('11222333000181'), '11.222.333/0001-81');
    });
    it('aceita já formatado', () => {
      assert.strictEqual(cnpj.format('11.222.333/0001-81'), '11.222.333/0001-81');
    });
    it('retorna null para quantidade inválida', () => {
      assert.strictEqual(cnpj.format('123'), null);
    });
  });
});
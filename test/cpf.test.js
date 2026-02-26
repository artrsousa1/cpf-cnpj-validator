import { describe, it } from 'node:test';
import assert from 'node:assert';
import { cpf } from '../dist/index.js';

describe('CPF', () => {
  describe('cpf.isValid', () => {
    it('retorna true para CPF válido (apenas dígitos)', () => {
      assert.strictEqual(cpf.isValid('31340280930'), true);
    });
    it('retorna true para CPF válido formatado', () => {
      assert.strictEqual(cpf.isValid('313.402.809-30'), true);
    });
    it('retorna false para CPF inválido (dígito errado)', () => {
      assert.strictEqual(cpf.isValid('31340280931'), false);
    });
    it('retorna false para sequência repetida', () => {
      assert.strictEqual(cpf.isValid('11111111111'), false);
      assert.strictEqual(cpf.isValid('00000000000'), false);
    });
    it('retorna false para quantidade errada de dígitos', () => {
      assert.strictEqual(cpf.isValid('123'), false);
      assert.strictEqual(cpf.isValid('123456789012'), false);
    });
  });

  describe('cpf.generate', () => {
    it('retorna string formatada por default (000.000.000-00)', () => {
      const value = cpf.generate();
      assert.strictEqual(value.length, 14);
      assert.match(value, /^\d{3}\.\d{3}\.\d{3}-\d{2}$/);
    });
    it('retorna string sem formatação quando formatted: false', () => {
      const value = cpf.generate({ formatted: false });
      assert.strictEqual(value.length, 11);
      assert.match(value, /^\d{11}$/);
    });
    it('gera CPF válido', () => {
      for (let i = 0; i < 50; i++) {
        assert.strictEqual(cpf.isValid(cpf.generate()), true);
      }
    });
  });

  describe('cpf.format', () => {
    it('formata como 000.000.000-00', () => {
      assert.strictEqual(cpf.format('31340280930'), '313.402.809-30');
    });
    it('aceita já formatado', () => {
      assert.strictEqual(cpf.format('313.402.809-30'), '313.402.809-30');
    });
    it('retorna null para quantidade inválida', () => {
      assert.strictEqual(cpf.format('123'), null);
    });
  });
});

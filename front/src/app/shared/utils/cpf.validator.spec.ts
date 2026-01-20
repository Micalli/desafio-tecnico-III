import { FormControl } from '@angular/forms';
import { cleanCpf, maskCpf, isValidCpf, cpfValidator } from './cpf.validator';

describe('CPF Validator', () => {
  describe('cleanCpf', () => {
    it('should remove non-numeric characters', () => {
      expect(cleanCpf('123.456.789-09')).toBe('12345678909');
      expect(cleanCpf('12345678909')).toBe('12345678909');
      expect(cleanCpf('abc123def456')).toBe('123456');
    });

    it('should handle empty string', () => {
      expect(cleanCpf('')).toBe('');
    });
  });

  describe('maskCpf', () => {
    it('should apply mask to CPF', () => {
      expect(maskCpf('12345678901')).toBe('123.456.789-01');
      expect(maskCpf('12345678909')).toBe('123.456.789-09');
    });

    it('should apply partial mask for incomplete CPF', () => {
      expect(maskCpf('123')).toBe('123');
      expect(maskCpf('123456')).toBe('123.456');
      expect(maskCpf('123456789')).toBe('123.456.789');
    });

    it('should handle CPF with mask already applied', () => {
      expect(maskCpf('123.456.789-09')).toBe('123.456.789-09');
    });

    it('should handle empty string', () => {
      expect(maskCpf('')).toBe('');
    });
  });

  describe('isValidCpf', () => {
    it('should validate correct CPF', () => {
      expect(isValidCpf('12345678909')).toBeTrue();
      expect(isValidCpf('11144477735')).toBeTrue();
      expect(isValidCpf('00000000191')).toBeTrue();
    });

    it('should reject invalid CPF', () => {
      expect(isValidCpf('12345678900')).toBeFalse();
      expect(isValidCpf('11111111111')).toBeFalse();
      expect(isValidCpf('123')).toBeFalse();
      expect(isValidCpf('123456789012')).toBeFalse();
    });

    it('should reject CPF with all same digits', () => {
      expect(isValidCpf('11111111111')).toBeFalse();
      expect(isValidCpf('22222222222')).toBeFalse();
      expect(isValidCpf('00000000000')).toBeFalse();
    });
  });

  describe('cpfValidator', () => {
    it('should return null for empty value', () => {
      const validator = cpfValidator();
      const control = new FormControl('');
      
      expect(validator(control)).toBeNull();
    });

    it('should return null for valid CPF', () => {
      const validator = cpfValidator();
      const control = new FormControl('123.456.789-09');
      
      expect(validator(control)).toBeNull();
    });

    it('should return error for invalid CPF length', () => {
      const validator = cpfValidator();
      const control = new FormControl('123');
      
      const result = validator(control);
      expect(result).not.toBeNull();
      expect(result?.['cpfInvalid']).toBeDefined();
    });

    it('should return error for invalid CPF', () => {
      const validator = cpfValidator();
      const control = new FormControl('12345678900');
      
      const result = validator(control);
      expect(result).not.toBeNull();
      expect(result?.['cpfInvalid']).toBeDefined();
    });

    it('should accept CPF with or without mask', () => {
      const validator = cpfValidator();
      const control1 = new FormControl('12345678909');
      const control2 = new FormControl('123.456.789-09');
      
      expect(validator(control1)).toBeNull();
      expect(validator(control2)).toBeNull();
    });
  });
});


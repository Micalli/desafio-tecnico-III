import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Remove caracteres não numéricos do CPF
 */
export function cleanCpf(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

/**
 * Aplica máscara de CPF (000.000.000-00)
 */
export function maskCpf(value: string): string {
  const cleaned = cleanCpf(value);
  if (cleaned.length <= 3) {
    return cleaned;
  } else if (cleaned.length <= 6) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
  } else if (cleaned.length <= 9) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
  } else {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
  }
}

/**
 * Valida se o CPF é válido
 */
export function isValidCpf(cpf: string): boolean {
  const cleaned = cleanCpf(cpf);
  
  if (cleaned.length !== 11) {
    return false;
  }

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleaned)) {
    return false;
  }

  // Validação dos dígitos verificadores
  let sum = 0;
  let remainder: number;

  // Valida primeiro dígito verificador
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleaned.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.substring(9, 10))) {
    return false;
  }

  // Valida segundo dígito verificador
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleaned.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.substring(10, 11))) {
    return false;
  }

  return true;
}

/**
 * Validador customizado para CPF
 */
export function cpfValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // Se vazio, deixa o required validator tratar
    }

    const cleaned = cleanCpf(control.value);
    
    if (cleaned.length === 0) {
      return null; // Se vazio após limpar, deixa o required validator tratar
    }

    if (cleaned.length !== 11) {
      return { cpfInvalid: { value: control.value } };
    }

    if (!isValidCpf(cleaned)) {
      return { cpfInvalid: { value: control.value } };
    }

    return null;
  };
}


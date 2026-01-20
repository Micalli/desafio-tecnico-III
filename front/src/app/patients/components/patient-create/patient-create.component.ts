import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PatientService } from '../../../core/services/patient.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { cpfValidator, maskCpf, cleanCpf } from '../../../shared/utils/cpf.validator';

@Component({
  selector: 'app-patient-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoadingComponent, ErrorMessageComponent],
  templateUrl: './patient-create.component.html',
  styleUrl: './patient-create.component.css'
})
export class PatientCreateComponent implements OnInit {
  patientForm: FormGroup;
  isSubmitting = false;
  error: string | null = null;
  success = false;

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private router: Router
  ) {
    this.patientForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      document: ['', [Validators.required, cpfValidator()]],
      birthDate: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {}

  onCpfInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const masked = maskCpf(input.value);
    const control = this.patientForm.get('document');

    input.value = masked;

    control?.setValue(masked, { emitEvent: false });
    control?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.patientForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;
    this.error = null;
    this.success = false;

    const formValue = this.patientForm.value;
    const patientData = {
      ...formValue,
      document: cleanCpf(formValue.document),
      birthDate: new Date(formValue.birthDate).toISOString()
    };

    this.patientService.create(patientData).subscribe({
      next: () => {
        this.success = true;
        this.isSubmitting = false;
        setTimeout(() => {
          this.router.navigate(['/patients']);
        }, 1500);
      },
      error: (err) => {
        this.handleError(err.error);
        this.isSubmitting = false;
      }
    });
  }

  handleError(error: any): void {
    if (error.statusCode === 0 || error.name === 'HttpErrorResponse') {
      this.error = 'Erro de conexão. Verifique se o servidor está rodando.';
    } else if (error.statusCode === 400) {
      this.error = error?.message || 'Dados inválidos. Verifique os campos preenchidos.';
    } else if (error.statusCode === 409) {
      this.error = error?.message || 'Paciente já cadastrado.';
    } else {
      this.error = error?.message || 'Erro ao criar paciente.';
    }
  }

  onRetry(): void {
    this.error = null;
    this.onSubmit();
  }

  markFormGroupTouched(): void {
    Object.keys(this.patientForm.controls).forEach(key => {
      const control = this.patientForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const control = this.patientForm.get(fieldName);
    if (control?.hasError('required') && control.touched) {
      return 'Este campo é obrigatório';
    }
    if (control?.hasError('minlength') && control.touched) {
      return `Mínimo de ${control.errors?.['minlength'].requiredLength} caracteres`;
    }
    if (control?.hasError('pattern') && control.touched) {
      return 'Formato inválido';
    }
    if (control?.hasError('cpfInvalid') && control.touched) {
      return 'CPF inválido';
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.patientForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }
}


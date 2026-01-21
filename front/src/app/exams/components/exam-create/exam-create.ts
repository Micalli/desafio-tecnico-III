import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ExamService } from '../../../core/services/exam.service';
import { PatientService } from '../../../core/services/patient.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';

@Component({
  selector: 'app-exam-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    LoadingComponent,
    ErrorMessageComponent,
  ],
  templateUrl: './exam-create.html',
  styleUrl: './exam-create.css',
})
export class ExamCreate implements OnInit {
  examForm: FormGroup;
  isSubmitting = false;
  error: string | null = null;
  success = false;
  patients: any[] = [];
  loadingPatients = false;

  modalities = [
    'CR',
    'CT',
    'DX',
    'MG',
    'MR',
    'NM',
    'OT',
    'PT',
    'RF',
    'US',
    'XA',
  ];

  timeOptions: string[] = [];

  constructor(
    private fb: FormBuilder,
    private examService: ExamService,
    private patientService: PatientService,
    private router: Router
  ) {
    this.examForm = this.fb.group({
      idempotencyKey: ['', Validators.required],
      patientId: ['', Validators.required],
      description: [''],
      examDate: ['', Validators.required],
      examTime: ['', Validators.required],
      modality: ['', Validators.required],
    });
  }
  minDate!: string;

  ngOnInit(): void {
    this.loadPatients();
    this.generateTimes();
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0]; // yyyy-MM-dd
  }

  generateTimes(): void {
    for (let h = 8; h <= 20; h++) {
      this.timeOptions.push(`${this.pad(h)}:00`);

      if (h < 20) {
        this.timeOptions.push(`${this.pad(h)}:30`);
      }
    }
  }

  pad(value: number): string {
    return value.toString().padStart(2, '0');
  }

  loadPatients(): void {
    this.loadingPatients = true;
    this.patientService.findAll(1, 100).subscribe({
      next: (data) => {
        this.patients = data;
        this.loadingPatients = false;
      },
      error: () => {
        this.loadingPatients = false;
      },
    });
  }

  onSubmit(): void {
    if (this.examForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;
    this.error = null;
    this.success = false;

    const { examDate, examTime, ...rest } = this.examForm.value;

    const examDateTime = new Date(`${examDate}T${examTime}`);

    const payload = {
      ...rest,
      examDate: examDateTime.toISOString(),
    };

    this.examService.create(payload).subscribe({
      next: () => {
        this.success = true;
        this.isSubmitting = false;

        setTimeout(() => {
          this.router.navigate(['/exams']);
        }, 1500);
      },
      error: (err) => {
        this.handleError(err);
        this.isSubmitting = false;
      },
    });
  }

  handleError(error: any): void {
    if (error.status === 0 || error.name === 'HttpErrorResponse') {
      this.error =
        'Erro de conexão. Verifique se o servidor está rodando.';
    } else if (error.status === 400) {
      this.error =
        error.error?.message ||
        'Dados inválidos. Verifique os campos preenchidos.';
    } else {
      this.error = error.error?.message || 'Erro ao criar exame.';
    }
  }

  onRetry(): void {
    this.error = null;
    this.onSubmit();
  }

  markFormGroupTouched(): void {
    Object.keys(this.examForm.controls).forEach((key) => {
      this.examForm.get(key)?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const control = this.examForm.get(fieldName);
    if (control?.hasError('required') && control.touched) {
      return 'Este campo é obrigatório';
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.examForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }
}

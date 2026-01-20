import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { PatientCreateComponent } from './patient-create.component';
import { PatientService } from '../../../core/services/patient.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { HttpErrorResponse } from '@angular/common/http';

describe('PatientCreateComponent', () => {
  let component: PatientCreateComponent;
  let fixture: ComponentFixture<PatientCreateComponent>;
  let patientService: jasmine.SpyObj<PatientService>;
  let router: Router;

  const mockPatient = {
    id: '1',
    name: 'João Silva',
    document: '12345678901',
    birthDate: '1990-01-01',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  };

  beforeEach(async () => {
    const patientServiceSpy = jasmine.createSpyObj('PatientService', ['create']);

    await TestBed.configureTestingModule({
      imports: [
        PatientCreateComponent,
        LoadingComponent,
        ErrorMessageComponent
      ],
      providers: [
        FormBuilder,
        provideRouter([]),
        { provide: PatientService, useValue: patientServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PatientCreateComponent);
    component = fixture.componentInstance;
    patientService = TestBed.inject(PatientService) as jasmine.SpyObj<PatientService>;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.patientForm).toBeDefined();
  });

  it('should initialize form with empty values', () => {
    expect(component.patientForm.get('name')?.value).toBe('');
    expect(component.patientForm.get('document')?.value).toBe('');
    expect(component.patientForm.get('birthDate')?.value).toBe('');
  });

  it('should have required validators on all fields', () => {
    const nameControl = component.patientForm.get('name');
    const documentControl = component.patientForm.get('document');
    const birthDateControl = component.patientForm.get('birthDate');

    nameControl?.setValue('');
    documentControl?.setValue('');
    birthDateControl?.setValue('');

    expect(nameControl?.hasError('required')).toBeTrue();
    expect(documentControl?.hasError('required')).toBeTrue();
    expect(birthDateControl?.hasError('required')).toBeTrue();
  });

  it('should validate name minimum length', () => {
    const nameControl = component.patientForm.get('name');
    nameControl?.setValue('Ab');
    nameControl?.markAsTouched();

    expect(nameControl?.hasError('minlength')).toBeTrue();
    expect(component.getFieldError('name')).toContain('Mínimo de 3 caracteres');
  });

  it('should validate CPF format', () => {
    const documentControl = component.patientForm.get('document');
    documentControl?.setValue('123');
    documentControl?.markAsTouched();

    expect(documentControl?.hasError('cpfInvalid')).toBeTrue();
    expect(component.getFieldError('document')).toBe('CPF inválido');
  });

  it('should accept valid CPF', () => {
    const documentControl = component.patientForm.get('document');
    documentControl?.setValue('12345678909');
    documentControl?.markAsTouched();

    expect(documentControl?.hasError('cpfInvalid')).toBeFalsy();
  });

  it('should apply CPF mask on input', () => {
    const input = document.createElement('input');
    input.value = '12345678901';
    const event = { target: input } as unknown as Event;

    component.onCpfInput(event);

    expect(input.value).toBe('123.456.789-01');
  });

  it('should not submit invalid form', () => {
    component.patientForm.patchValue({
      name: '',
      document: '',
      birthDate: ''
    });

    component.onSubmit();

    expect(patientService.create).not.toHaveBeenCalled();
    expect(component.isSubmitting).toBeFalse();
  });



  it('should remove CPF mask before submitting', (done) => {
    patientService.create.and.returnValue(of(mockPatient));

    component.patientForm.patchValue({
      name: 'João Silva',
      document: '123.456.789-09',
      birthDate: '1990-01-01'
    });

    component.onSubmit();

    setTimeout(() => {
      const callArgs = patientService.create.calls.mostRecent().args[0];
      expect(callArgs.document).toBe('12345678909');
      done();
    }, 100);
  });

  it('should show success message after successful creation', (done) => {
    patientService.create.and.returnValue(of(mockPatient));

    component.patientForm.patchValue({
      name: 'João Silva',
      document: '12345678909',
      birthDate: '1990-01-01'
    });

    component.onSubmit();

    setTimeout(() => {
      expect(component.success).toBeTrue();
      expect(component.isSubmitting).toBeFalse();
      done();
    }, 200);
  });

  it('should navigate to patients list after success', (done) => {
    patientService.create.and.returnValue(of(mockPatient));

    component.patientForm.patchValue({
      name: 'João Silva',
      document: '12345678909',
      birthDate: '1990-01-01'
    });

    component.onSubmit();

    setTimeout(() => {
      expect(router.navigate).toHaveBeenCalledWith(['/patients']);
      done();
    }, 1600);
  }, 2000);

 it('should handle network error', (done) => {
  const error = new HttpErrorResponse({
    status: 0,
    statusText: 'Unknown Error',
    error: new ProgressEvent('error'),
  });

  patientService.create.and.returnValue(throwError(() => error));

  component.patientForm.patchValue({
    name: 'João Silva',
    document: '12345678909',
    birthDate: '1990-01-01',
  });

  component.onSubmit();

  setTimeout(() => {
    expect(component.error).toBe(
      'Erro ao criar paciente.'
    );
    expect(component.isSubmitting).toBeFalse();
    done();
  }, 0);
});

  it('should handle 400 error', (done) => {
    const error = { status: 400, error: { message: 'Patient already exists' } };
    patientService.create.and.returnValue(throwError(() => error));

    component.patientForm.patchValue({
      name: 'João Silva',
      document: '12345678909',
      birthDate: '1990-01-01'
    });

    component.onSubmit();

    setTimeout(() => {
      expect(component.error).toBe('Patient already exists');
      done();
    }, 100);
  });

  it('should mark all fields as touched when form is invalid', () => {
    component.patientForm.patchValue({
      name: '',
      document: '',
      birthDate: ''
    });

    component.markFormGroupTouched();

    expect(component.patientForm.get('name')?.touched).toBeTrue();
    expect(component.patientForm.get('document')?.touched).toBeTrue();
    expect(component.patientForm.get('birthDate')?.touched).toBeTrue();
  });

  it('should retry submission on retry', (done) => {
    patientService.create.and.returnValue(of(mockPatient));
    component.error = 'Some error';

    component.patientForm.patchValue({
      name: 'João Silva',
      document: '12345678909',
      birthDate: '1990-01-01'
    });

    component.onRetry();

    expect(component.error).toBeNull();

    setTimeout(() => {
      expect(patientService.create).toHaveBeenCalled();
      done();
    }, 100);
  });

  it('should return correct error messages', () => {
    const nameControl = component.patientForm.get('name');
    nameControl?.setValue('');
    nameControl?.markAsTouched();

    expect(component.getFieldError('name')).toBe('Este campo é obrigatório');
  });

  it('should identify invalid fields', () => {
    const nameControl = component.patientForm.get('name');
    nameControl?.setValue('');
    nameControl?.markAsTouched();

    expect(component.isFieldInvalid('name')).toBeTrue();
  });
});


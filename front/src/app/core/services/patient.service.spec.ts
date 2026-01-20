import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PatientService, Patient, CreatePatientDto } from './patient.service';

describe('PatientService', () => {
  let service: PatientService;
  let httpMock: HttpTestingController;

  const mockPatients: Patient[] = [
    {
      id: '1',
      name: 'João Silva',
      document: '12345678901',
      birthDate: '1990-01-01',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    }
  ];

  const mockPatient: Patient = {
    id: '1',
    name: 'João Silva',
    document: '12345678901',
    birthDate: '1990-01-01',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PatientService]
    });

    service = TestBed.inject(PatientService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all patients', () => {
    const page = 1;
    const pageSize = 10;

    service.findAll(page, pageSize).subscribe(patients => {
      expect(patients).toEqual(mockPatients);
    });

    const req = httpMock.expectOne(`http://localhost:3000/pacientes?page=${page}&pageSize=${pageSize}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPatients);
  });

  it('should fetch patients with default pagination', () => {
    service.findAll().subscribe(patients => {
      expect(patients).toEqual(mockPatients);
    });

    const req = httpMock.expectOne('http://localhost:3000/pacientes?page=1&pageSize=10');
    expect(req.request.method).toBe('GET');
    req.flush(mockPatients);
  });

  it('should create a new patient', () => {
    const newPatient: CreatePatientDto = {
      name: 'João Silva',
      document: '12345678901',
      birthDate: '1990-01-01'
    };

    service.create(newPatient).subscribe(patient => {
      expect(patient).toEqual(mockPatient);
    });

    const req = httpMock.expectOne('http://localhost:3000/pacientes');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newPatient);
    req.flush(mockPatient);
  });

  it('should handle error when fetching patients fails', () => {
    const page = 1;
    const pageSize = 10;

    service.findAll(page, pageSize).subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error.status).toBe(500);
      }
    });

    const req = httpMock.expectOne(`http://localhost:3000/pacientes?page=${page}&pageSize=${pageSize}`);
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
  });

  it('should handle error when creating patient fails', () => {
    const newPatient: CreatePatientDto = {
      name: 'João Silva',
      document: '12345678901',
      birthDate: '1990-01-01'
    };

    service.create(newPatient).subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error.status).toBe(400);
      }
    });

    const req = httpMock.expectOne('http://localhost:3000/pacientes');
    req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
  });
});


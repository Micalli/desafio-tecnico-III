import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ExamService, Exam, CreateExamDto } from './exam.service';

describe('ExamService', () => {
  let service: ExamService;
  let httpMock: HttpTestingController;

  const mockExams: Exam[] = [
    {
      id: '1',
      patientId: '1',
      idempotencyKey: 'key1',
      description: 'Exame de rotina',
      examDate: '2024-01-01',
      modality: 'CT',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      patient: {
        id: '1',
        name: 'João Silva'
      }
    }
  ];

  const mockExam: Exam = {
    id: '1',
    patientId: '1',
    idempotencyKey: 'key1',
    description: 'Exame de rotina',
    examDate: '2024-01-01',
    modality: 'CT',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    patient: {
      id: '1',
      name: 'João Silva'
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ExamService]
    });

    service = TestBed.inject(ExamService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all exams', () => {
    const page = 1;
    const pageSize = 10;

    service.findAll(page, pageSize).subscribe(exams => {
      expect(exams).toEqual(mockExams);
    });

    const req = httpMock.expectOne(`http://localhost:3000/exam?page=${page}&pageSize=${pageSize}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockExams);
  });

  it('should fetch exams with default pagination', () => {
    service.findAll().subscribe(exams => {
      expect(exams).toEqual(mockExams);
    });

    const req = httpMock.expectOne('http://localhost:3000/exam?page=1&pageSize=10');
    expect(req.request.method).toBe('GET');
    req.flush(mockExams);
  });

  it('should create a new exam', () => {
    const newExam: CreateExamDto = {
      idempotencyKey: 'key1',
      patientId: '1',
      description: 'Exame de rotina',
      examDate: '2024-01-01',
      modality: 'CT'
    };

    service.create(newExam).subscribe(exam => {
      expect(exam).toEqual(mockExam);
    });

    const req = httpMock.expectOne('http://localhost:3000/exam');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newExam);
    req.flush(mockExam);
  });

  it('should handle error when fetching exams fails', () => {
    const page = 1;
    const pageSize = 10;

    service.findAll(page, pageSize).subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error.status).toBe(500);
      }
    });

    const req = httpMock.expectOne(`http://localhost:3000/exam?page=${page}&pageSize=${pageSize}`);
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
  });

  it('should handle error when creating exam fails', () => {
    const newExam: CreateExamDto = {
      idempotencyKey: 'key1',
      patientId: '1',
      examDate: '2024-01-01',
      modality: 'CT'
    };

    service.create(newExam).subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error.status).toBe(400);
      }
    });

    const req = httpMock.expectOne('http://localhost:3000/exam');
    req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
  });
});


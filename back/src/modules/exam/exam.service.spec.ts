import { Test, TestingModule } from '@nestjs/testing';
import { ExamService } from './exam.service';
import { ExamRepository } from '../../shared/database/repository/exam.repository';
import { CreateExamDto } from './dto/create-exam.dto';
import { ExamModality } from '@prisma/client';
import { PatientsRepository } from 'src/shared/database/repository/patient.repository';

describe('ExamService', () => {
  let service: ExamService;
  let repository: jest.Mocked<ExamRepository>;
  const patientsRepositoryMock = {
    findUnique: jest.fn(),
  };
  const mockExam = {
    id: '1',
    patientId: '1',
    idempotencyKey: 'test-key-123',
    description: 'Exame de rotina',
    examDate: new Date('2024-01-15'),
    modality: ExamModality.CT,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreateExamDto: CreateExamDto = {
    idempotencyKey: 'test-key-123',
    patientId: '1',
    description: 'Exame de rotina',
    examDate: new Date('2024-01-15'),
    modality: ExamModality.CT,
  };

  beforeEach(async () => {
    const repositoryMock = {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExamService,
        {
          provide: ExamRepository,
          useValue: repositoryMock,
        },
        {
          provide: PatientsRepository,
          useValue: patientsRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<ExamService>(ExamService);
    repository = module.get(ExamRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new exam successfully', async () => {
      // 🟢 MOCK do paciente existente
      patientsRepositoryMock.findUnique.mockResolvedValue({
        id: '1',
      } as any);

      repository.create.mockResolvedValue(mockExam);

      const result = await service.create({
        ...mockCreateExamDto,
        patientId: '1',
      });

      expect(patientsRepositoryMock.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });

      expect(repository.create).toHaveBeenCalledWith({
        data: {
          examDate: expect.any(Date),
          idempotencyKey: mockCreateExamDto.idempotencyKey,
          patientId: '1',
          description: mockCreateExamDto.description,
          modality: mockCreateExamDto.modality,
        },
      });

      expect(result).toEqual(mockExam);
    });

    it('should handle idempotency - return existing exam if key exists', async () => {
      const duplicateError = {
        code: 'P2002',
        meta: {
          target: ['idempotencyKey'],
        },
      };

      repository.create.mockRejectedValue(duplicateError);
      repository.findUnique.mockResolvedValue(mockExam);

      const result = await service.create(mockCreateExamDto);

      expect(repository.create).toHaveBeenCalled();
      expect(repository.findUnique).toHaveBeenCalledWith({
        where: { idempotencyKey: mockCreateExamDto.idempotencyKey },
      });
      expect(result).toEqual(mockExam);
    });
  });

  describe('findAll', () => {
    const mockExams = [
      mockExam,
      {
        ...mockExam,
        id: '2',
        idempotencyKey: 'test-key-456',
        modality: ExamModality.MR,
      },
    ];

    it('should return all exams with pagination', async () => {
      const page = 1;
      const pageSize = 10;

      repository.findMany.mockResolvedValue(mockExams);

      const result = await service.findAll(page, pageSize);

      expect(result).toEqual(mockExams);
    });

    it('should return empty array when no exams found', async () => {
      repository.findMany.mockResolvedValue([]);

      const result = await service.findAll(1, 10);

      expect(result).toEqual([]);
    });
  });
});

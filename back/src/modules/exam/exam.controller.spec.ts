import { Test, TestingModule } from '@nestjs/testing';
import { ExamController } from './exam.controller';
import { ExamService } from './exam.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { ExamModality } from '@prisma/client';

describe('ExamController', () => {
  let controller: ExamController;
  let service: jest.Mocked<ExamService>;

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
    const serviceMock = {
      create: jest.fn(),
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExamController],
      providers: [
        {
          provide: ExamService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = module.get<ExamController>(ExamController);
    service = module.get(ExamService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new exam', async () => {
      service.create.mockResolvedValue(mockExam);

      const result = await controller.create(mockCreateExamDto);

      expect(result).toEqual(mockExam);
    });

    it('should handle exam with different modalities', async () => {
      const dtoWithMR: CreateExamDto = {
        ...mockCreateExamDto,
        modality: ExamModality.MR,
      };

      service.create.mockResolvedValue({
        ...mockExam,
        modality: ExamModality.MR,
      });

      const result = await controller.create(dtoWithMR);

      expect(result.modality).toBe(ExamModality.MR);
    });

    describe('findAll', () => {
      const mockExams = [mockExam];

      it('should return all exams with default pagination', async () => {
        service.findAll.mockResolvedValue(mockExams);

        const result = await controller.findAll();

        expect(service.findAll).toHaveBeenCalledWith(1, 10);
        expect(result).toEqual(mockExams);
      });

      it('should return exams with custom pagination', async () => {
        const page = 2;
        const pageSize = 5;

        service.findAll.mockResolvedValue(mockExams);

        const result = await controller.findAll(page, pageSize);

        expect(service.findAll).toHaveBeenCalledWith(page, pageSize);
        expect(result).toEqual(mockExams);
      });

      it('should handle query parameters as strings', async () => {
        const page = '2' as unknown as number;
        const pageSize = '5' as unknown as number;

        service.findAll.mockResolvedValue(mockExams);

        await controller.findAll(page, pageSize);

        expect(service.findAll).toHaveBeenCalledWith(page, pageSize);
      });

      it('should return empty array when no exams found', async () => {
        service.findAll.mockResolvedValue([]);

        const result = await controller.findAll();

        expect(result).toEqual([]);
      });
    });
  });
});

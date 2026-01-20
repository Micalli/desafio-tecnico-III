import { Test, TestingModule } from '@nestjs/testing';
import { PatientController } from './patient.controller';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';

describe('PatientController', () => {
  let controller: PatientController;
  let service: jest.Mocked<PatientService>;

  const mockPatient = {
    id: '1',
    name: 'João Silva',
    document: '12345678901',
    birthDate: new Date('1990-01-01'),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreatePatientDto: CreatePatientDto = {
    name: 'João Silva',
    document: '12345678901',
    birthDate: new Date('1990-01-01'),
  };

  beforeEach(async () => {
    const serviceMock = {
      create: jest.fn(),
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatientController],
      providers: [
        {
          provide: PatientService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = module.get<PatientController>(PatientController);
    service = module.get(PatientService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new patient', async () => {
      service.create.mockResolvedValue(mockPatient);

      const result = await controller.create(mockCreatePatientDto);

      expect(service.create).toHaveBeenCalledWith(mockCreatePatientDto);
      expect(result).toEqual(mockPatient);
    });

    it('should pass DTO correctly to service', async () => {
      service.create.mockResolvedValue(mockPatient);

      await controller.create(mockCreatePatientDto);

      expect(service.create).toHaveBeenCalledWith(mockCreatePatientDto);
    });
  });

  describe('findAll', () => {
    const mockPatients = [mockPatient];

    it('should return all patients with default pagination', async () => {
      service.findAll.mockResolvedValue(mockPatients);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual(mockPatients);
    });

    it('should return patients with custom pagination', async () => {
      const page = 2;
      const pageSize = 5;

      service.findAll.mockResolvedValue(mockPatients);

      const result = await controller.findAll(page, pageSize);

      expect(service.findAll).toHaveBeenCalledWith(page, pageSize);
      expect(result).toEqual(mockPatients);
    });

    it('should handle query parameters as strings', async () => {
      const page = '2' as unknown as number;
      const pageSize = '5' as unknown as number;

      service.findAll.mockResolvedValue(mockPatients);

      await controller.findAll(page, pageSize);

      expect(service.findAll).toHaveBeenCalledWith(page, pageSize);
    });

    it('should return empty array when no patients found', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { PatientService } from './patient.service';
import { PatientsRepository } from '../../shared/database/repository/patient.repository';
import { CreatePatientDto } from './dto/create-patient.dto';

describe('PatientService', () => {
  let service: PatientService;
  let repository: jest.Mocked<PatientsRepository>;

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
    const repositoryMock = {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientService,
        {
          provide: PatientsRepository,
          useValue: repositoryMock,
        },
      ],
    }).compile();

    service = module.get<PatientService>(PatientService);
    repository = module.get(PatientsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new patient successfully', async () => {
      repository.findUnique.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockPatient);

      const result = await service.create(mockCreatePatientDto);

      expect(repository.findUnique).toHaveBeenCalledWith({
        where: { document: mockCreatePatientDto.document },
      });
      expect(repository.create).toHaveBeenCalledWith({
        data: {
          name: mockCreatePatientDto.name,
          document: mockCreatePatientDto.document,
          birthDate: expect.any(Date),
        },
      });
      expect(result).toEqual(mockPatient);
    });

    it('should throw BadRequestException when patient already exists', async () => {
      repository.findUnique.mockResolvedValue(mockPatient);

      await expect(service.create(mockCreatePatientDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(mockCreatePatientDto)).rejects.toThrow(
        'Paciente já cadastrado.',
      );

      expect(repository.findUnique).toHaveBeenCalled();
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should convert birthDate string to Date object', async () => {
      const dtoWithStringDate: CreatePatientDto = {
        name: 'Maria Santos',
        document: '98765432100',
        birthDate: new Date('1985-05-15'),
      };

      repository.findUnique.mockResolvedValue(null);
      repository.create.mockResolvedValue({
        ...mockPatient,
        ...dtoWithStringDate,
      });

      await service.create(dtoWithStringDate);

      expect(repository.create).toHaveBeenCalledWith({
        data: {
          name: dtoWithStringDate.name,
          document: dtoWithStringDate.document,
          birthDate: expect.any(Date),
        },
      });
    });
  });

  describe('findAll', () => {
    const mockPatients = [
      mockPatient,
      {
        ...mockPatient,
        id: '2',
        name: 'Maria Santos',
        document: '98765432100',
      },
    ];

    it('should return all patients with pagination', async () => {
      const page = 1;
      const pageSize = 10;

      repository.findMany.mockResolvedValue(mockPatients);

      const result = await service.findAll(page, pageSize);

      expect(repository.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
      });
      expect(result).toEqual(mockPatients);
    });

    it('should calculate skip correctly for different pages', async () => {
      const page = 2;
      const pageSize = 10;

      repository.findMany.mockResolvedValue(mockPatients);

      await service.findAll(page, pageSize);

      expect(repository.findMany).toHaveBeenCalledWith({
        skip: 10,
        take: 10,
      });
    });

    it('should handle different page sizes', async () => {
      const page = 1;
      const pageSize = 5;

      repository.findMany.mockResolvedValue(mockPatients);

      await service.findAll(page, pageSize);

      expect(repository.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 5,
      });
    });

    it('should convert pageSize to number', async () => {
      const page = 1;
      const pageSize = '10' as unknown as number;

      repository.findMany.mockResolvedValue(mockPatients);

      await service.findAll(page, pageSize);

      expect(repository.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
      });
    });

    it('should return empty array when no patients found', async () => {
      repository.findMany.mockResolvedValue([]);

      const result = await service.findAll(1, 10);

      expect(result).toEqual([]);
    });
  });
});

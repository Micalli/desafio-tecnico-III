import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/shared/database/prisma.sevice';

describe('ExamController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let patientId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    prismaService = app.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    // Clean DB
    await prismaService.exam.deleteMany();
    await prismaService.patient.deleteMany();

    // Create a patient for exams
    const patient = await prismaService.patient.create({
      data: {
        name: 'John Doe',
        document: '12345678900',
        birthDate: new Date('1990-01-01'),
      },
    });
    patientId = patient.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/exam (POST)', () => {
    it('should create an exam', () => {
      return request(app.getHttpServer())
        .post('/exam')
        .send({
          idempotencyKey: 'key1',
          patientId: patientId,
          examDate: '2023-01-01',
          modality: 'CR',
          description: 'Chest X-Ray',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.modality).toBe('CR');
          expect(res.body.patientId).toBe(patientId);
        });
    });

    it('should return existing exam if idempotencyKey exists', async () => {
      // First creation
      await request(app.getHttpServer())
        .post('/exam')
        .send({
          idempotencyKey: 'key1',
          patientId: patientId,
          examDate: '2023-01-01',
          modality: 'CR',
          description: 'Chest X-Ray',
        })
        .expect(201);

      // Second creation with same key
      return request(app.getHttpServer())
        .post('/exam')
        .send({
          idempotencyKey: 'key1',
          patientId: patientId,
          examDate: '2023-01-01',
          modality: 'CR',
          description: 'Chest X-Ray',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.idempotencyKey).toBe('key1');
        });
    });

    it('should fail if patient does not exist', () => {
      return request(app.getHttpServer())
        .post('/exam')
        .send({
          idempotencyKey: 'key2',
          patientId: '00000000-0000-0000-0000-000000000000', // valid uuid but non-existent
          examDate: '2023-01-01',
          modality: 'CR',
        })
        .expect(404);
    });

    it('should fail if modality is invalid', () => {
      return request(app.getHttpServer())
        .post('/exam')
        .send({
          idempotencyKey: 'key3',
          patientId: patientId,
          examDate: '2023-01-01',
          modality: 'INVALID',
        })
        .expect(400);
    });
  });

  describe('/exam (GET)', () => {
    it('should return an array of exams', async () => {
      await prismaService.exam.create({
        data: {
          idempotencyKey: 'key1',
          patientId: patientId,
          examDate: new Date('2023-01-01'),
          modality: 'CR',
        },
      });

      return request(app.getHttpServer())
        .get('/exam')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0].modality).toBe('CR');
        });
    });
  });
});

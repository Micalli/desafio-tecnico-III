import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/shared/database/prisma.sevice';

describe('PatientController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

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
    // We need to delete exams first because of foreign key constraints
    await prismaService.exam.deleteMany();
    await prismaService.patient.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/pacientes (POST)', () => {
    it('should create a patient', () => {
      return request(app.getHttpServer())
        .post('/pacientes')
        .send({
          name: 'John Doe',
          document: '12345678900',
          birthDate: '1990-01-01',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.name).toBe('John Doe');
          expect(res.body.document).toBe('12345678900');
        });
    });

    it('should fail if document already exists', async () => {
      await prismaService.patient.create({
        data: {
          name: 'Jane Doe',
          document: '12345678900',
          birthDate: new Date('1990-01-01'),
        },
      });

      return request(app.getHttpServer())
        .post('/pacientes')
        .send({
          name: 'John Doe',
          document: '12345678900', // Same document
          birthDate: '1990-01-01',
        })
        .expect(409); // Conflict
    });

    it('should fail if required fields are missing', () => {
      return request(app.getHttpServer())
        .post('/pacientes')
        .send({
          name: 'John Doe',
        })
        .expect(400);
    });
  });

  describe('/pacientes (GET)', () => {
    it('should return an array of patients', async () => {
      await prismaService.patient.create({
        data: {
          name: 'John Doe',
          document: '12345678900',
          birthDate: new Date('1990-01-01'),
        },
      });

      return request(app.getHttpServer())
        .get('/pacientes')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0].name).toBe('John Doe');
        });
    });

    it('should support pagination', async () => {
      // Create 15 patients
      for (let i = 0; i < 15; i++) {
        await prismaService.patient.create({
          data: {
            name: `Patient ${i}`,
            document: `DOC${i}`,
            birthDate: new Date('1990-01-01'),
          },
        });
      }

      return request(app.getHttpServer())
        .get('/pacientes?page=1&pageSize=10')
        .expect(200)
        .expect((res) => {
          expect(res.body.length).toBe(10);
        });
    });
  });
});

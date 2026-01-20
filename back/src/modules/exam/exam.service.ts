import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateExamDto } from './dto/create-exam.dto';
import { Response } from 'express';
import { ExamRepository } from 'src/shared/database/repository/exam.repository';
import { PatientsRepository } from 'src/shared/database/repository/patient.repository';

@Injectable()
export class ExamService {
  constructor(
    private readonly examRepository: ExamRepository,
    private readonly patientsRepository: PatientsRepository,
  ) {}

  async create(createExamDto: CreateExamDto, res: Response) {
    const { examDate, idempotencyKey, patientId, description, modality } =
      createExamDto;

    const patientExists = await this.patientsRepository.findUnique({
      where: { id: patientId },
    });

    if (!patientExists) {
      throw new NotFoundException('Paciente não encontrado.');
    }

    try {
      return await this.examRepository.create({
        data: {
          examDate: new Date(examDate),
          idempotencyKey,
          patientId,
          description,
          modality,
        },
      });
    } catch (error) {
      if (
        error.code === 'P2002' &&
        error.meta?.target?.includes('idempotencyKey')
      ) {
        return await this.examRepository.findUnique({
          where: { idempotencyKey },
        });
      }

      throw error;
    }
  }

  async findAll(page: number, pageSize: number) {
    return await this.examRepository.findMany({
      skip: (page - 1) * pageSize,
      take: Number(pageSize),
      select: {
        id: true,
        examDate: true,
        modality: true,
        description: true,
        createdAt: true,
        idempotencyKey: true,
        patient: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
}

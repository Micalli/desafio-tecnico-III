import { ExamModality } from '@prisma/client';
import { IsDateString, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateExamDto {
  @IsNotEmpty()
  @IsString()
  idempotencyKey: string;
  @IsNotEmpty()
  @IsString()
  patientId: string;

  description?: string;

  @IsNotEmpty()
  @IsDateString()
  examDate: Date;

  @IsNotEmpty()
  @IsEnum(ExamModality, {
    message: `Modalidade inválida. Valores aceitos: ${Object.values(ExamModality).join(', ')}`,
  })
  modality: ExamModality;
}

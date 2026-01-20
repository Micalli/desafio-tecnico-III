import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.sevice';
import { PatientsRepository } from './repository/patient.repository';
import { ExamRepository } from './repository/exam.repository';

@Global()
@Module({
    providers: [
        PrismaService, 
        PatientsRepository,
        ExamRepository,
    ],
    exports: [
        PatientsRepository,
        ExamRepository,
    ],
})
export class DatabaseModule { }
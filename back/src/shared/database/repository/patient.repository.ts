import { Injectable } from '@nestjs/common';
import { type Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.sevice';

@Injectable()
export class PatientsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create(createDto: Prisma.PatientCreateArgs) {
    return this.prismaService.patient.create(createDto);
  }

  findMany(findManyDto: Prisma.PatientFindManyArgs) {
    return this.prismaService.patient.findMany(findManyDto);
  }

  findUnique(findUniqueDto: Prisma.PatientFindUniqueArgs) {
    return this.prismaService.patient.findUnique(findUniqueDto);
  }
}

import { Injectable } from '@nestjs/common';
import { type Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.sevice';

@Injectable()
export class ExamRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create(createDto: Prisma.ExamCreateArgs) {
    return this.prismaService.exam.create(createDto);
  }

  findMany(findManyDto: Prisma.ExamFindManyArgs) {
    return this.prismaService.exam.findMany(findManyDto);
  }

  findUnique(findUniqueDto: Prisma.ExamFindUniqueArgs) {
    return this.prismaService.exam.findUnique(findUniqueDto);
  }
}

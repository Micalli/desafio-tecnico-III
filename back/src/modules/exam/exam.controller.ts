import { Controller, Get, Post, Body, Query, Res } from '@nestjs/common';
import { ExamService } from './exam.service';
import { CreateExamDto } from './dto/create-exam.dto';

@Controller('exam')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Post()
  async create(
    @Body() createExamDto: CreateExamDto,
  ) {
    return await this.examService.create(createExamDto);
  }

  @Get()
  findAll(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
  ) {
    return this.examService.findAll(page, pageSize);
  }
}

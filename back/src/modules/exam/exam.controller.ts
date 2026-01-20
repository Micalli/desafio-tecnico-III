import { Controller, Get, Post, Body, Query, Res } from '@nestjs/common';
import { ExamService } from './exam.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { Response } from 'express';

@Controller('exam')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Post()
  async create(
    @Body() createExamDto: CreateExamDto,
    @Res() res: import('express').Response,
  ) {
    return await this.examService.create(createExamDto, res);
  }

  @Get()
  findAll(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
  ) {
    return this.examService.findAll(page, pageSize);
  }
}

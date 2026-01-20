import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExamModule } from './modules/exam/exam.module';
import { PatientModule } from './modules/patient/patient.module';
import { DatabaseModule } from './shared/database/database.module';

@Module({
  imports: [ExamModule, PatientModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

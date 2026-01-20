import { ConflictException, Injectable } from '@nestjs/common';
import { CreatePatientDto } from './dto/create-patient.dto';
import { PatientsRepository } from 'src/shared/database/repository/patient.repository';

@Injectable()
export class PatientService {
  constructor(private readonly patientsRepository: PatientsRepository) {}

  async create(createPatientDto: CreatePatientDto) {
    const { name, document, birthDate } = createPatientDto;

    const patientExists = await this.patientsRepository.findUnique({
      where: {
        document,
      },
    });
    if (patientExists) {
      throw new ConflictException('Paciente já cadastrado.');
    }
    const patient = await this.patientsRepository.create({
      data: {
        name,
        document,
        birthDate: new Date(birthDate),
      },
    });
    return patient;
  }

  async findAll(page: number, pageSize: number) {
    const patient = await this.patientsRepository.findMany({
      skip: (page - 1) * pageSize,
      take: Number(pageSize),
    });
    return patient;
  }
}

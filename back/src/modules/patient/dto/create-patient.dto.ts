import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreatePatientDto {
  @IsNotEmpty()
  @IsString()
  name: string;
  @IsNotEmpty()
  @IsString()
  document: string;
  @IsNotEmpty()
  @IsDateString()
  birthDate: Date;
}

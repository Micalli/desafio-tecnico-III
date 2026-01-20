import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Patient {
  id: string;
  name: string;
  document: string;
  birthDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePatientDto {
  name: string;
  document: string;
  birthDate: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total?: number;
  page?: number;
  pageSize?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private readonly apiUrl = 'http://localhost:3000/pacientes';

  constructor(private http: HttpClient) {}

  findAll(page: number = 1, pageSize: number = 10): Observable<Patient[]> {
    return this.http.get<Patient[]>(this.apiUrl, {
      params: { page: page.toString(), pageSize: pageSize.toString() }
    }).pipe(
      catchError(this.handleError)
    );
  }

  create(patient: CreatePatientDto): Observable<Patient> {
    return this.http.post<Patient>(this.apiUrl, patient).pipe(
      catchError(this.handleError)
    );
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    return throwError(() => error);
  };
}


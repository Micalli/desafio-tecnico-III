import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Exam {
  id: string;
  idempotencyKey: string;
  patientId: string;
  description?: string;
  examDate: string;
  modality: string;
  createdAt: string;
  updatedAt: string;
  patient: {
    id: string;
    name: string;
  };
}

export interface CreateExamDto {
  idempotencyKey: string;
  patientId: string;
  description?: string;
  examDate: string;
  modality: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExamService {
  private readonly apiUrl = `${environment.apiBaseUrl}/exam`;

  constructor(private http: HttpClient) {}

  findAll(page: number = 1, pageSize: number = 10): Observable<Exam[]> {
    return this.http.get<Exam[]>(this.apiUrl, {
      params: { page: page.toString(), pageSize: pageSize.toString() }
    }).pipe(
      catchError(this.handleError)
    );
  }

  create(exam: CreateExamDto): Observable<Exam> {
    return this.http.post<Exam>(this.apiUrl, exam).pipe(
      catchError(this.handleError)
    );
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    return throwError(() => error);
  };
}


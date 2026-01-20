import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PatientService, Patient } from '../../../core/services/patient.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { maskCpf } from '../../../shared/utils/cpf.validator';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingComponent, ErrorMessageComponent],
  templateUrl: './patient-list.component.html',
  styleUrl: './patient-list.component.css'
})
export class PatientListComponent implements OnInit {
  patients: Patient[] = [];
  loading = false;
  error: string | null = null;
  currentPage = 1;
  pageSize = 10;
  hasMore = true;

  constructor(private patientService: PatientService) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.loading = true;
    this.error = null;

    this.patientService.findAll(this.currentPage, this.pageSize).subscribe({
      next: (data) => {
        this.patients = data;
        this.hasMore = data.length === this.pageSize;
        this.loading = false;
      },
      error: (err) => {
        this.handleError(err);
        this.loading = false;
      }
    });
  }

  handleError(error: any): void {
    if (error.status === 0 || error.name === 'HttpErrorResponse') {
      this.error = 'Erro de conexão. Verifique se o servidor está rodando.';
    } else {
      this.error = error.error?.message || 'Erro ao carregar pacientes.';
    }
  }

  onRetry(): void {
    this.loadPatients();
  }

  onPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadPatients();
    }
  }

  onNextPage(): void {
    if (this.hasMore) {
      this.currentPage++;
      this.loadPatients();
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

  formatCpf(document: string): string {
    return maskCpf(document);
  }
}


import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ExamService, Exam } from '../../../core/services/exam.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { TooltipComponent } from '../../../shared/components/tooltip/tooltip.component';

@Component({
  selector: 'app-exam-list',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingComponent, ErrorMessageComponent, TooltipComponent],
  templateUrl: './exam-list.component.html',
  styleUrl: './exam-list.component.css'
})
export class ExamListComponent implements OnInit {
  exams: Exam[] = [];
  loading = false;
  error: string | null = null;
  currentPage = 1;
  pageSize = 10;
  hasMore = true;

  constructor(private examService: ExamService) {}

  ngOnInit(): void {
    this.loadExams();
  }

  loadExams(): void {
    this.loading = true;
    this.error = null;

    this.examService.findAll(this.currentPage, this.pageSize).subscribe({
      next: (data) => {
        this.exams = data;
        this.hasMore = data.length === this.pageSize;
        this.loading = false;
      },
      error: (err) => {
        this.handleError(err);
        this.loading = false;
      }
    });
  }

  truncateText(text: string | undefined, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength
      ? text.slice(0, maxLength) + '...'
      : text;
  }

  handleError(error: any): void {
    if (error.status === 0 || error.name === 'HttpErrorResponse') {
      this.error = 'Erro de conexão. Verifique se o servidor está rodando.';
    } else {
      this.error = error.error?.message || 'Erro ao carregar exames.';
    }
  }

  onRetry(): void {
    this.loadExams();
  }

  onPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadExams();
    }
  }

  onNextPage(): void {
    if (this.hasMore) {
      this.currentPage++;
      this.loadExams();
    }
  }

  onPageSizeChange(value: string): void {
    const size = Number(value);
    if (!isNaN(size) && size > 0) {
      this.pageSize = size;
      this.currentPage = 1;
      this.loadExams();
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
  }
}


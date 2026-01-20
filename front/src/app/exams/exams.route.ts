import { Routes } from '@angular/router';
import { ExamCreate } from './components/exam-create/exam-create';
import { ExamListComponent } from './components/exam-list/exam-list.component';

export const EXAMS_ROUTES: Routes = [
  {
    path: '',
    component: ExamListComponent,
  },
  {
    path: 'new',
    component: ExamCreate,
    data: { animation: 'CreatePage' },
  },
];

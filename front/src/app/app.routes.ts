import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'patients',
    loadChildren: () =>
      import('./patients/patients.routes').then((m) => m.PATIENTS_ROUTES),
    data: { animation: 'PatientsPage' },
  },
  {
    path: 'exams',
    loadChildren: () =>
      import('./exams/exams.route').then((m) => m.EXAMS_ROUTES),
  },
];

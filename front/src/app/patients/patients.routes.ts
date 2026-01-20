import { Routes } from '@angular/router';
import { PatientListComponent } from './components/patient-list/patient-list.component';
import { PatientCreateComponent } from './components/patient-create/patient-create.component';

export const PATIENTS_ROUTES: Routes = [
  {
    path: '',
    component: PatientListComponent,
  },
  {
    path: 'new',
    component: PatientCreateComponent,
  },
];


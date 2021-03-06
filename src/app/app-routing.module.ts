import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

import { RootComponent } from './root/root.component';
import { AuthGuard } from './auth/auth-guard.service';
import { profileRoutes } from './profile/profile-routing.module';
import { companiesRoutes } from './companies/companies-routing.module';
import { vacanciesRoutes } from './vacancies/vacancies-routing.module';
import { interviewsRoutes } from './interviews/interviews-routing.module';
import { employeesRoutes } from './employees/employees-routing.module';
import { resumesRoutes } from './resumes/resumes-routing.module';
import { feedbacksRoutes } from './feedbacks/feedbacks-routing.module';

export const appRoutes: Routes = [
  { path: '', component: RootComponent, canActivate: [AuthGuard], children: [
    { path: '', redirectTo: 'companies', pathMatch: 'full' },
    { path: 'companies', children: [...companiesRoutes] },
    { path: 'companies/:companyId/vacancies', children: [...vacanciesRoutes] },
    { path: 'companies/:companyId/interviews', children: [...interviewsRoutes] },
    { path: 'companies/:companyId/employees', children: [...employeesRoutes] },
    { path: 'users', children: [...profileRoutes] },
    { path: 'resumes', children: [...resumesRoutes] },
    { path: 'feedbacks', children: [...feedbacksRoutes] }
  ]}
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {

}

import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { CompaniesComponent } from './companies/companies.component';
import { VacanciesComponent } from './vacancies/vacancies.component';
import { RootComponent } from './root/root.component';
import { AuthGuard } from './auth/auth-guard.service';

export const appRoutes: Routes = [
  { path: '', component: RootComponent, canActivate: [AuthGuard], children: [
    { path: '', redirectTo: 'companies', pathMatch: 'full' },
    { path: 'companies', component: CompaniesComponent },
    { path: 'vacancies', component: VacanciesComponent },
    { path: 'users', loadChildren: './profile/profile.module#ProfileModule' }
  ]}
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {

}

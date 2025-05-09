import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ServiceComponent } from './pages/service/service.component';
import { AboutUsComponent } from './pages/about-us/about-us.component';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CreateAccountComponent } from './pages/create-account/create-account.component';
import { SidebarComponent } from './pages/sidebar/sidebar.component';
import { ListuserComponent } from './pages/listuser/listuser.component';
import { EditprofilComponent } from './pages/editprofil/editprofil.component';


const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'services', component: ServiceComponent },
  { path: 'about', component: AboutUsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  //{ path: 'dashboard', component: DashboardComponent },
  { path: 'create-account', component: CreateAccountComponent },
  { path: 'list-user', component: ListuserComponent },
  { path: 'editprofil', component: EditprofilComponent },

  { path: '**', redirectTo: '' },
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
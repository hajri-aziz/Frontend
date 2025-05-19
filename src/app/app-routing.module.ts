import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ServiceComponent } from './pages/service/service.component';
import { AboutUsComponent } from './pages/about-us/about-us.component';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CreateAccountComponent } from './pages/create-account/create-account.component';
import { SocialFeedComponent } from './pages/social-feed/social-feed.component';
import { RendzInscriComponent } from './pages/rendz-inscri/rendz-inscri.component';
import { SidebarComponent } from './pages/sidebar/sidebar.component';
import { ListuserComponent } from './pages/listuser/listuser.component';
import { DispEventComponent } from './pages/disp-event/disp-event.component';
import { AvailabilityComponent } from './pages/disp-event/availability/availability.component';
import { EventsComponent } from './pages/disp-event/events/events.component';
import { AnalyseGraphiqueComponent } from './pages/disp-event/analyse-graphique/analyse-graphique.component';
import { EditprofilComponent } from './pages/editprofil/editprofil.component';
import { ContactComponent } from './pages/contact/contact.component';
import { VerifyOtpComponent } from './pages/verify-otp/verify-otp.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';

import { CategoryCreateComponent } from './pages/cours-category/category-create/category-create.component';
import { CategoryDetailComponent } from './pages/cours-category/category-detail/category-detail.component';
import { CategoryListComponent } from './pages/cours-category/category-list/category-list.component';
import { CategoryEditComponent } from './pages/cours-category/category-edit/category-edit.component';

import { CoursCreateComponent } from './pages/cours/cours-create/cours-create.component';
import { CoursListComponent } from './pages/cours/cours-list/cours-list.component';
import { CoursEditComponent } from './pages/cours/cours-edit/cours-edit.component';
import { CoursDetailComponent } from './pages/cours/cours-detail/cours-detail.component';
import { NavbarComponent } from './pages/navbar/navbar.component';

import { SessionCoursComponent } from './pages/cours-sessions/session-cours/session-cours.component';
import { SessionFormComponent } from './pages/cours-sessions/session-form/session-form.component';
import { SessionDetailComponent } from './pages/cours-sessions/session-detail/session-detail.component';


import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

import { UnauthorizedComponent } from './pages/unauthorized/unauthorized.component';


const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'services', component: ServiceComponent },
  { path: 'about', component: AboutUsComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'create-account', component: CreateAccountComponent },
  
  { path: 'disp-event', component: DispEventComponent, children: [
    { path: '', redirectTo: 'availability', pathMatch: 'full' },
    { path: 'availability', component: AvailabilityComponent },
    { path: 'events', component: EventsComponent },
    { path: 'dashboard', component: AnalyseGraphiqueComponent },]
  },
  { path: 'rendz-inscri', component: RendzInscriComponent },
  { path: 'list-user', component: ListuserComponent },
  { path: 'editprofil', component: EditprofilComponent },

  { path: 'forget-password', component: ForgotPasswordComponent },
  { path: 'verify-otp', component: VerifyOtpComponent },

  { path: 'forget-password', component: ForgotPasswordComponent },
  { path: 'verify-otp', component: VerifyOtpComponent },

  //CHAT/FORUM 
  { path: 'social-feed', component: SocialFeedComponent },
 


  // 📦 DISP-EVENT avec enfants
  {
    path: 'dispo-event',
    component: DispEventComponent,
    children: [
      { path: '', redirectTo: 'availability', pathMatch: 'full' },
      { path: 'availability', component: AvailabilityComponent },
      { path: 'events', component: EventsComponent },
      { path: 'dashboard', component: AnalyseGraphiqueComponent }
    ]
  },

  // 📁 Cours - Catégories
  { path: 'categories', component: CategoryListComponent },
  { path: 'categories/create', component: CategoryCreateComponent },
  { path: 'categories/edit/:id', component: CategoryEditComponent },
  { path: 'categories/:id', component: CategoryDetailComponent },

  // 🆕 Cours
  { path: 'cours', component: CoursListComponent },
  { path: 'cours/create', component: CoursCreateComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'cours/edit/:id', component: CoursEditComponent, canActivate: [AuthGuard, AdminGuard]  },
  { path: 'cours/:id', component: CoursDetailComponent },
  { path: 'cours/detail/:id', component: CoursDetailComponent },
  
  //cours session
   {path: 'cours/:coursId/sessions',component: SessionCoursComponent,canActivate: [AuthGuard]},
   {path: 'cours/:coursId/sessions/new',component: SessionFormComponent,canActivate: [AuthGuard],data: { roles: ['instructor', 'admin'] }},
   {path: 'sessions/:id/edit',component: SessionFormComponent,canActivate: [AuthGuard],data: { roles: ['instructor', 'admin'] }},
   {path: 'sessions/:id',component: SessionDetailComponent,canActivate: [AuthGuard]},

  // Redirection si aucune route ne correspond
  { path: 'navbar', component: NavbarComponent },

  { path: 'unauthorized', component: UnauthorizedComponent },

  // Redirection en cas d'URL inconnue
  { path: '**', redirectTo: '' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

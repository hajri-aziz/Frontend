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
import { CategoryCreateComponent } from './pages/cours-category/category-create/category-create.component'; // ✅ Ajout ici
import { CategoryDetailComponent } from './pages/cours-category/category-detail/category-detail.component'; // ✅
import { CategoryListComponent } from './pages/cours-category/category-list/category-list.component'; // ✅
import { CategoryEditComponent } from './pages/cours-category/category-edit/category-edit.component'; // ✅
import { NavbarComponent } from './pages/navbar/navbar.component';
import { EditprofilComponent } from './pages/editprofil/editprofil.component';
import { ContactComponent } from './pages/contact/contact.component';

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
  { path: 'social-feed', component: SocialFeedComponent },
  { path: 'disp-event', component: DispEventComponent, children: [
    { path: '', redirectTo: 'availability', pathMatch: 'full' },
    { path: 'availability', component: AvailabilityComponent },
    { path: 'events', component: EventsComponent },
    { path: 'dashboard', component: AnalyseGraphiqueComponent },]
  },
  { path: 'rendz-inscri', component: RendzInscriComponent },
  { path: 'list-user', component: ListuserComponent },
  { path: 'editprofil', component: EditprofilComponent },
  // 📦 DISP-EVENT avec enfants

  { path: 'categories/create', component: CategoryCreateComponent },
  { path: 'categories/:id', component: CategoryDetailComponent }, 
  { path: 'categories', component: CategoryListComponent },
  { path: 'categories/edit/:id', component: CategoryEditComponent },
  { path: 'navbar', component: NavbarComponent },

  // Redirection en cas d'URL inconnue
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

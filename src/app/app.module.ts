import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';

// 📦 Composants généraux
import { HomeComponent } from './pages/home/home.component';
import { ServiceComponent } from './pages/service/service.component';
import { AboutUsComponent } from './pages/about-us/about-us.component';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CreateAccountComponent } from './pages/create-account/create-account.component';
import { SocialFeedComponent } from './pages/social-feed/social-feed.component';
import { SidebarComponent } from './pages/sidebar/sidebar.component';
import { EditprofilComponent } from './pages/editprofil/editprofil.component';
import { ListuserComponent } from './pages/listuser/listuser.component';
import { RendzInscriComponent } from './pages/rendz-inscri/rendz-inscri.component';

// 📊 Gestion événements
import { AvailabilityComponent } from './pages/disp-event/availability/availability.component';
import { EventsComponent } from './pages/disp-event/events/events.component';
import { AnalyseGraphiqueComponent } from './pages/disp-event/analyse-graphique/analyse-graphique.component';

// 🧑‍💻 Dialogues
import { EditUserDialogComponent } from './pages/edit-user-dialog/edit-user-dialog.component';
import { DeleteConfirmationDialogComponent } from './pages/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { NavbarComponent } from './pages/navbar/navbar.component';

// 🎓 Cours
import { CoursListComponent } from './pages/cours/cours-list/cours-list.component';
import { CoursCreateComponent } from './pages/cours/cours-create/cours-create.component';
import { CoursEditComponent } from './pages/cours/cours-edit/cours-edit.component';
import { CoursDetailComponent } from './pages/cours/cours-detail/cours-detail.component';

// 📚 Catégories
import { CategoryListComponent } from './pages/cours-category/category-list/category-list.component';
import { CategoryCreateComponent } from './pages/cours-category/category-create/category-create.component';
import { CategoryEditComponent } from './pages/cours-category/category-edit/category-edit.component';
import { CategoryDetailComponent } from './pages/cours-category/category-detail/category-detail.component';

// 🕒 Sessions
import { SessionListComponent } from './pages/cours-session/session-list/session-list.component';
import { SessionCreateComponent } from './pages/cours-session/session-create/session-create.component';
import { SessionEditComponent } from './pages/cours-session/session-edit/session-edit.component';
import { SessionDetailComponent } from './pages/cours-session/session-detail/session-detail.component';
import { DispEventComponent } from './pages/disp-event/disp-event.component';
import { ContactComponent } from './pages/contact/contact.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ServiceComponent,
    AboutUsComponent,
    LoginComponent,
    SignupComponent,
    DashboardComponent,
    CreateAccountComponent,
    SocialFeedComponent,
    SidebarComponent,
    EditprofilComponent,
    ListuserComponent,
    RendzInscriComponent,
    DispEventComponent,
    AvailabilityComponent,
    EventsComponent,
    AnalyseGraphiqueComponent,
    EditUserDialogComponent,
    DeleteConfirmationDialogComponent,
    CoursListComponent,
    CoursCreateComponent,
    CoursEditComponent,
    CoursDetailComponent,
    CategoryListComponent,
    CategoryCreateComponent,
    CategoryEditComponent,
    CategoryDetailComponent,
    SessionListComponent,
    SessionCreateComponent,
    SessionEditComponent,
    SessionDetailComponent,
    NavbarComponent,
    ContactComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    FormsModule, 
    FormsModule, 
    MatDialogModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}

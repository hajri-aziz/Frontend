import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { Chart } from 'chart.js/auto';
import { PickerModule } from '@ctrl/ngx-emoji-mart';





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

import { AdminGuard } from './guards/admin.guard';

// 📚 Catégories
import { CategoryListComponent } from './pages/cours-category/category-list/category-list.component';
import { CategoryCreateComponent } from './pages/cours-category/category-create/category-create.component';
import { CategoryEditComponent } from './pages/cours-category/category-edit/category-edit.component';
import { CategoryDetailComponent } from './pages/cours-category/category-detail/category-detail.component';

// 🕒 Sessions cours 

import { CoursSessionService } from './services/cours-session.service';
import { SessionDetailComponent } from './pages/cours-sessions/session-detail/session-detail.component';
import { SessionFormComponent } from './pages/cours-sessions/session-form/session-form.component';
import { SessionCoursComponent } from './pages/cours-sessions/session-cours/session-cours.component';





import { DispEventComponent } from './pages/disp-event/disp-event.component';
import { ContactComponent } from './pages/contact/contact.component';
import { VerifyOtpComponent } from './pages/verify-otp/verify-otp.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { UnauthorizedComponent } from './pages/unauthorized/unauthorized.component';
import { SessionCalendarComponent } from './pages/session-calendar/session-calendar.component';
import { DashboardCoursComponent } from './pages/dashboard-cours/dashboard-cours.component';
import { MessagesComponent } from './pages/messages/messages.component';
import { ToastComponent } from './pages/toast/toast.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SessionLoginComponent } from './pages/session-login/session-login.component';
import { SessionPlayComponent } from './pages/session-play/session-play.component';
import { SafeUrlPipe } from './pipes/safe-url.pipe';







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
    DispEventComponent,
    RendzInscriComponent,
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
    SessionDetailComponent,
    SessionCoursComponent,
    SessionFormComponent,
    
    NavbarComponent,
    ContactComponent,
    ForgotPasswordComponent,
    VerifyOtpComponent,

    UnauthorizedComponent,
    SessionCalendarComponent,
    DashboardCoursComponent,
    MessagesComponent,
    ToastComponent,
    SessionLoginComponent,
    SessionPlayComponent,
    SafeUrlPipe,
  ],
 
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
    MatDialogModule,
    BrowserAnimationsModule,
    PickerModule,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

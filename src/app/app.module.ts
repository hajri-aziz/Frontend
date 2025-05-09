import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { ServiceComponent } from './pages/service/service.component';
import { AboutUsComponent } from './pages/about-us/about-us.component';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CreateAccountComponent } from './pages/create-account/create-account.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from './pages/sidebar/sidebar.component';
import { ListuserComponent } from './pages/listuser/listuser.component';
import { EditUserDialogComponent } from './pages/edit-user-dialog/edit-user-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { DeleteConfirmationDialogComponent } from './pages/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { EditprofilComponent } from './pages/editprofil/editprofil.component';


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
    SidebarComponent,
    ListuserComponent,
    EditUserDialogComponent,
    DeleteConfirmationDialogComponent,
    EditprofilComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule, 
       MatDialogModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
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
import { SocialFeedComponent } from './pages/social-feed/social-feed.component';
import { DispEventComponent } from './pages/disp-event/disp-event.component';
import { HttpClientModule } from '@angular/common/http';
import { RendzInscriComponent } from './pages/rendz-inscri/rendz-inscri.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from './pages/sidebar/sidebar.component';
import { ListuserComponent } from './pages/listuser/listuser.component';


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
    DispEventComponent,
    RendzInscriComponent,
    SidebarComponent,
    ListuserComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
      FormsModule, 
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
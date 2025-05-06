import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  constructor(private router: Router) {}

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
  
  navigatechat() {
    this.router.navigate(['/social-feed']);
  }
  navigate() {
    this.router.navigate(['/dispo-event']);
  }
  navigate1() {
    this.router.navigate(['/rendz-inscri']);
  }
 
}

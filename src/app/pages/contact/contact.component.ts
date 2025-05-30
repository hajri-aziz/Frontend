import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DisponibiliteService, Message } from 'src/app/services/disponibilite.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  isMobileMenuOpen = false;
  message: Message = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private router: Router,
    private disponibiliteService: DisponibiliteService
  ) {}

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  onSubmit() {
    this.successMessage = null;
    this.errorMessage = null;

    this.disponibiliteService.createMessage(this.message).subscribe({
      next: (response) => {
        this.successMessage = 'Votre message a été envoyé avec succès !';
        this.message = { name: '', email: '', subject: '', message: '' }; // Reset form
      },
      error: (error) => {
        this.errorMessage = 'Une erreur s\'est produite lors de l\'envoi du message. Veuillez réessayer.';
        console.error('Erreur:', error);
      }
    });
  }
}
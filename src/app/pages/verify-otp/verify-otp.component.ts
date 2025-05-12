import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';


@Component({
  selector: 'app-verify-otp',
  templateUrl: './verify-otp.component.html',
})
export class VerifyOtpComponent implements OnInit, OnDestroy {
  otp: string = '';
  newPassword: string = '';
  email: string = '';
  isLoading: boolean = false;
  countdown: number = 300; // 5 minutes
  countdownDisplay: string = '05:00';
  private countdownInterval: any;

  constructor(
    private router: Router,
    private userService: UserService,
    
  ) {}

  ngOnInit(): void {
    this.email = history.state?.email;
    if (!this.email) {
      console.log('Email non trouvé');
      this.router.navigate(['/forgot-password']);
      return;
    }
    this.startCountdown();
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  private startCountdown(): void {
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      const minutes = Math.floor(this.countdown / 60);
      const seconds = this.countdown % 60;
      this.countdownDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      if (this.countdown <= 0) {
        clearInterval(this.countdownInterval);
        console.log('Le code OTP a expiré');
      }
    }, 1000);
  }
  verifyOtp(): void {
    // Vérifier que les champs sont remplis
    if (!this.otp || !this.newPassword) {
        alert('Veuillez remplir tous les champs');
        return;
    }

    this.isLoading = true;
    
    const requestData = {
        email: this.email,
        otp: this.otp,
        newPassword: this.newPassword
    };

    this.userService.verifyOtp(requestData).subscribe({
        next: () => {
            this.isLoading = false;
            alert('Mot de passe changé avec succès!');
            this.router.navigate(['/login']);
        },
        error: (err) => {
            this.isLoading = false;
            // Afficher un message d'erreur compréhensible
            alert(err.error?.message || 'Erreur lors de la vérification');
        }
    });
}
  resendOtp(): void {
    this.isLoading = true;
    this.userService.forgotPassword(this.email).subscribe({
      next: () => {
        this.isLoading = false;
        console.log('Nouveau code envoyé');
        this.countdown = 300;
        this.startCountdown();
      },
      error: (err) => {
        this.isLoading = false;
        console.log('Erreur lors de l\'envoi du nouveau code');
      }
    });
  }
}
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CoursService } from '../../../services/cours.service';
import { CoursSessionService } from '../../../services/cours-session.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-session-detail',
  templateUrl: './session-detail.component.html',
  styleUrls: ['./session-detail.component.scss']
})
export class SessionDetailComponent implements OnInit {
    cours: any = {};
    sessions: any[] = [];
    session: any = null;
    isLoading = true;
    isInstructor = false;
    userId: string | null = null;
    sessionId: string = '';
    error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private coursService: CoursService,
    private sessionService: CoursSessionService,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.sessionId = this.route.snapshot.paramMap.get('id') || '';
    this.userId = this.getUserIdFromToken();
    this.isInstructor = this.userService.getUserRole() === 'instructor' || 
                        this.userService.getUserRole() === 'admin';

    if (this.sessionId) {
      this.loadSessionDetail(this.sessionId);
    } else {
      this.router.navigate(['/cours']);
    }
  }

  loadSessionDetail(id: string): void {
    this.isLoading = true;
    this.error = null;
    
    this.sessionService.getSessionById(id).subscribe({
      next: (data) => {
        this.session = data;
        this.loadCoursDetails(data.cours_id);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement de la session', err);
        this.error = 'Impossible de charger les détails de la session';
        this.isLoading = false;
      }
    });
  }

  private getUserIdFromToken(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || null;
    } catch (e) {
      console.error('Error decoding token', e);
      return null;
    }
  }

  loadCoursDetails(coursId: string): void {
    const resolvedCoursId = typeof this.session.cours_id === 'string'
      ? this.session.cours_id
      : this.session.cours_id?._id;

     this.coursService.getCoursById(resolvedCoursId).subscribe({
      next: (data) => {
        this.cours = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement du cours', err);
        this.error = 'Impossible de charger les détails du cours associé';
      }
    });
  }

  isRegistered(): boolean {
    if (!this.userId || !this.session) return false;
    return this.session.participants.some((p: any) => p.user_id === this.userId);
  }

  registerToSession(): void {
    if (!this.userId) {
      alert('Vous devez être connecté pour vous inscrire');
      return;
    }

    if (!this.sessionId) return;

    this.sessionService.inscrireUtilisateur(this.sessionId, this.userId).subscribe({
      next: () => {
        this.loadSessionDetail(this.sessionId); // Recharger les détails
      },
      error: (err) => {
        console.error('Erreur lors de l\'inscription', err);
        this.error = 'Erreur lors de l\'inscription à la session';
      }
    });
  }

  cancelRegistration(): void {
    if (!this.userId || !this.sessionId) return;

    this.sessionService.annulerInscription(this.sessionId, this.userId).subscribe({
      next: () => {
        this.loadSessionDetail(this.sessionId); // Recharger les détails
      },
      error: (err) => {
        console.error('Erreur lors de l\'annulation', err);
        this.error = 'Erreur lors de l\'annulation de l\'inscription';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/cours', this.cours._id]);
  }

  editSession(): void {
    if (this.sessionId) {
      this.router.navigate(['/sessions', this.sessionId, 'edit']);
    }
  }

  deleteSession(): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette session ?')) {
      this.sessionService.deleteSession(this.sessionId).subscribe({
        next: () => {
          this.router.navigate(['/cours', this.cours._id]);
        },
        error: (err) => {
          console.error('Erreur lors de la suppression', err);
          this.error = 'Erreur lors de la suppression de la session';
        }
      });
    }
  }
    goToCalendar(): void {
    this.router.navigate(['/sessions/calendar']);
  }
}
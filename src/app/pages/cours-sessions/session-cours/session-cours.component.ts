import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CoursSessionService } from '../../../services/cours-session.service';

@Component({
  selector: 'app-session-cours',
  templateUrl: './session-cours.component.html',
  styleUrls: ['./session-cours.component.scss']
})
export class SessionCoursComponent implements OnInit {

  coursId!: string;
  sessions: any[] = [];
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sessionService: CoursSessionService
  ) {}

  ngOnInit(): void {
    this.coursId = this.route.snapshot.paramMap.get('coursId') || '';
    if (!this.coursId) {
      console.error("⚠️ coursId manquant dans l'URL");
      this.router.navigate(['/cours']);
      return;
    }

    this.loadSessions();
  }

  loadSessions(): void {
    this.isLoading = true;
    this.sessionService.getSessionsByCours(this.coursId).subscribe(
      (data) => {
        this.sessions = data || [];
        this.isLoading = false;
      },
      (error) => {
        console.error('Erreur lors du chargement des sessions', error);
        this.isLoading = false;
      }
    );
  }

  deleteSession(sessionId: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette session ?')) {
      this.sessionService.deleteSession(sessionId).subscribe(
        () => {
          this.sessions = this.sessions.filter(s => s._id !== sessionId);
        },
        (error) => {
          console.error('Erreur lors de la suppression', error);
        }
      );
    }
  }

  // 🔄 Retour au détail du cours
  goBackToCours(): void {
    this.router.navigate(['/cours', this.coursId]);
  }

  // 📅 Sessions triées par date de début
  sortedSessions(): any[] {
    return this.sessions.sort((a, b) =>
      new Date(a.startdate).getTime() - new Date(b.startdate).getTime()
    );
  }

  // ⏳ Sessions à venir et passées
  getSessionsByStatus(): { upcoming: any[], past: any[] } {
    const now = new Date();
    return {
      upcoming: this.sessions
        .filter(s => new Date(s.startdate) > now)
        .sort((a, b) => new Date(a.startdate).getTime() - new Date(b.startdate).getTime()),

      past: this.sessions
        .filter(s => new Date(s.startdate) <= now)
        .sort((a, b) => new Date(b.startdate).getTime() - new Date(a.startdate).getTime())
    };
  }
}
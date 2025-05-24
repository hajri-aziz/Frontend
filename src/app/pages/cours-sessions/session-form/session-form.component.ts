// src/app/pages/cours-sessions/session-form/session-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CoursSessionService } from '../../../services/cours-session.service';

@Component({
  selector: 'app-session-form',
  templateUrl: './session-form.component.html',
  styleUrls: ['./session-form.component.scss']
})
export class SessionFormComponent implements OnInit {
  sessionForm!: FormGroup;
  isEditMode = false;
  sessionId: string = '';
  coursId: string = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private sessionService: CoursSessionService
  ) {}

  ngOnInit(): void {
    this.sessionId = this.route.snapshot.paramMap.get('id') || '';
    this.coursId = this.route.snapshot.paramMap.get('coursId') || '';

    if (!this.sessionId && !this.coursId) {
      console.warn('coursId param is missing in the route');
      this.router.navigate(['/cours']);
      return;
    }

    this.initForm();

    if (this.sessionId) {
      this.isEditMode = true;
      this.loadSessionData();
    }
  }

  initForm(): void {
    this.sessionForm = this.fb.group({
      title: ['', Validators.required],
      cours_id: [this.coursId, Validators.required],
      video_url: ['', Validators.required],
      duration: this.fb.group({
        amount: [1, [Validators.required, Validators.min(1)]],
        unit: ['minutes']
      }),
      startdate: ['', Validators.required],
      enddate: ['', Validators.required],
      location: ['', Validators.required],
      capacity: [1, [Validators.required, Validators.min(1)]],
      status: ['scheduled', Validators.required]
    });
  }

  loadSessionData(): void {
    this.sessionService.getSessionById(this.sessionId).subscribe(
      (session) => {
        this.coursId = typeof session.cours_id === 'object' ? session.cours_id._id : session.cours_id;

        this.sessionForm.patchValue({
          title: session.title,
          cours_id: this.coursId,
          video_url: session.video_url,
          duration: {
            amount: session.duration.amount,
            unit: session.duration.unit
          },
          startdate: this.toLocalDatetime(session.startdate),
          enddate: this.toLocalDatetime(session.enddate),
          location: session.location,
          capacity: session.capacity,
          status: session.status
        });
      },
      (error) => {
        console.error('Erreur lors du chargement de la session', error);
      }
    );
  }

  private toLocalDatetime(dateStr: string): string {
    return new Date(dateStr).toISOString().slice(0, 16);
  }

  onSubmit(): void {
    if (this.sessionForm.invalid) {
      console.error('❌ Formulaire invalide:', this.sessionForm.errors);
      return;
    }

    const raw = this.sessionForm.value;
    
    // 🔧 Récupération du user_id depuis le token décodé
    const token = localStorage.getItem('token');
    let userId = null;
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.id; // Le token contient "id", pas "user_id"
        console.log('🚀 User ID extrait du token:', userId);
      } catch (error) {
        console.error('❌ Erreur décodage token:', error);
      }
    }

    // 🔧 Construction du payload correct
    const payload = {
      title: raw.title,
      cours_id: this.coursId, // ✅ Utiliser this.coursId directement
      user_id: userId, // ✅ ID utilisateur depuis le token
      video_url: raw.video_url,
      duration: {
        amount: Number(raw.duration.amount),
        unit: raw.duration.unit.toLowerCase()
      },
      startdate: new Date(raw.startdate).toISOString(),
      enddate: new Date(raw.enddate).toISOString(),
      location: raw.location,
      capacity: Number(raw.capacity), // ✅ Correction de la faute de frappe
      status: raw.status
    };

    console.log('✅ Payload final envoyé:', payload);

    // 🔧 Validation côté client
    const requiredFields = ['title', 'cours_id', 'user_id', 'video_url', 'startdate', 'enddate', 'location', 'capacity', 'status'];
    const missingFields = requiredFields.filter(field => !(payload as any)[field]);
    
    if (missingFields.length > 0) {
      console.error('❌ Champs manquants:', missingFields);
      alert(`Champs manquants: ${missingFields.join(', ')}`);
      return;
    }

    // 🔧 Validation des durées
    if (!payload.duration?.amount || payload.duration.amount <= 0) {
      console.error('❌ Durée invalide');
      alert('La durée doit être positive');
      return;
    }

    const action$ = this.isEditMode
      ? this.sessionService.updateSession(this.sessionId, payload)
      : this.sessionService.createSession(payload);

    action$.subscribe(
      (response) => {
        console.log('✅ Session créée/modifiée avec succès:', response);
        this.router.navigate(['/cours', this.coursId, 'sessions']);
      },
      (error) => {
        console.error('❌ Erreur lors de la soumission:', error);
        
        // 🔧 Affichage d'erreur plus détaillé
        let errorMessage = 'Erreur inconnue';
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        } else if (error.status === 400) {
          errorMessage = 'Données invalides. Vérifiez tous les champs.';
        } else if (error.status === 401) {
          errorMessage = 'Vous devez être connecté.';
        } else if (error.status === 403) {
          errorMessage = 'Accès refusé. Droits insuffisants.';
        }
        
        alert('Erreur : ' + errorMessage);
      }
    );
  }
}
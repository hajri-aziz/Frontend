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
        cours_id: this.coursId, // ✅ maintenant c’est un string correct
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
    return new Date(dateStr).toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
  }

onSubmit(): void {
  if (this.sessionForm.invalid) return;

  const raw = this.sessionForm.value;
  const sessionData = this.sessionForm.value;

  // ✅ forcer cours_id au cas où le champ est masqué
  sessionData.cours_id = this.coursId;

  const payload = {
    title: raw.title,
    cours_id: this.coursId,
    video_url: raw.video_url,
    duration: {
      amount: raw.duration.amount,
      unit: raw.duration.unit
    },
    startdate: new Date(raw.startdate).toISOString(),
    enddate: new Date(raw.enddate).toISOString(),
    location: raw.location,
    capacity: raw.capacity,
    status: raw.status
  };

  console.log('✅ Payload envoyé :', payload); // 🔍 DEBUG

  const action$ = this.isEditMode
    ? this.sessionService.updateSession(this.sessionId, sessionData)
    : this.sessionService.createSession(sessionData);

  action$.subscribe(
    () => this.router.navigate(['/cours', this.coursId, 'sessions']),
    (error) => {
      console.error('Erreur lors de la soumission du formulaire', error);
      alert('Erreur : ' + error.message || 'Échec lors de la mise à jour');
    }
  );
}



}

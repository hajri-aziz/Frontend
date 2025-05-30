import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { Evenement } from 'src/app/models/evenement.model';
import { EvenementService } from 'src/app/services/evenement.service';

// Custom validator for 24-hour format (HH:MM)
function time24hValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;
    if (!value) return null;
    const pattern = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    return pattern.test(value) ? null : { invalidTime: true };
  };
}

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent implements OnInit {
  eventForm: FormGroup;
  evenements: Evenement[] = [];
  errorMessage: string | null = null;
  hours: number[] = Array.from({ length: 24 }, (_, i) => i); // 00 to 23
  minutes: number[] = Array.from({ length: 60 }, (_, i) => i); // 00 to 59
  showEventTimePicker: boolean = false;

  constructor(
    private fb: FormBuilder,
    private evenementService: EvenementService
  ) {
    this.eventForm = this.fb.group({
      titre: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      date: ['', Validators.required],
      heure_debut: ['', [Validators.required, time24hValidator()]],
      duree: [60, [Validators.required, Validators.min(15)]],
      capacite: [10, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.loadEvenements();
  }

  loadEvenements(): void {
    this.evenementService.getAllEvenements().subscribe({
      next: (data) => {
        this.evenements = data;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des événements';
        console.error(error);
      }
    });
  }

  // Helper to extract hour from HH:MM string
  getHourFromTime(time: string): number | null {
    if (!time || !time.includes(':')) return null;
    return parseInt(time.split(':')[0], 10);
  }

  // Helper to extract minute from HH:MM string
  getMinuteFromTime(time: string): number | null {
    if (!time || !time.includes(':')) return null;
    return parseInt(time.split(':')[1], 10);
  }

  // Select hour for event time
  selectEventHour(hour: number): void {
    const currentTime = this.eventForm.get('heure_debut')?.value || '00:00';
    const minute = this.getMinuteFromTime(currentTime) || 0;
    const newTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    this.eventForm.get('heure_debut')?.setValue(newTime);
  }

  // Select minute for event time
  selectEventMinute(minute: number): void {
    const currentTime = this.eventForm.get('heure_debut')?.value || '00:00';
    const hour = this.getHourFromTime(currentTime) || 0;
    const newTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    this.eventForm.get('heure_debut')?.setValue(newTime);
    this.showEventTimePicker = false; // Close picker after selecting minute
  }

  // Hide time picker with a slight delay to allow click events to fire
  hideTimePickerWithDelay(type: 'event'): void {
    setTimeout(() => {
      this.showEventTimePicker = false;
    }, 150);
  }

  submitEvent(): void {
    if (this.eventForm.valid) {
      const formData = this.eventForm.value;
      const payload: Partial<Evenement> = {
        titre: formData.titre,
        description: formData.description,
        date: new Date(formData.date).toISOString(),
        heure_debut: formData.heure_debut,
        duree: formData.duree,
        capacite: formData.capacite
      };

      this.evenementService.addEvenement(payload).subscribe({
        next: (response) => {
          this.evenements.push(response.evenement);
          this.eventForm.reset({
            titre: '',
            description: '',
            date: '',
            heure_debut: '',
            duree: 60,
            capacite: 10
          });
          alert('Événement créé avec succès');
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la création de l\'événement';
          console.error(error);
          alert('Erreur lors de la création de l\'événement');
        }
      });
    }
  }
}
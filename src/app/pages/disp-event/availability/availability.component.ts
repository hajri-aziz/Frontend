import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { Disponibilite } from 'src/app/models/disponibilite.model';
import { DisponibiliteService } from 'src/app/services/disponibilite.service';

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
  selector: 'app-availability',
  templateUrl: './availability.component.html',
  styleUrls: ['./availability.component.scss']
})
export class AvailabilityComponent implements OnInit {
  availabilityForm: FormGroup;
  disponibilites: Disponibilite[] = [];
  errorMessage: string | null = null;
  hours: number[] = Array.from({ length: 24 }, (_, i) => i); // 00 to 23
  minutes: number[] = Array.from({ length: 60 }, (_, i) => i); // 00 to 59
  showStartTimePicker: boolean = false;
  showEndTimePicker: boolean = false;

  constructor(
    private fb: FormBuilder,
    private disponibiliteService: DisponibiliteService
  ) {
    this.availabilityForm = this.fb.group({
      date: ['', Validators.required],
      heure_debut: ['', [Validators.required, time24hValidator()]],
      heure_fin: ['', [Validators.required, time24hValidator()]],
      statut: ['disponible', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadDisponibilites();
  }

  loadDisponibilites(): void {
    this.disponibiliteService.getAllDisponibilites().subscribe({
      next: (data) => {
        this.disponibilites = data;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des disponibilités';
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

  // Select hour for start time
  selectStartHour(hour: number): void {
    const currentTime = this.availabilityForm.get('heure_debut')?.value || '00:00';
    const minute = this.getMinuteFromTime(currentTime) || 0;
    const newTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    this.availabilityForm.get('heure_debut')?.setValue(newTime);
  }

  // Select minute for start time
  selectStartMinute(minute: number): void {
    const currentTime = this.availabilityForm.get('heure_debut')?.value || '00:00';
    const hour = this.getHourFromTime(currentTime) || 0;
    const newTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    this.availabilityForm.get('heure_debut')?.setValue(newTime);
    this.showStartTimePicker = false; // Close picker after selecting minute
  }

  // Select hour for end time
  selectEndHour(hour: number): void {
    const currentTime = this.availabilityForm.get('heure_fin')?.value || '00:00';
    const minute = this.getMinuteFromTime(currentTime) || 0;
    const newTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    this.availabilityForm.get('heure_fin')?.setValue(newTime);
  }

  // Select minute for end time
  selectEndMinute(minute: number): void {
    const currentTime = this.availabilityForm.get('heure_fin')?.value || '00:00';
    const hour = this.getHourFromTime(currentTime) || 0;
    const newTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    this.availabilityForm.get('heure_fin')?.setValue(newTime);
    this.showEndTimePicker = false; // Close picker after selecting minute
  }

  // Hide time picker with a slight delay to allow click events to fire
  hideTimePickerWithDelay(type: 'start' | 'end'): void {
    setTimeout(() => {
      if (type === 'start') {
        this.showStartTimePicker = false;
      } else {
        this.showEndTimePicker = false;
      }
    }, 150);
  }

  submitAvailability(): void {
    if (this.availabilityForm.valid) {
      const formData = this.availabilityForm.value;
      const payload: Partial<Disponibilite> = {
        date: new Date(formData.date).toISOString(),
        heure_debut: formData.heure_debut,
        heure_fin: formData.heure_fin,
        statut: formData.statut
      };

      this.disponibiliteService.addDisponibilite(payload).subscribe({
        next: (response) => {
          this.disponibilites.push(response.disponibilite);
          this.availabilityForm.reset({
            date: '',
            heure_debut: '',
            heure_fin: '',
            statut: 'disponible'
          });
          alert('Disponibilité ajoutée avec succès');
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de l\'ajout de la disponibilité';
          console.error(error);
          alert('Erreur lors de l\'ajout de la disponibilité');
        }
      });
    }
  }
}
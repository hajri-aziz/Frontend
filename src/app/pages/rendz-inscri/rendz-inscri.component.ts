import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DisponibiliteService } from '../../services/disponibilite.service';
import { EvenementService } from '../../services/evenement.service';
import { Disponibilite } from '../../models/disponibilite.model';
import { Evenement } from '../../models/evenement.model';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { RendezVousService } from '../../services/rendezvous.service';

interface CalendarDay {
  date: Date;
  day: number;
  isOtherMonth: boolean;
}

@Component({
  selector: 'app-rendz-inscri',
  templateUrl: './rendz-inscri.component.html',
  styleUrls: ['./rendz-inscri.component.scss']
})
export class RendzInscriComponent implements OnInit {
  activeTab: 'appointments' | 'events' = 'appointments';
  calendarDays: CalendarDay[] = [];
  selectedDate: Date | null = null;
  currentMonthYear: string = '';
  availabilities: Disponibilite[] = [];
  events: Evenement[] = [];
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Modal state
  showAppointmentModal = false;
  selectedSlot: Disponibilite | null = null;
  availableTimes: string[] = [];
  appointmentForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private disponibiliteService: DisponibiliteService,
    private rendezVousService: RendezVousService,
    private evenementService: EvenementService,
    private userService: UserService,
    private router: Router
  ) {
    this.appointmentForm = this.fb.group({
      heure: ['', Validators.required],
      motif: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  ngOnInit(): void {
    this.generateCalendarDays(new Date('2025-05-01'));
    this.loadEvents();
  }

  setActiveTab(tab: 'appointments' | 'events'): void {
    this.activeTab = tab;
    this.errorMessage = null;
    this.successMessage = null;
  }

  generateCalendarDays(date: Date): void {
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay() || 7;
    const daysFromPrevMonth = firstDayOfWeek - 1;

    this.calendarDays = [];

    // Mois précédent
    if (daysFromPrevMonth > 0) {
      const prevMonth = new Date(year, month, 0);
      const prevMonthDays = prevMonth.getDate();
      for (let i = prevMonthDays - daysFromPrevMonth + 1; i <= prevMonthDays; i++) {
        this.calendarDays.push({
          date: new Date(year, month - 1, i),
          day: i,
          isOtherMonth: true
        });
      }
    }

    // Mois actuel
    for (let i = 1; i <= lastDay.getDate(); i++) {
      this.calendarDays.push({
        date: new Date(year, month, i),
        day: i,
        isOtherMonth: false
      });
    }

    // Mois suivant
    const totalDaysNeeded = 42;
    const remainingDays = totalDaysNeeded - this.calendarDays.length;
    for (let i = 1; i <= remainingDays; i++) {
      this.calendarDays.push({
        date: new Date(year, month + 1, i),
        day: i,
        isOtherMonth: true
      });
    }

    this.currentMonthYear = date.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
  }

  previousMonth(): void {
    const currentDate = new Date(this.calendarDays[0].date);
    currentDate.setMonth(currentDate.getMonth() - 1);
    this.generateCalendarDays(currentDate);
    this.selectedDate = null;
    this.availabilities = [];
  }

  nextMonth(): void {
    const currentDate = new Date(this.calendarDays[0].date);
    currentDate.setMonth(currentDate.getMonth() + 1);
    this.generateCalendarDays(currentDate);
    this.selectedDate = null;
    this.availabilities = [];
  }

  selectDate(date: Date): void {
    console.log('Date sélectionnée :', date);
    this.selectedDate = date;
    this.loadAvailabilities(date);
  }

  isSelectedDate(date: Date): boolean {
    if (!this.selectedDate) return false;
    return (
      date.getDate() === this.selectedDate.getDate() &&
      date.getMonth() === this.selectedDate.getMonth() &&
      date.getFullYear() === this.selectedDate.getFullYear()
    );
  }

  loadAvailabilities(date: Date): void {
    const formattedDate = this.formatDate(date);
    console.log('Date formatée envoyée à l\'API :', formattedDate);
    if (!formattedDate) {
      this.errorMessage = 'Date invalide. Veuillez sélectionner une date valide.';
      return;
    }
    this.disponibiliteService.getDisponibilitesByStatut('disponible', formattedDate).subscribe({
      next: (data) => {
        console.log('Disponibilités reçues :', data);
        this.availabilities = data;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Erreur lors du chargement des disponibilités';
        console.error('Erreur API :', error);
        if (error.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  formatDate(date: Date): string {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      console.error('Date invalide passée à formatDate :', date);
      return '';
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  openAppointmentModal(slot: Disponibilite): void {
    console.log('Ouverture de la modale - slot:', slot);
    this.selectedSlot = slot;
    this.showAppointmentModal = true;
    this.generateAvailableTimes(slot.heure_debut, slot.heure_fin);
    console.log('AvailableTimes après génération:', this.availableTimes);
    if (this.availableTimes.length > 0) {
      this.appointmentForm.patchValue({
        heure: this.availableTimes[0]
      });
      console.log('Valeur initiale de heure:', this.availableTimes[0]);
    } else {
      console.error('Aucun créneau horaire disponible pour ce slot');
      this.errorMessage = 'Aucun créneau horaire disponible pour cette période';
    }
  }

  closeAppointmentModal(): void {
    this.showAppointmentModal = false;
    this.selectedSlot = null;
    this.appointmentForm.reset();
  }

  generateAvailableTimes(startTime: string, endTime: string): void {
    console.log('Génération des créneaux horaires - startTime:', startTime, 'endTime:', endTime);
    const times: string[] = [];

    // Vérifier que startTime et endTime sont définis et au bon format
    if (!startTime || !endTime || !startTime.includes(':') || !endTime.includes(':')) {
      console.error('Format d\'heure invalide - startTime:', startTime, 'endTime:', endTime);
      this.availableTimes = [];
      return;
    }

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    // Vérifier que les heures et minutes sont des nombres valides
    if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) {
      console.error('Heures ou minutes invalides - startHour:', startHour, 'startMinute:', startMinute, 'endHour:', endHour, 'endMinute:', endMinute);
      this.availableTimes = [];
      return;
    }

    // Vérifier que l'heure de début est avant l'heure de fin
    if (startHour > endHour || (startHour === endHour && startMinute > endMinute)) {
      console.error('Heure de début après l\'heure de fin - startTime:', startTime, 'endTime:', endTime);
      this.availableTimes = [];
      return;
    }

    let currentHour = startHour;
    let currentMinute = startMinute;

    while (currentHour < endHour || (currentHour === endHour && currentMinute <= endMinute)) {
      times.push(`${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`);
      currentMinute += 30;
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute = 0;
      }
    }

    console.log('Créneaux générés:', times);
    this.availableTimes = times;
  }

  submitAppointment(): void {
    console.log('Soumission du formulaire - appointmentForm:', this.appointmentForm.value, 'valid:', this.appointmentForm.valid);
    console.log('selectedSlot:', this.selectedSlot, 'selectedDate:', this.selectedDate);
    if (this.appointmentForm.valid && this.selectedSlot && this.selectedDate) {
      const formData = this.appointmentForm.value;
      const payload = {
        id_psychologue: this.selectedSlot.id_psychologue._id,
        date: this.formatDate(this.selectedDate),
        heure: formData.heure,
        motif: formData.motif
      };
      console.log('Payload envoyé à l\'API:', payload);

      this.rendezVousService.addRendezVous(payload).subscribe({
        next: (response) => {
          this.successMessage = 'Rendez-vous pris avec succès';
          this.errorMessage = null;
          this.closeAppointmentModal();
          this.loadAvailabilities(this.selectedDate!);
        },
        error: (error) => {
          this.errorMessage = error.message || 'Erreur lors de la prise de rendez-vous';
          this.successMessage = null;
          if (error.status === 401) {
            this.router.navigate(['/login']);
          }
        }
      });
    } else {
      this.errorMessage = 'Formulaire invalide ou informations manquantes';
    }
  }


  loadEvents(): void {
    this.evenementService.getAllEvenements().subscribe({
      next: (data) => {
        console.log('Événements reçus :', data);
        this.events = data;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Erreur lors du chargement des événements';
        console.error('Erreur API événements :', error);
        if (error.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  registerForEvent(event: Evenement): void {
    this.evenementService.inscrireEvenement(event._id!).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.errorMessage = null;
        const index = this.events.findIndex(e => e._id === event._id);
        if (index !== -1) {
          this.events[index] = response.evenement;
        }
      },
      error: (error) => {
        this.errorMessage = error.message || 'Erreur lors de l\'inscription';
        this.successMessage = null;
        if (error.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }
  
  hasAvailabilitiesOnDate(date: Date): boolean {
  return this.availabilities.some(slot => {
    const slotDate = new Date(slot.date); // Assurez-vous que `slot.date` existe
    return slotDate.toDateString() === date.toDateString();
  });
}
}
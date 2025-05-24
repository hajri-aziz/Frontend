import { Component, OnInit } from '@angular/core';
import { CoursSessionService } from '../../services/cours-session.service';
import { BookingService } from '../../services/booking.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-session-calendar',
  templateUrl: './session-calendar.component.html',
  styleUrls: ['./session-calendar.component.scss']
})
export class SessionCalendarComponent implements OnInit {
  calendarDays: any[] = [];
  selectedDate: Date | null = null;
  currentMonthYear: string = '';
  sessions: any[] = [];
  bookings: any[] = [];
  availableTimes: string[] = [];
  selectedTime: string = '';
  userId: string | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private sessionService: CoursSessionService,
    private bookingService: BookingService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userId = localStorage.getItem('userId');
    this.generateCalendar(new Date());
  }

  generateCalendar(date: Date): void {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay() || 7;
    const daysFromPrevMonth = startDay - 1;

    this.calendarDays = [];

    for (let i = daysFromPrevMonth; i > 0; i--) {
      const prevDate = new Date(year, month, 1 - i);
      this.calendarDays.push({ date: prevDate, isOtherMonth: true });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(year, month, i);
      this.calendarDays.push({ date: dayDate, isOtherMonth: false, day: i });
    }

    this.currentMonthYear = date.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
  }

  previousMonth(): void {
    const firstVisibleDay = this.calendarDays[0].date;
    const newDate = new Date(firstVisibleDay);
    newDate.setMonth(newDate.getMonth() - 1);
    this.generateCalendar(newDate);
  }

  nextMonth(): void {
    const firstVisibleDay = this.calendarDays[0].date;
    const newDate = new Date(firstVisibleDay);
    newDate.setMonth(newDate.getMonth() + 1);
    this.generateCalendar(newDate);
  }

  selectDate(date: Date): void {
    this.selectedDate = date;
    this.availableTimes = this.generateAvailableTimes(date);
    const formatted = this.formatDate(date);
    this.sessionService.getAllSessions().subscribe({
      next: (all) => {
        this.sessions = all.filter((s: any) => this.formatDate(new Date(s.startdate)) === formatted);
        this.sessions.forEach((session) => this.loadBookings(session._id));
      },
      error: () => {
        this.errorMessage = 'Erreur lors du chargement des sessions';
      }
    });
  }

  loadBookings(sessionId: string): void {
    this.sessionService.getSessionById(sessionId).subscribe({
      next: (session: any) => {
        this.bookings = this.bookings.concat(
          (session.bookings || []).map((b: any) => ({ ...b, session_id: sessionId }))
        );
      },
      error: () => {
        this.errorMessage = 'Erreur lors du chargement des réservations.';
      }
    });
  }

  generateAvailableTimes(date: Date): string[] {
    const times: string[] = [];
    const startHour = 9;
    const endHour = 17;
    for (let h = startHour; h < endHour; h++) {
      times.push(`${h.toString().padStart(2, '0')}:00`);
      times.push(`${h.toString().padStart(2, '0')}:30`);
    }
    return times;
  }

  isSelectedDate(date: Date): boolean {
    return this.selectedDate?.toDateString() === date.toDateString();
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  isSlotBooked(sessionId: string, date: Date, time: string): boolean {
    return this.bookings.some(
      b => b.session_id === sessionId &&
           new Date(b.date).toDateString() === date.toDateString() &&
           b.time === time
    );
  }

  bookTime(sessionId: string): void {
    if (!this.userId || !this.selectedDate || !this.selectedTime) return;
    const motif = prompt("Quel est le motif de réservation ?") || 'Réservation';
    this.bookingService.bookTimeSlot(
      sessionId,
      this.userId,
      this.formatDate(this.selectedDate),
      this.selectedTime,
      motif
    ).subscribe({
      next: () => {
        this.successMessage = 'Créneau réservé avec succès';
        this.loadBookings(sessionId);
      },
      error: () => this.errorMessage = 'Erreur lors de la réservation'
    });
  }

  registerToSession(sessionId: string): void {
    if (!this.userId) return;
    
    this.sessionService.inscrireUtilisateur(sessionId, this.userId).subscribe({
      next: () => {
        this.successMessage = 'Inscription confirmée';
        this.selectDate(this.selectedDate!);
      },
      error: () => {
        this.errorMessage = 'Erreur lors de l’inscription';
      }
    });
  }

  cancelRegistration(sessionId: string): void {
    if (!this.userId) return;
    this.sessionService.annulerInscription(sessionId, this.userId).subscribe({
      next: () => {
        this.successMessage = 'Inscription annulée';
        this.selectDate(this.selectedDate!);
      },
      error: () => {
        this.errorMessage = 'Erreur lors de l’annulation';
      }
    });
  }

  isRegistered(session: any): boolean {
    return session.participants?.some((p: any) => p.user_id === this.userId);
  }
}

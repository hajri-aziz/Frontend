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
  allSessions: any[] = [];
  bookings: any[] = [];
  availableTimes: string[] = [];
  selectedTime: string = '';
  userId: string | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  
  // Propriétés pour l'admin
  isAdmin: boolean = false;
  allUsers: any[] = []; // For modal (non-admins only)
  allUsersIncludingAdmins: any[] = []; // For all users, including admins, for participant lookup
  selectedUserForRegistration: string = '';
  showUserSelection: boolean = false;
  selectedSessionForRegistration: string = '';
  usersLoaded: boolean = false;

  constructor(
    private sessionService: CoursSessionService,
    private bookingService: BookingService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userId = localStorage.getItem('userId');
    this.checkIfAdmin();
    this.loadAllSessions();
    this.generateCalendar(new Date());
    if (this.isAdmin) {
      this.loadAllUsers();
    } else {
      this.usersLoaded = true; // No need to wait if not admin
    }
  }

  checkIfAdmin(): void {
    const userRole = this.userService.getUserRole();
    this.isAdmin = userRole === 'admin' || userRole === 'Admin';
    console.log('User role:', userRole, 'Is admin:', this.isAdmin); // Debugging
    if (this.isAdmin) {
      this.loadAllUsers();
    }
  }

  loadAllUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (response) => {
        console.log('Réponse brute de l\'API (getAllUsers):', response); // Debug raw response
        let users: any[] = [];
        if (response && typeof response === 'object') {
          if (Array.isArray(response)) {
            users = response;
          } else if (Array.isArray(response.data)) {
            users = response.data;
          } else if (response.users && Array.isArray(response.users)) {
            users = response.users;
          } else {
            console.warn('Structure de réponse inattendue:', response);
            users = [];
          }
        } else {
          console.warn('Réponse non valide:', response);
          users = [];
        }

        // Store all users (including admins) for lookup
        this.allUsersIncludingAdmins = users;

        // Filter out admins for the modal
        this.allUsers = users.filter((user: any) => {
          const isNotAdmin = user.role !== 'admin' && user.role !== 'Admin';
          console.log('Utilisateur:', user, 'Is not admin:', isNotAdmin);
          return isNotAdmin;
        });

        console.log('Utilisateurs filtrés (allUsers):', this.allUsers);
        console.log('Tous les utilisateurs (allUsersIncludingAdmins):', this.allUsersIncludingAdmins);
        if (this.allUsers.length === 0) {
          this.errorMessage = 'Aucun utilisateur disponible pour l\'inscription.';
          this.clearMessages();
        }
        this.usersLoaded = true; // Mark users as loaded
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des utilisateurs (API échouée): ' + (err.message || 'Veuillez vérifier le backend.');
        console.error('Erreur lors du chargement des utilisateurs:', err);
        this.clearMessages();
        this.usersLoaded = true; // Allow UI to proceed even with error
        // Temporary fallback: Use a mock user list if API fails
        this.allUsersIncludingAdmins = [
          { _id: "1", firstname: "Test", lastname: "User", email: "test@esprit.tn", role: "etudiant" },
          // Add more mock users if needed
        ];
        this.allUsers = this.allUsersIncludingAdmins.filter((user: any) => user.role !== 'admin' && user.role !== 'Admin');
      }
    });
  }
getUserFullName(user: any): string {
  // Cas 1 : si user est un objet avec les champs attendus (cas `.populate`)
  if (user && typeof user === 'object') {
    if (user.firstname && user.lastname) {
      return `${user.firstname} ${user.lastname}`;
    }
    if (user.email) {
      return user.email;
    }
    return 'Utilisateur inconnu (incomplet)';
  }

  // Cas 2 : si user est un string (ID non peuplé)
  if (typeof user === 'string' && user.trim() !== '') {
    const foundUser = this.allUsersIncludingAdmins.find(u => u._id === user);
    if (foundUser) {
      if (foundUser.firstname && foundUser.lastname) {
        return `${foundUser.firstname} ${foundUser.lastname}`;
      }
      if (foundUser.email) {
        return foundUser.email;
      }
    }
    // Fallback: tente de charger l'utilisateur si non trouvé
    this.fetchUserById(user);
    return 'Utilisateur inconnu';
  }

  console.warn('❌ Utilisateur invalide:', user);
  return 'Utilisateur inconnu (ID invalide)';
}

  
  // Fallback method to fetch user by ID if not in allUsersIncludingAdmins
  private fetchUserById(userId: string): void {
    // Double-check userId before making the API call
    if (typeof userId !== 'string' || !userId) {
      console.error('Invalid userId passed to fetchUserById:', userId);
      return;
    }

    console.log('Fetching user with ID:', userId); // Debug
    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        if (user && !this.allUsersIncludingAdmins.some(u => u._id === user._id)) {
          this.allUsersIncludingAdmins.push(user);
          console.log('Utilisateur ajouté via fetch:', user);
          // Force UI update by re-selecting the date
          if (this.selectedDate) {
            this.selectDate(this.selectedDate);
          }
        }
      },
      error: (err) => {
        console.error('Erreur lors de la récupération de l\'utilisateur:', err);
      }
    });
  }

  /**
   * Charge toutes les sessions pour pouvoir marquer les dates avec sessions
   */
  loadAllSessions(): void {
    this.sessionService.getAllSessions().subscribe({
      next: (sessions) => {
        // Ensure participants is always an array
        this.allSessions = sessions.map((session: any) => ({
          ...session,
          participants: session.participants || []
        }));
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des sessions';
        console.error('Erreur lors du chargement des sessions:', err);
        this.clearMessages();
      }
    });
  }

  /**
   * Vérifie si une date donnée a des sessions disponibles
   */
  hasSessionOnDate(date: Date): boolean {
    const formatted = this.formatDate(date);
    return this.allSessions.some(session => 
      this.formatDate(new Date(session.startdate)) === formatted
    );
  }

  /**
   * Génère le calendrier pour le mois donné
   */
  generateCalendar(date: Date): void {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay() || 7; // Dimanche = 0, on le convertit en 7
    const daysFromPrevMonth = startDay - 1;

    this.calendarDays = [];

    // Ajouter les jours du mois précédent
    for (let i = daysFromPrevMonth; i > 0; i--) {
      const prevDate = new Date(year, month, 1 - i);
      this.calendarDays.push({ date: prevDate, isOtherMonth: true });
    }

    // Ajouter les jours du mois actuel
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(year, month, i);
      this.calendarDays.push({ date: dayDate, isOtherMonth: false, day: i });
    }

    this.currentMonthYear = date.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
  }

  /**
   * Passe au mois précédent
   */
  previousMonth(): void {
    const firstVisibleDay = this.calendarDays[0].date;
    const newDate = new Date(firstVisibleDay);
    newDate.setMonth(newDate.getMonth() - 1);
    this.generateCalendar(newDate);
  }

  /**
   * Passe au mois suivant
   */
  nextMonth(): void {
    const firstVisibleDay = this.calendarDays[0].date;
    const newDate = new Date(firstVisibleDay);
    newDate.setMonth(newDate.getMonth() + 1);
    this.generateCalendar(newDate);
  }

  /**
   * Sélectionne une date et charge les sessions correspondantes
   */
  selectDate(date: Date): void {
    if (this.isAdmin && !this.usersLoaded) {
      this.errorMessage = 'Chargement des utilisateurs en cours...';
      this.clearMessages();
      return;
    }
    this.selectedDate = date;
    this.availableTimes = this.generateAvailableTimes(date);
    const formatted = this.formatDate(date);
    
    this.sessions = this.allSessions.filter((s: any) => 
      this.formatDate(new Date(s.startdate)) === formatted
    ).map(session => ({
      ...session,
      participants: session.participants || []
    }));
    console.log('Sessions with participants:', this.sessions);
    
    this.bookings = [];
    this.sessions.forEach((session) => this.loadBookings(session._id));
  }

  /**
   * Charge les réservations pour une session donnée
   */
  loadBookings(sessionId: string): void {
    this.sessionService.getSessionById(sessionId).subscribe({
      next: (session: any) => {
        this.bookings = this.bookings.concat(
          (session.bookings || []).map((b: any) => ({ ...b, session_id: sessionId }))
        );
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des réservations.';
        console.error('Erreur lors du chargement des réservations:', err);
        this.clearMessages();
      }
    });
  }

  /**
   * Génère les horaires disponibles pour une date donnée
   */
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

  /**
   * Vérifie si une date est sélectionnée
   */
  isSelectedDate(date: Date): boolean {
    return this.selectedDate?.toDateString() === date.toDateString();
  }

  /**
   * Formate une date en YYYY-MM-DD
   */
  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Vérifie si un créneau est déjà réservé
   */
  isSlotBooked(sessionId: string, date: Date | null, time: string): boolean {
    if (!date) return false; // Avoid errors if date is null
    return this.bookings.some(
      b => b.session_id === sessionId &&
           new Date(b.date).toDateString() === date.toDateString() &&
           b.time === time
    );
  }

  /**
   * Réserve un créneau horaire pour une session
   */
  bookTime(sessionId: string): void {
    if (!this.userId || !this.selectedDate || !this.selectedTime) {
      this.errorMessage = 'Veuillez sélectionner un horaire.';
      this.clearMessages();
      return;
    }
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
        this.clearMessages();
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de la réservation';
        console.error('Erreur lors de la réservation:', err);
        this.clearMessages();
      }
    });
  }

  /**
   * Inscrit l'utilisateur connecté à une session
   */
  registerToSession(sessionId: string): void {
    if (!this.userId) {
      this.errorMessage = 'Utilisateur non connecté.';
      this.clearMessages();
      return;
    }

    const session = this.sessions.find(s => s._id === sessionId);
    if (!session || (session.participants.length >= (session.maxparticipants || session.capacity || 999))) {
      this.errorMessage = 'La session est complète ou introuvable.';
      this.clearMessages();
      return;
    }

    this.sessionService.inscrireUtilisateur(sessionId, this.userId).subscribe({
      next: () => {
        this.successMessage = 'Inscription confirmée';
        this.reloadSessionsAndRefreshView();  // ✅ nouvelle méthode
        this.clearMessages();
      },
      error: (err) => {
        this.errorMessage = `Erreur lors de l'inscription: ${err.error?.message || err.statusText || 'Veuillez réessayer.'}`;
        console.error('Erreur détaillée:', err);
        this.clearMessages();
      }
    });
  }

  /**
   * Ouvre la modal de sélection d'utilisateur pour inscription admin
   */
  openUserSelectionForRegistration(sessionId: string): void {
    this.selectedSessionForRegistration = sessionId;
    this.selectedUserForRegistration = '';
    this.showUserSelection = true;
  }

  /**
   * Inscrit un utilisateur sélectionné à une session (fonction admin)
   */
  registerUserToSessionAsAdmin(): void {
  if (!this.selectedUserForRegistration || !this.selectedSessionForRegistration) {
    this.errorMessage = 'Veuillez sélectionner un utilisateur';
    this.clearMessages();
    return;
  }

    this.sessionService.inscrireUtilisateur(
    this.selectedSessionForRegistration, 
    this.selectedUserForRegistration
    ).subscribe({
      next: () => {
        this.successMessage = 'Utilisateur inscrit avec succès à la session';
        this.closeUserSelection();
        this.reloadSessionsAndRefreshView();  // ✅
        this.clearMessages();
      },
    error: (err) => {
      console.error('Erreur inscription admin:', err);
      this.errorMessage = "Erreur lors de l'inscription de l'utilisateur";
      this.clearMessages();
    }
  });
}


  /**
   * Ferme la modal de sélection d'utilisateur
   */
  closeUserSelection(): void {
    this.showUserSelection = false;
    this.selectedUserForRegistration = '';
    this.selectedSessionForRegistration = '';
  }

  /**
   * Annule l'inscription de l'utilisateur connecté
   */
  cancelRegistration(sessionId: string): void {
    if (!this.userId) {
      this.errorMessage = 'Utilisateur non connecté.';
      this.clearMessages();
      return;
    }
    this.sessionService.annulerInscription(sessionId, this.userId).subscribe({
      next: () => {
        this.successMessage = 'Inscription annulée';
        this.reloadSessionsAndRefreshView();  // ✅
        this.clearMessages();
      },
      error: (err) => {
        this.errorMessage = "Erreur lors de l'annulation";
        console.error('Erreur lors de l\'annulation:', err);
        this.clearMessages();
      }
    });
  }

  /**
   * Annule l'inscription d'un utilisateur spécifique (fonction admin)
   */
  cancelUserRegistration(sessionId: string, userId: string): void {
      if (!this.isAdmin) return;

      const userName = this.getUserFullName(userId);
      if (confirm(`Êtes-vous sûr de vouloir annuler l'inscription de ${userName} ?`)) {
        this.sessionService.annulerInscription(sessionId, userId).subscribe({
          next: () => {
            this.successMessage = `Inscription de ${userName} annulée avec succès`;

            // ✅ recharge toutes les sessions depuis le backend
            this.reloadSessionsAndRefreshView();

            // ✅ nettoie aussi les anciennes réservations si l’utilisateur en avait
            this.bookings = this.bookings.filter(b => !(b.session_id === sessionId && b.user_id === userId));

            this.clearMessages();
          },
          error: (err) => {
            this.errorMessage = "Erreur lors de l'annulation de l'inscription";
            console.error('Erreur lors de l\'annulation:', err);
            this.clearMessages();
          }
        });
      }
    }


  /**
   * Vérifie si l'utilisateur connecté est inscrit à une session
   */
  isRegistered(session: any): boolean {
    return session.participants?.some((p: any) => p.user_id === this.userId) || false;
  }

  /**
   * Efface les messages après un délai
   */
  clearMessages(): void {
    setTimeout(() => {
      this.errorMessage = null;
      this.successMessage = null;
    }, 5000);
  }

  /**
   * Obtient le titre de la session sélectionnée pour l'inscription
   */
  getSelectedSessionTitle(): string {
    const selectedSession = this.sessions.find(s => s._id === this.selectedSessionForRegistration);
    return selectedSession?.title || 'Session sélectionnée';
  }
  resolveUserId(user: any): string {
  return typeof user === 'object' && user?._id ? user._id : user;
  }
  private reloadSessionsAndRefreshView(): void {
  this.sessionService.getAllSessions().subscribe({
    next: (sessions) => {
      this.allSessions = sessions.map((session: any) => ({
        ...session,
        participants: session.participants || []
      }));
      if (this.selectedDate) {
        this.selectDate(this.selectedDate);
      }
    },
    error: (err) => {
      this.errorMessage = 'Erreur lors du rafraîchissement des sessions';
      console.error('Erreur refresh sessions:', err);
      this.clearMessages();
    }
  });
}


}
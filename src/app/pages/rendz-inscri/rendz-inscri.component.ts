import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface CalendarDay {
  date: Date;
  day: number;
  isOtherMonth: boolean;
}

interface Availability {
  id: string;
  psychologist: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  duration: number;
  capacity: number;
  registered: number;
}

@Component({
  selector: 'app-rendz-inscri',
  templateUrl: './rendz-inscri.component.html',
  styleUrls: ['./rendz-inscri.component.scss']
})

  export class RendzInscriComponent implements OnInit {
    activeTab: "appointments" | "events" = "appointments"
    calendarDays: CalendarDay[] = []
    selectedDate: Date | null = null
    availabilities: Availability[] = []
    events: Event[] = []
  
    // Modal state
    showAppointmentModal = false
    selectedSlot: Availability | null = null
    availableTimes: string[] = []
    appointmentForm: FormGroup
  
    constructor(
      private fb: FormBuilder,
      private http: HttpClient,
    ) {
      // Initialize appointment form
      this.appointmentForm = this.fb.group({
        heure: ["", Validators.required],
        motif: ["", Validators.required],
      })
  
      // Generate calendar days
      this.generateCalendarDays()
  
      // Sample data - in a real app, this would come from your API
      this.events = [
        {
          id: "1",
          title: "Just Talk",
          description: "Atelier pour la communication verbale",
          date: "2025-05-10",
          startTime: "20:00",
          duration: 60,
          capacity: 10,
          registered: 4,
        },
        {
          id: "2",
          title: "Gestion du Stress",
          description: "Techniques pour gérer le stress quotidien",
          date: "2025-05-15",
          startTime: "18:30",
          duration: 90,
          capacity: 8,
          registered: 3,
        },
        {
          id: "3",
          title: "Méditation Guidée",
          description: "Session de méditation pour débutants",
          date: "2025-05-20",
          startTime: "19:00",
          duration: 45,
          capacity: 15,
          registered: 7,
        },
      ]
    }
  
    ngOnInit(): void {
      // Any initialization logic
    }
  
    setActiveTab(tab: "appointments" | "events"): void {
      this.activeTab = tab
    }
  
    generateCalendarDays(): void {
      const today = new Date()
      const year = today.getFullYear()
      const month = today.getMonth()
  
      // Get first day of month and last day of month
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
  
      // Get the day of the week of the first day (0-6, where 0 is Sunday)
      const firstDayOfWeek = firstDay.getDay()
  
      // Calculate days from previous month to show
      const daysFromPrevMonth = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1
  
      // Clear calendar days
      this.calendarDays = []
  
      // Add days from previous month
      if (daysFromPrevMonth > 0) {
        const prevMonth = new Date(year, month, 0)
        const prevMonthDays = prevMonth.getDate()
  
        for (let i = prevMonthDays - daysFromPrevMonth + 1; i <= prevMonthDays; i++) {
          this.calendarDays.push({
            date: new Date(year, month - 1, i),
            day: i,
            isOtherMonth: true,
          })
        }
      }
  
      // Add days from current month
      for (let i = 1; i <= lastDay.getDate(); i++) {
        this.calendarDays.push({
          date: new Date(year, month, i),
          day: i,
          isOtherMonth: false,
        })
      }
  
      // Add days from next month to complete the grid (assuming 6 rows of 7 days)
      const totalDaysNeeded = 42
      const remainingDays = totalDaysNeeded - this.calendarDays.length
  
      for (let i = 1; i <= remainingDays; i++) {
        this.calendarDays.push({
          date: new Date(year, month + 1, i),
          day: i,
          isOtherMonth: true,
        })
      }
    }
  
    selectDate(date: Date): void {
      this.selectedDate = date
      this.loadAvailabilities(date)
    }
  
    isSelectedDate(date: Date): boolean {
      if (!this.selectedDate) return false
      return (
        date.getDate() === this.selectedDate.getDate() &&
        date.getMonth() === this.selectedDate.getMonth() &&
        date.getFullYear() === this.selectedDate.getFullYear()
      )
    }
  
    loadAvailabilities(date: Date): void {
      // Format date for API
      const formattedDate = this.formatDate(date)
  
      // In a real app, you would call your API here
      // this.http.get<Availability[]>(`YOUR_API_ENDPOINT/disponibilites?date=${formattedDate}`)
      //   .subscribe(data => {
      //     this.availabilities = data;
      //   });
  
      // For demo purposes, we'll use sample data
      this.availabilities = [
        { id: "1", psychologist: "Dr. Martin", date: formattedDate, startTime: "09:00", endTime: "12:00" },
        { id: "2", psychologist: "Dr. Dubois", date: formattedDate, startTime: "14:00", endTime: "17:00" },
        { id: "3", psychologist: "Dr. Bernard", date: formattedDate, startTime: "10:00", endTime: "15:00" },
      ]
    }
  
    formatDate(date: Date): string {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")
      return `${year}-${month}-${day}`
    }
  
    openAppointmentModal(slot: Availability): void {
      this.selectedSlot = slot
      this.showAppointmentModal = true
  
      // Generate available times based on the slot's start and end times
      this.generateAvailableTimes(slot.startTime, slot.endTime)
  
      // Set default value for the time select
      this.appointmentForm.patchValue({
        heure: this.availableTimes[0],
      })
    }
  
    closeAppointmentModal(): void {
      this.showAppointmentModal = false
      this.selectedSlot = null
      this.appointmentForm.reset()
    }
  
    generateAvailableTimes(startTime: string, endTime: string): void {
      const times: string[] = []
      const [startHour, startMinute] = startTime.split(":").map(Number)
      const [endHour, endMinute] = endTime.split(":").map(Number)
  
      let currentHour = startHour
      let currentMinute = startMinute
  
      while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
        times.push(`${String(currentHour).padStart(2, "0")}:${String(currentMinute).padStart(2, "0")}`)
  
        // Increment by 30 minutes
        currentMinute += 30
        if (currentMinute >= 60) {
          currentHour += 1
          currentMinute = 0
        }
      }
  
      this.availableTimes = times
    }
  
    submitAppointment(): void {
      if (this.appointmentForm.valid && this.selectedSlot && this.selectedDate) {
        const formData = this.appointmentForm.value
  
        // Format the data according to your API requirements
        const payload = {
          id_psychologue: this.selectedSlot.id,
          date: this.formatDate(this.selectedDate),
          heure: formData.heure,
          motif: formData.motif,
        }
  
        // Call your API
        this.http.post("YOUR_API_ENDPOINT/rendez-vous", payload).subscribe({
          next: (response) => {
            console.log("Rendez-vous pris avec succès", response)
            this.closeAppointmentModal()
            alert("Rendez-vous pris avec succès")
          },
          error: (error) => {
            console.error("Erreur lors de la prise de rendez-vous", error)
            alert("Erreur lors de la prise de rendez-vous")
          },
        })
      }
    }
  
    registerForEvent(event: Event): void {
      const payload = {
        id_evenement: event.id,
      }
  
      // Call your API
      this.http.post("YOUR_API_ENDPOINT/inscriptions", payload).subscribe({
        next: (response) => {
          console.log("Inscription réussie", response)
          // Update the event in the UI
          event.registered += 1
          alert("Inscription réussie")
        },
        error: (error) => {
          console.error("Erreur lors de l'inscription", error)
          alert("Erreur lors de l'inscription")
        },
      })
    }
  }

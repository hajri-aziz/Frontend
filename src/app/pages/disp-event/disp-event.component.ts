import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-disp-event',
  templateUrl: './disp-event.component.html',
  styleUrls: ['./disp-event.component.scss']
})

  export class DispEventComponent implements OnInit {
    activeTab: "availability" | "events" = "availability"
    availabilityForm: FormGroup
    eventForm: FormGroup
  
    constructor(
      private fb: FormBuilder,
      private http: HttpClient,
    ) {
      // Initialize availability form
      this.availabilityForm = this.fb.group({
        date: ["", Validators.required],
        heure_debut: ["", Validators.required],
        heure_fin: ["", Validators.required],
        statut: ["disponible", Validators.required],
      })
  
      // Initialize event form
      this.eventForm = this.fb.group({
        titre: ["", Validators.required],
        description: ["", Validators.required],
        date: ["", Validators.required],
        heure_debut: ["", Validators.required],
        duree: [60, [Validators.required, Validators.min(15)]],
        capacite: [10, [Validators.required, Validators.min(1)]],
      })
    }
  
    ngOnInit(): void {
      // Any initialization logic
    }
  
    setActiveTab(tab: "availability" | "events"): void {
      this.activeTab = tab
    }
  
    submitAvailability(): void {
      if (this.availabilityForm.valid) {
        const formData = this.availabilityForm.value
  
        // Format the data according to your API requirements
        const payload = {
          date: formData.date,
          heure_debut: formData.heure_debut,
          heure_fin: formData.heure_fin,
          statut: formData.statut,
        }
  
        // Call your API
        this.http.post("YOUR_API_ENDPOINT/disponibilites", payload).subscribe({
          next: (response) => {
            console.log("Disponibilité ajoutée avec succès", response)
            // Reset form or show success message
            this.availabilityForm.reset({
              statut: "disponible",
            })
            alert("Disponibilité ajoutée avec succès")
          },
          error: (error) => {
            console.error("Erreur lors de l'ajout de la disponibilité", error)
            alert("Erreur lors de l'ajout de la disponibilité")
          },
        })
      }
    }
  
    submitEvent(): void {
      if (this.eventForm.valid) {
        const formData = this.eventForm.value
  
        // Format the data according to your API requirements
        const payload = {
          titre: formData.titre,
          description: formData.description,
          date: formData.date,
          heure_debut: formData.heure_debut,
          duree: formData.duree,
          capacite: formData.capacite,
        }
  
        // Call your API
        this.http.post("YOUR_API_ENDPOINT/evenements", payload).subscribe({
          next: (response) => {
            console.log("Événement créé avec succès", response)
            // Reset form or show success message
            this.eventForm.reset({
              duree: 60,
              capacite: 10,
            })
            alert("Événement créé avec succès")
          },
          error: (error) => {
            console.error("Erreur lors de la création de l'événement", error)
            alert("Erreur lors de la création de l'événement")
          },
        })
      }
    }
  }


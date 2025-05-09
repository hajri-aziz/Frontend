import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Evenement } from 'src/app/models/evenement.model';
import { EvenementService } from 'src/app/services/evenement.service';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent implements OnInit {
  eventForm: FormGroup;
  evenements: Evenement[] = [];
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private evenementService: EvenementService
  ) {
    this.eventForm = this.fb.group({
      titre: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      date: ['', Validators.required],
      heure_debut: ['', [Validators.required, Validators.pattern('^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$')]],
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
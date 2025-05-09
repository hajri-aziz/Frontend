import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Disponibilite } from 'src/app/models/disponibilite.model';
import { DisponibiliteService } from 'src/app/services/disponibilite.service';

@Component({
  selector: 'app-availability',
  templateUrl: './availability.component.html',
  styleUrls: ['./availability.component.scss']
})
export class AvailabilityComponent implements OnInit {
  availabilityForm: FormGroup;
  disponibilites: Disponibilite[] = [];
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private disponibiliteService: DisponibiliteService
  ) {
    this.availabilityForm = this.fb.group({
      date: ['', Validators.required],
      heure_debut: ['', [Validators.required, Validators.pattern('^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$')]],
      heure_fin: ['', [Validators.required, Validators.pattern('^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$')]],
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
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import Chart from 'chart.js/auto';
import { DisponibiliteService } from 'src/app/services/disponibilite.service';
import { EvenementService } from 'src/app/services/evenement.service';
import { Disponibilite } from 'src/app/models/disponibilite.model';
import { Evenement } from 'src/app/models/evenement.model';

@Component({
  selector: 'app-analyse-graphique',
  templateUrl: './analyse-graphique.component.html',
  styleUrls: ['./analyse-graphique.component.scss']
})
export class AnalyseGraphiqueComponent implements OnInit, AfterViewInit {
  disponibilites: Disponibilite[] = [];
  evenements: Evenement[] = [];
  filteredDisponibilites: Disponibilite[] = [];
  filteredEvenements: Evenement[] = [];
  selectedDate: string = '';
  selectedPsychologist: string = ''; // New property for selected psychologist
  uniquePsychologists: string[] = []; // Array to store unique psychologist names
  errorMessage: string | null = null;
  editingDisponibilite: Disponibilite | null = null;
  editingEvenement: Evenement | null = null;

  @ViewChild('availabilityBarChart') availabilityBarChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('availabilityPolarChart') availabilityPolarChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('eventChart') eventChartRef!: ElementRef<HTMLCanvasElement>;

  private availabilityBarChart?: Chart;
  private availabilityPolarChart?: Chart;
  private eventChart?: Chart;

  constructor(
    private disponibiliteService: DisponibiliteService,
    private evenementService: EvenementService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    // Charts will be created once data is loaded
  }

  private loadData(): void {
    let dispoLoaded = false;
    let eventLoaded = false;

    this.disponibiliteService.getAllDisponibilites().subscribe({
      next: (data) => {
        this.disponibilites = data;
        // Extract unique psychologist names
        this.uniquePsychologists = [...new Set(data.map(dispo => dispo.id_psychologue.nom))].sort();
        dispoLoaded = true;
        if (dispoLoaded && eventLoaded) this.applyFilterAndRender();
      },
      error: (error) => this.errorMessage = error
    });

    this.evenementService.getAllEvenements().subscribe({
      next: (data) => {
        this.evenements = data;
        eventLoaded = true;
        if (dispoLoaded && eventLoaded) this.applyFilterAndRender();
      },
      error: (error) => this.errorMessage = error
    });
  }

  filterDataByDate(): void {
    this.applyFilterAndRender();
  }

  private applyFilterAndRender(): void {
    // Filter Disponibilites
    this.filteredDisponibilites = [...this.disponibilites];
    
    if (this.selectedDate) {
      const selected = new Date(this.selectedDate).toISOString().split('T')[0];
      this.filteredDisponibilites = this.filteredDisponibilites.filter(dispo =>
        new Date(dispo.date).toISOString().split('T')[0] === selected
      );
    }

    if (this.selectedPsychologist) {
      this.filteredDisponibilites = this.filteredDisponibilites.filter(dispo =>
        dispo.id_psychologue.nom === this.selectedPsychologist
      );
    }

    // Filter Evenements (only by date, as in the original logic)
    if (this.selectedDate) {
      const selected = new Date(this.selectedDate).toISOString().split('T')[0];
      this.filteredEvenements = this.evenements.filter(event =>
        event.date.split('T')[0] === selected
      );
    } else {
      this.filteredEvenements = [...this.evenements];
    }

    this.initOrUpdateCharts();
  }

  private getAvailabilityStatusCounts(): { [key: string]: number } {
    return this.filteredDisponibilites.reduce((acc, dispo) => {
      acc[dispo.statut] = (acc[dispo.statut] || 0) + 1;
      return acc;
    }, { disponible: 0, occupé: 0, absent: 0 });
  }

  private getEventParticipantCounts(): { [key: string]: number } {
    return this.filteredEvenements.reduce((acc, event) => {
      if (event.titre) {
        acc[event.titre] = (acc[event.titre] || 0) + (event.participants?.length || 0);
      }
      return acc;
    }, {} as { [key: string]: number });
  }

  private initOrUpdateCharts(): void {
    const statusCounts = this.getAvailabilityStatusCounts();
    const eventParticipantCounts = this.getEventParticipantCounts();

    if (this.availabilityBarChart) this.availabilityBarChart.destroy();
    if (this.availabilityPolarChart) this.availabilityPolarChart.destroy();
    if (this.eventChart) this.eventChart.destroy();

    // Bar Chart
    const barCtx = this.availabilityBarChartRef.nativeElement.getContext('2d');
    this.availabilityBarChart = new Chart(barCtx!, {
      type: 'bar',
      data: {
        labels: ['Disponible', 'Occupé', 'Absent'],
        datasets: [{
          label: 'Disponibilités',
          data: [statusCounts['disponible'], statusCounts['occupé'], statusCounts['absent']],
          backgroundColor: ['#56e0e0', '#ff6384', '#ffcd56']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top', labels: { font: { family: 'Poppins', size: 14 } } },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: { family: 'Poppins' },
            bodyFont: { family: 'Poppins' }
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeInOutQuad'
        }
      }
    });

    // Polar Area Chart (Disponibilités)
    const polarCtx = this.availabilityPolarChartRef.nativeElement.getContext('2d');
    this.availabilityPolarChart = new Chart(polarCtx!, {
      type: 'polarArea',
      data: {
        labels: ['Disponible', 'Occupé', 'Absent'],
        datasets: [{
          label: 'Disponibilités',
          data: [statusCounts['disponible'], statusCounts['occupé'], statusCounts['absent']],
          backgroundColor: [
            'rgba(86, 224, 224, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(255, 205, 86, 0.6)'
          ],
          borderColor: ['#56e0e0', '#ff6384', '#ffcd56'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top', labels: { font: { family: 'Poppins', size: 14 } } },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: { family: 'Poppins' },
            bodyFont: { family: 'Poppins' }
          }
        },
        animation: {
          animateScale: true,
          animateRotate: true,
          duration: 1200,
          easing: 'easeOutBounce'
        },
        scales: {
          r: {
            ticks: { display: false },
            grid: { color: 'rgba(0, 0, 0, 0.1)' }
          }
        }
      }
    });

    // Polar Area Chart (Participants par événement)
    const eventCtx = this.eventChartRef.nativeElement.getContext('2d');
    this.eventChart = new Chart(eventCtx!, {
      type: 'polarArea',
      data: {
        labels: Object.keys(eventParticipantCounts),
        datasets: [{
          label: 'Participants',
          data: Object.values(eventParticipantCounts),
          backgroundColor: [
            'rgba(86, 224, 224, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(255, 205, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(54, 162, 235, 0.6)'
          ],
          borderColor: ['#56e0e0', '#ff6384', '#ffcd56', '#4bc0c0', '#36a2eb'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top', labels: { font: { family: 'Poppins', size: 14 } } },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: { family: 'Poppins' },
            bodyFont: { family: 'Poppins' },
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.raw as number;
                return `${label}: ${value} participants`;
              }
            }
          }
        },
        animation: {
          animateScale: true,
          animateRotate: true,
          duration: 1200,
          easing: 'easeOutBounce'
        },
        scales: {
          r: {
            ticks: { display: false },
            grid: { color: 'rgba(0, 0, 0, 0.1)' }
          }
        }
      }
    });
  }

  // Edit Disponibilite
  editDisponibilite(dispo: Disponibilite): void {
    this.editingDisponibilite = { ...dispo };
  }

  saveDisponibilite(): void {
    if (this.editingDisponibilite && this.editingDisponibilite._id) {
      const updatedData: Partial<Disponibilite> = {
        heure_debut: this.editingDisponibilite.heure_debut,
        heure_fin: this.editingDisponibilite.heure_fin,
        statut: this.editingDisponibilite.statut
      };
      this.disponibiliteService.updateDisponibilite(this.editingDisponibilite._id, updatedData).subscribe({
        next: (response) => {
          const index = this.disponibilites.findIndex(d => d._id === response.disponibilite._id);
          if (index !== -1) {
            this.disponibilites[index] = response.disponibilite;
            this.applyFilterAndRender();
            this.editingDisponibilite = null;
          }
        },
        error: (error) => this.errorMessage = error
      });
    }
  }

  cancelEditDisponibilite(): void {
    this.editingDisponibilite = null;
  }

  // Delete Disponibilite
  deleteDisponibilite(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette disponibilité ?')) {
      this.disponibiliteService.deleteDisponibilite(id).subscribe({
        next: () => {
          this.disponibilites = this.disponibilites.filter(d => d._id !== id);
          this.applyFilterAndRender();
        },
        error: (error) => this.errorMessage = error
      });
    }
  }

  // Edit Evenement
  editEvenement(event: Evenement): void {
    this.editingEvenement = {
      ...event,
      date: new Date(event.date).toISOString().split('T')[0] // Format for input type="date"
    };
  }

  saveEvenement(): void {
    if (this.editingEvenement && this.editingEvenement._id) {
      const updatedData: Partial<Evenement> = {
        titre: this.editingEvenement.titre,
        description: this.editingEvenement.description,
        date: new Date(this.editingEvenement.date).toISOString(),
        heure_debut: this.editingEvenement.heure_debut,
        duree: this.editingEvenement.duree,
        capacite: this.editingEvenement.capacite
      };
      this.evenementService.updateEvenement(this.editingEvenement._id, updatedData).subscribe({
        next: (response) => {
          const index = this.evenements.findIndex(e => e._id === response.evenement._id);
          if (index !== -1) {
            this.evenements[index] = response.evenement;
            this.applyFilterAndRender();
            this.editingEvenement = null;
          }
        },
        error: (error) => this.errorMessage = error
      });
    }
  }

  cancelEditEvenement(): void {
    this.editingEvenement = null;
  }

  // Delete Evenement
  deleteEvenement(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      this.evenementService.deleteEvenement(id).subscribe({
        next: () => {
          this.evenements = this.evenements.filter(e => e._id !== id);
          this.applyFilterAndRender();
        },
        error: (error) => this.errorMessage = error
      });
    }
  }
}
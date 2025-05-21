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
  errorMessage: string | null = null;

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
        dispoLoaded = true;
        if (dispoLoaded && eventLoaded) this.applyFilterAndRender();
      },
      error: () => this.errorMessage = 'Erreur lors du chargement des disponibilités'
    });

    this.evenementService.getAllEvenements().subscribe({
      next: (data) => {
        this.evenements = data;
        eventLoaded = true;
        if (dispoLoaded && eventLoaded) this.applyFilterAndRender();
      },
      error: () => this.errorMessage = 'Erreur lors du chargement des événements'
    });
  }

  filterDataByDate(): void {
    this.applyFilterAndRender();
  }

  private applyFilterAndRender(): void {
    if (this.selectedDate) {
      // Convert selected date to ISO format (YYYY-MM-DD) for comparison
      const selected = new Date(this.selectedDate).toISOString().split('T')[0];

      this.filteredDisponibilites = this.disponibilites.filter(dispo =>
        new Date(dispo.date).toISOString().split('T')[0] === selected
      );

      this.filteredEvenements = this.evenements.filter(event =>
        event.date.split('T')[0] === selected
      );
    } else {
      this.filteredDisponibilites = [...this.disponibilites];
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
      if (event.titre) { // Ensure event title exists
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
}
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
  @ViewChild('availabilityDonutChart') availabilityDonutChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('eventChart') eventChartRef!: ElementRef<HTMLCanvasElement>;

  private availabilityBarChart?: Chart;
  private availabilityDonutChart?: Chart;
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
      const selected = new Date(this.selectedDate).toDateString();

      this.filteredDisponibilites = this.disponibilites.filter(dispo =>
        new Date(dispo.date).toDateString() === selected
      );

      this.filteredEvenements = this.evenements.filter(event =>
        new Date(event.date).toDateString() === selected
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

  private getEventCountsByDate(): { [key: string]: number } {
    return this.filteredEvenements.reduce((acc, event) => {
      const dateStr = new Date(event.date).toLocaleDateString('fr-FR');
      acc[dateStr] = (acc[dateStr] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  }

  private initOrUpdateCharts(): void {
    const statusCounts = this.getAvailabilityStatusCounts();
    const eventCounts = this.getEventCountsByDate();

    if (this.availabilityBarChart) this.availabilityBarChart.destroy();
    if (this.availabilityDonutChart) this.availabilityDonutChart.destroy();
    if (this.eventChart) this.eventChart.destroy();

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
      options: { responsive: true, plugins: { legend: { position: 'top' } } }
    });

    const donutCtx = this.availabilityDonutChartRef.nativeElement.getContext('2d');
    this.availabilityDonutChart = new Chart(donutCtx!, {
      type: 'doughnut',
      data: {
        labels: ['Disponible', 'Occupé', 'Absent'],
        datasets: [{
          label: 'Disponibilités',
          data: [statusCounts['disponible'], statusCounts['occupé'], statusCounts['absent']],
          backgroundColor: ['#56e0e0', '#ff6384', '#ffcd56']
        }]
      },
      options: { responsive: true, plugins: { legend: { position: 'top' } } }
    });

    const eventCtx = this.eventChartRef.nativeElement.getContext('2d');
    this.eventChart = new Chart(eventCtx!, {
      type: 'pie',
      data: {
        labels: Object.keys(eventCounts),
        datasets: [{
          label: 'Événements',
          data: Object.values(eventCounts),
          backgroundColor: ['#56e0e0', '#ff6384', '#ffcd56', '#4bc0c0', '#36a2eb']
        }]
      },
      options: { responsive: true, plugins: { legend: { position: 'top' } } }
    });
  }
}

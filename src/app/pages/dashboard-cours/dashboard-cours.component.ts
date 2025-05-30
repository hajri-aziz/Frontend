import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CoursService } from 'src/app/services/cours.service';
import { CoursSessionService } from 'src/app/services/cours-session.service';
import { CoursCategoryService } from 'src/app/services/cours-category.service';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-dashboard-cours',
  templateUrl: './dashboard-cours.component.html',
  styleUrls: ['./dashboard-cours.component.scss']
})
export class DashboardCoursComponent implements OnInit, AfterViewInit {
  // Données principales
  totalCours = 0;
  totalSessions = 0;
  totalCategories = 0;
  totalInscriptions = 0;
  moyenneInscriptions = 0;

  // Données pour graphiques
  categorieLabels: string[] = [];
  categorieChartData: number[] = [];
  coursLabels: string[] = [];
  coursSessionData: number[] = [];
  evolutionLabels: string[] = [];
  evolutionData: number[] = [];

  // Top indicateurs
  topCours: {titre: string, count: number} = {titre: '', count: 0};
  popularCategory: {nom: string, count: number} = {nom: '', count: 0};

  // Filtres
  dateRanges = [
    {label: '7 derniers jours', value: '7d'},
    {label: '30 derniers jours', value: '30d'}, 
    {label: 'Toutes périodes', value: 'all'}
  ];
  selectedRange = 'all';

  constructor(
    private coursService: CoursService,
    private sessionService: CoursSessionService,
    private categorieService: CoursCategoryService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.createCharts();
    }, 500);
  }

  loadData() {
    const now = new Date();
    let dateFilter: Date | undefined;

    // Appliquer le filtre de date
    if (this.selectedRange === '7d') {
      dateFilter = new Date(now.setDate(now.getDate() - 7));
    } else if (this.selectedRange === '30d') {
      dateFilter = new Date(now.setDate(now.getDate() - 30));
    }

    // Chargement des cours
    this.coursService.getAllCours().subscribe((coursList: any[]) => {
      this.totalCours = coursList.length;
      
      const coursCountPerCat: { [key: string]: number } = {};
      coursList.forEach((c: any) => {
        const cat = c.categorie?.nom || 'Sans catégorie';
        coursCountPerCat[cat] = (coursCountPerCat[cat] || 0) + 1;
      });
      
      this.categorieLabels = Object.keys(coursCountPerCat);
      this.categorieChartData = Object.values(coursCountPerCat);
      
      // Trouver la catégorie la plus populaire
      const popular = Object.entries(coursCountPerCat).reduce((a, b) => a[1] > b[1] ? a : b, ['', 0]);
      this.popularCategory = { nom: popular[0], count: popular[1] };
    });

    // Chargement des sessions
    this.sessionService.getAllSessions().subscribe((sessionList: any[]) => {
      const filtered = dateFilter
        ? sessionList.filter((s: any) => {
            const sessionDate = new Date(s.date);
            return sessionDate >= dateFilter!;
          })
        : sessionList;
      
      this.totalSessions = filtered.length;
      this.totalInscriptions = filtered.reduce((sum: number, s: any) => sum + (s.participants?.length || 0), 0);
      this.moyenneInscriptions = this.totalSessions > 0 
        ? parseFloat((this.totalInscriptions / this.totalSessions).toFixed(1)) 
        : 0;

      // Préparation données pour graphique à barres
      const inscriptionsParCours: { [key: string]: number } = {};
      const evolutionMap = new Map<string, number>();
      
      filtered.forEach((s: any) => {
        // Données pour graphique à barres
        const titre = s.cours?.titre || 'Inconnu';
        inscriptionsParCours[titre] = (inscriptionsParCours[titre] || 0) + (s.participants?.length || 0);
        
        // Données pour graphique d'évolution
        const monthYear = new Date(s.date).toLocaleString('default', {month: 'short', year: 'numeric'});
        evolutionMap.set(monthYear, (evolutionMap.get(monthYear) || 0) + (s.participants?.length || 0));
      });
      
      this.coursLabels = Object.keys(inscriptionsParCours);
      this.coursSessionData = Object.values(inscriptionsParCours);
      this.evolutionLabels = Array.from(evolutionMap.keys());
      this.evolutionData = Array.from(evolutionMap.values());
      
      // Trouver le cours le plus populaire
      const top = Object.entries(inscriptionsParCours).reduce((a, b) => a[1] > b[1] ? a : b, ['', 0]);
      this.topCours = { titre: top[0], count: top[1] };
    });

    // Chargement des catégories
    this.categorieService.getAll().subscribe(categories => {
      this.totalCategories = categories.length;
    });
  }

  createCharts() {
    // Graphique Camembert (Catégories)
    new Chart("categorieChart", {
      type: 'pie',
      data: {
        labels: this.categorieLabels,
        datasets: [{
          label: 'Cours par catégorie',
          data: this.categorieChartData,
          backgroundColor: [
            '#7dd3fc', '#38bdf8', '#0ea5e9', '#0284c7', '#0369a1',
            '#bae6fd', '#60a5fa', '#2563eb', '#1d4ed8', '#1e40af'
          ]
        }]
      },
      options: {
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const value = context.raw as number;
                const percentage = Math.round((value / total) * 100);
                return `${context.label}: ${value} (${percentage}%)`;
              }
            }
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeOutQuart'
        }
      }
    });

    // Graphique Barres (Inscriptions)
    new Chart("enrollmentChart", {
      type: 'bar',
      data: {
        labels: this.coursLabels,
        datasets: [{
          label: 'Inscriptions par cours',
          data: this.coursSessionData,
          backgroundColor: '#60a5fa'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `${context.label}: ${context.raw} inscriptions`;
              }
            }
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeOutQuart'
        }
      }
    });

    // Graphique Ligne (Évolution)
    new Chart("evolutionChart", {
      type: 'line',
      data: {
        labels: this.evolutionLabels,
        datasets: [{
          label: 'Évolution mensuelle',
          data: this.evolutionData,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                return `${context.dataset.label}: ${context.raw} inscriptions`;
              }
            }
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeOutQuart'
        }
      }
    });
  }

  onDateRangeChange() {
    this.loadData();
    setTimeout(() => {
      this.createCharts();
    }, 500);
  }
}
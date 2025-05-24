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
  totalCours = 0;
  totalSessions = 0;
  totalCategories = 0;
  totalInscriptions = 0;
  moyenneInscriptions = 0;

  categorieLabels: string[] = [];
  categorieChartData: number[] = [];

  coursLabels: string[] = [];
  coursSessionData: number[] = [];

  selectedDate: string = '';

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
    const selected = this.selectedDate ? new Date(this.selectedDate) : null;

    this.coursService.getAllCours().subscribe((coursList: any[]) => {
      this.totalCours = coursList.length;
      const coursCountPerCat: { [key: string]: number } = {};
      coursList.forEach((c: any) => {
        const cat = c.categorie?.nom || 'Sans catégorie';
        coursCountPerCat[cat] = (coursCountPerCat[cat] || 0) + 1;
      });
      this.categorieLabels = Object.keys(coursCountPerCat);
      this.categorieChartData = Object.values(coursCountPerCat);
    });

    this.sessionService.getAllSessions().subscribe((sessionList: any[]) => {
      const filtered = selected ? sessionList.filter((s: any) => new Date(s.date) >= selected) : sessionList;
      this.totalSessions = filtered.length;
      this.totalInscriptions = filtered.reduce((sum: number, s: any) => sum + (s.participants?.length || 0), 0);
      this.moyenneInscriptions = this.totalSessions > 0 ? parseFloat((this.totalInscriptions / this.totalSessions).toFixed(1)) : 0;

      const map: { [key: string]: number } = {};
      filtered.forEach((s: any) => {
        const titre = s.cours?.titre || 'Inconnu';
        map[titre] = (map[titre] || 0) + (s.participants?.length || 0);
      });
      this.coursLabels = Object.keys(map);
      this.coursSessionData = Object.values(map);
    });

    this.categorieService.getAll().subscribe(categories => {
      this.totalCategories = categories.length;
    });
  }

  createCharts() {
    new Chart("categorieChart", {
      type: 'pie',
      data: {
        labels: this.categorieLabels,
        datasets: [{
          label: 'Cours par catégorie',
          data: this.categorieChartData,
          backgroundColor: ['#7dd3fc', '#38bdf8', '#0ea5e9', '#0284c7', '#0369a1']
        }]
      }
    });

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
          }
        }
      }
    });
  }
}

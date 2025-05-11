import { Component, OnInit } from '@angular/core';
import { CoursService } from 'src/app/services/cours.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cours-list',
  templateUrl: './cours-list.component.html',
  styleUrls: ['./cours-list.component.scss']
})
export class CoursListComponent implements OnInit {
  coursList: any[] = [];
  categories: any[] = [];
  loading = true;
  error = '';
  success = '';
  searchTerm: string = '';
  selectedCategory: string = '';
  
  // Nouveaux filtres
  minPrice: number = 0;
  maxPrice: number = 1000;
  showPopular: boolean = false;

  constructor(
    private coursService: CoursService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCours();
    this.loadCategories();
  }

  loadCours(): void {
  this.loading = true;
  this.error = '';

  this.coursService.getAllCours().subscribe({
    next: (data) => {
      this.coursList = data;
      this.loading = false;
    },
    error: () => {
      this.error = 'Erreur lors du chargement des cours';
      this.loading = false;
    }
  });
}


  loadCategories(): void {
    this.coursService.getAllCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: () => {
        this.error = 'Erreur lors du chargement des catégories';
      }
    });
  }

goToDeleteConfirmation(id: string): void {
  this.router.navigate(['/courses/detail', id]);
}

  editCours(id: string): void {
    this.router.navigate(['/courses/edit', id]);
  }

  viewCours(id: string): void {
    this.router.navigate(['/courses/detail', id]);
  }

  addCours(): void {
    this.router.navigate(['/courses/create']);
  }

  searchCours(): void {
    if (!this.searchTerm.trim()) {
      this.loadCours();
      return;
    }
    this.loading = true;
    this.error = '';
    
    this.coursService.searchCours(this.searchTerm).subscribe({
      next: (data) => {
        this.coursList = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Erreur lors de la recherche des cours';
        this.loading = false;
      }
    });
  }

  filterByCategory(): void {
    if (!this.selectedCategory) {
      this.loadCours();
      return;
    }
    this.loading = true;
    this.error = '';
    
    this.coursService.getCoursByCategory(this.selectedCategory).subscribe({
      next: (data) => {
        this.coursList = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Erreur lors du filtrage par catégorie';
        this.loading = false;
      }
    });
  }

  // Nouveau filtre par prix
  filterByPrice(): void {
    this.loading = true;
    this.error = '';
    
    this.coursService.getCoursByPrice(this.minPrice, this.maxPrice).subscribe({
      next: (data) => {
        this.coursList = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Erreur lors du filtrage par prix';
        this.loading = false;
      }
    });
  }

  // Nouveau filtre par popularité
  loadPopularCourses(): void {
    this.loading = true;
    this.error = '';
    this.showPopular = true;
    
    this.coursService.getPopularCours().subscribe({
      next: (data) => {
        this.coursList = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Erreur lors du chargement des cours populaires';
        this.loading = false;
      }
    });
  }

  // Fonction robuste pour obtenir l'URL de l'image
  getImageUrl(cours: any): string {
    if (!cours || !cours.image) {
      return '/assets/images/default-course.jpg';
    }

    // ✅ Extraire juste le nom du fichier depuis un chemin absolu
    const imageFileName = cours.image.split('\\').pop()?.split('/').pop(); // cross-platform
    return `http://localhost:3000/uploads/cours/${imageFileName}`;
  }

  onImageError(event: any): void {
    event.target.src = '/assets/images/default-course.jpg';
  }
}
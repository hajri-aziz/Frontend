import { Component, OnInit } from '@angular/core';
import { CoursService } from 'src/app/services/cours.service';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-cours-list',
  templateUrl: './cours-list.component.html',
  styleUrls: ['./cours-list.component.scss']
})
export class CoursListComponent implements OnInit {
  coursList: any[] = [];
  filteredCoursList: any[] = [];
  categories: any[] = [];
  loading = true;
  error = '';
  success = '';
  searchTerm: string = '';
  selectedCategory: string = '';
  userRole: string = '';
  isAdmin: boolean = false;
  
  // Filtres de prix
  minPrice: number = 0;
  maxPrice: number = 1000;
  maxPossiblePrice: number = 5000;
  showPopular: boolean = false;

  constructor(
    private coursService: CoursService,
    private router: Router,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.checkUserRole();
    this.loadInitialData();
  }

  private checkUserRole(): void {
    this.userRole = this.userService.getUserRole() || '';
    this.isAdmin = this.userRole === 'admin';
  }

  private loadInitialData(): void {
    this.loading = true;
    
    this.coursService.getAllCours().subscribe({
      next: (cours) => {
        this.coursList = cours;
        this.filteredCoursList = [...cours];
        this.calculateMaxPrice();
        this.loadCategories();
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors du chargement des cours';
        this.loading = false;
      }
    });
  }

  private calculateMaxPrice(): void {
    if (this.coursList.length > 0) {
      this.maxPossiblePrice = Math.max(...this.coursList.map(c => c.price));
      this.maxPrice = this.maxPossiblePrice;
    }
  }

  private loadCategories(): void {
    this.coursService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors du chargement des catégories';
      }
    });
  }

  // Navigation
  goToDeleteConfirmation(id: string): void {
    this.router.navigate(['/cours/detail', id]);
  }

  editCours(id: string): void {
    if (!this.isAdmin) return;
    this.router.navigate(['/cours/edit', id]);
  }

  viewCours(id: string): void {
    this.router.navigate(['/cours/detail', id]);
  }

  addCours(): void {
    if (!this.isAdmin) return;
    this.router.navigate(['/cours/create']);
  }

  // Filtres et recherche
  searchCours(): void {
    if (!this.searchTerm.trim()) {
      this.resetFilters();
      return;
    }

    this.loading = true;
    this.coursService.searchCours(this.searchTerm).subscribe({
      next: (data) => {
        this.filteredCoursList = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de la recherche';
        this.loading = false;
      }
    });
  }

  filterByCategory(): void {
    if (!this.selectedCategory) {
      this.resetFilters();
      return;
    }

    this.loading = true;
    this.coursService.getCoursByCategory(this.selectedCategory).subscribe({
      next: (data) => {
        this.filteredCoursList = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors du filtrage';
        this.loading = false;
      }
    });
  }

  filterByPrice(): void {
    this.loading = true;
    this.coursService.getCoursByPrice(this.minPrice, this.maxPrice).subscribe({
      next: (data) => {
        this.filteredCoursList = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors du filtrage par prix';
        this.loading = false;
      }
    });
  }

  loadPopularCourses(): void {
    this.loading = true;
    this.showPopular = true;
    
    this.coursService.getPopularCours().subscribe({
      next: (data) => {
        this.filteredCoursList = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors du chargement des cours populaires';
        this.loading = false;
      }
    });
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.minPrice = 0;
    this.maxPrice = this.maxPossiblePrice;
    this.showPopular = false;
    this.filteredCoursList = [...this.coursList];
    this.error = '';
  }

  // Gestion des prix
  validatePriceRange(): void {
    if (this.minPrice < 0) this.minPrice = 0;
    if (this.maxPrice > this.maxPossiblePrice) this.maxPrice = this.maxPossiblePrice;
    if (this.minPrice > this.maxPrice) this.minPrice = this.maxPrice;
  }
  updatePriceFromSlider(): void {
  this.validatePriceRange();
  // Optionnel : déclencher automatiquement le filtrage
  this.filterByPrice(); 
}

  // Gestion des images
  getImageUrl(cours: any): string {
    if (!cours?.image) {
      return '/assets/images/default-course.jpg';
    }

    const imagePath = cours.image.replace(/\\/g, '/');
    const imageName = imagePath.split('/').pop();
    return `http://localhost:3000/uploads/cours/${imageName}`;
  }

  onImageError(event: any): void {
    event.target.src = '/assets/images/default-course.jpg';
  }
}
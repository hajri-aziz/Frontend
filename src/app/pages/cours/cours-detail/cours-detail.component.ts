import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CoursService } from 'src/app/services/cours.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-cours-detail',
  templateUrl: './cours-detail.component.html',
  styleUrls: ['./cours-detail.component.scss']
})
export class CoursDetailComponent implements OnInit {
  cours: any;
  error: string = '';
  success: string = '';
  loading: boolean = false;
  userRole: string = '';
  isAdmin: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private coursService: CoursService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkAdminStatus();
    this.loadCoursDetails();
  }

  private checkAdminStatus(): void {
    this.isAdmin = this.userService.getUserRole() === 'admin';
  }

  private loadCoursDetails(): void {
    this.loading = true;
    const id = this.route.snapshot.paramMap.get('id');
    
    if (!id) {
      this.error = 'ID du cours non fourni';
      this.loading = false;
      return;
    }

    this.coursService.getCoursById(id).subscribe({
      next: (data) => {
        this.cours = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors du chargement du cours';
        this.loading = false;
      }
    });
  }

  getImageUrl(): string {
    if (!this.cours?.image) {
      return '/assets/images/default-course.jpg';
    }
    
    const imagePath = this.cours.image.replace(/\\/g, '/');
    const imageName = imagePath.split('/').pop();
    
    return `http://localhost:3000/uploads/cours/${imageName}`;
  }

  onImageError(event: any): void {
    event.target.src = '/assets/images/default-course.jpg';
  }

  editCours(id: string): void {
    if (!id) return;
    this.router.navigate(['/cours/edit', id]);
  }

  confirmDelete(): void {
    if (!this.cours?._id || !confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      return;
    }

    this.loading = true;
    this.coursService.deleteCours(this.cours._id).subscribe({
      next: () => {
        this.success = 'Cours supprimé avec succès';
        setTimeout(() => this.router.navigate(['/cours']), 1500);
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de la suppression';
        this.loading = false;
      }
    });
  }
  goToCalendar(): void {
  this.router.navigate(['/sessions/calendar']);
}
  goBack(): void {
    this.router.navigate(['/cours']);
  }
}
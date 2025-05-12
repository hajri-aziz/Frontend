import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CoursService } from 'src/app/services/cours.service';

@Component({
  selector: 'app-cours-detail',
  templateUrl: './cours-detail.component.html',
  styleUrls: ['./cours-detail.component.scss']
})
export class CoursDetailComponent implements OnInit {
  cours: any;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private coursService: CoursService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.coursService.getCoursById(id).subscribe({
        next: (data) => {
          this.cours = data;
        },
        error: () => {
          this.error = 'Erreur lors du chargement du cours';
        }
      });
    }
  }

  getImageUrl(): string {
  return this.cours?.image 
    ? `http://localhost:3000/uploads/cours/${this.cours.image.split('\\').pop()}` 
    : '/assets/images/default-course.jpg';
}

onImageError(event: any): void {
  event.target.src = '/assets/images/default-course.jpg';
}
confirmDelete(): void {
  if (confirm('Es-tu sûr de vouloir supprimer ce cours ?')) {
    this.coursService.deleteCours(this.cours._id).subscribe({
      next: () => this.router.navigate(['/courses']),
      error: () => this.error = 'Erreur lors de la suppression'
    });
  }
}


  goBack(): void {
    this.router.navigate(['/courses']);
  }
}

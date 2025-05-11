import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CoursService } from 'src/app/services/cours.service';
import { CoursCategory } from 'src/app/models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-category-detail',
  templateUrl: './category-detail.component.html',
  styleUrls: ['./category-detail.component.scss']

})
export class CategoryDetailComponent implements OnInit {
  categoryId!: string;
  category!: CoursCategory;
  loading = true;
  error = '';

  constructor
  (private route: ActivatedRoute, 
  private coursService: CoursService,
  private router: Router
) {}

  ngOnInit(): void {
  this.route.params.subscribe(params => {
    this.categoryId = params['id'];

    this.coursService.getCategoryById(this.categoryId).subscribe({
      next: (data) => {
        console.log('✅ Catégorie reçue :', data);
        this.category = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Erreur lors du chargement de la catégorie', err);
        this.error = 'Catégorie non trouvée.';
        this.loading = false;
      }
    });
  });
}

  confirmDelete() {
  this.coursService.deleteCategory(this.categoryId).subscribe({
    next: () => {
      alert('Catégorie supprimée ✅');
      this.router.navigate(['/categories']);
    },
    error: (err) => {
      this.error = 'Erreur lors de la suppression.';
    }
  });
}
  goToEdit() {
    this.router.navigate(['/categories/edit', this.categoryId]);
  }

  goToList() {
    this.router.navigate(['/categories']);
  }
}

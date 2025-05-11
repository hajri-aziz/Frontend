import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CoursService } from 'src/app/services/cours.service';
import { CoursCategory } from 'src/app/models';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html', 
  styleUrls: ['./category-list.component.scss']
})
export class CategoryListComponent implements OnInit {
  categories: CoursCategory[] = [];
  loading = true;
  error = '';

  constructor(private coursService: CoursService, private router: Router) {}

  ngOnInit(): void {
    this.coursService.getAllCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur de chargement des catégories.';
        this.loading = false;
      }
    });
  }

  goToDelete(id: string) {
    this.router.navigate(['/categories', id]); // redirection vers les détails
  }
}

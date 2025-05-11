import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CoursService } from 'src/app/services/cours.service';
import { CoursCategory } from 'src/app/models';

@Component({
  selector: 'app-category-edit',
  templateUrl: './category-edit.component.html',
  styleUrls: ['./category-edit.component.scss']
})
export class CategoryEditComponent implements OnInit {
  form!: FormGroup;
  categoryId!: string;
  loading = true;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private coursService: CoursService
  ) {}

  ngOnInit(): void {
    this.categoryId = this.route.snapshot.paramMap.get('id') || '';
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]]
    });

    this.coursService.getCategoryById(this.categoryId).subscribe({
      next: (category: CoursCategory) => {
        this.form.patchValue({
          title: category.title,
          description: category.description
        });
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Erreur : catégorie introuvable.';
        this.loading = false;
      }
    });
  }

  submitForm() {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.form.invalid) {
      this.errorMessage = 'Veuillez remplir correctement tous les champs.';
      return;
    }

    this.coursService.updateCategory(this.categoryId, this.form.value).subscribe({
      next: () => {
        this.successMessage = 'Catégorie mise à jour avec succès ✅';
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de la mise à jour : ' + err.message;
      }
    });
  }
}

  

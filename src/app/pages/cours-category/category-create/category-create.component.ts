import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CoursService } from 'src/app/services/cours.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-category-create',
  templateUrl: './category-create.component.html',
  styleUrls: ['./category-create.component.scss']
})
export class CategoryCreateComponent implements OnInit {
  form!: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private coursService: CoursService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  submitForm() {
    this.successMessage = '';
    this.errorMessage = '';
    this.isSubmitting = true;

    if (this.form.invalid) {
      this.errorMessage = 'Veuillez remplir correctement tous les champs.';
      this.isSubmitting = false;
      return;
    }

    this.coursService.createCategory(this.form.value).subscribe({
      next: (res) => {
        this.successMessage = 'Catégorie créée avec succès ✅';
        this.form.reset();
        this.isSubmitting = false;
        
        // Redirection vers la liste des catégories après 1.5 secondes
        setTimeout(() => {
          this.router.navigate(['/categories']);
        }, 1500);
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de la création : ' + err.message;
        this.isSubmitting = false;
      }
    });
  }

  // Méthode optionnelle pour redirection immédiate
  redirectToCategories() {
    this.router.navigate(['/categories']);
  }
}
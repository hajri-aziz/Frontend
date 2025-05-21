import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { CoursService } from 'src/app/services/cours.service';
import { CoursCategoryService } from 'src/app/services/cours-category.service';
import { CoursCategory } from 'src/app/models/cours-category.model';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-cours-edit',
  templateUrl: './cours-edit.component.html',
  styleUrls: ['./cours-edit.component.scss']
})
export class CoursEditComponent implements OnInit {
  coursForm!: FormGroup;
  loading = false;
  success = false;
  error = '';
  categories: CoursCategory[] = [];
  instructors: User[] = [];
  currentImage: string | null = null;
  coursId!: string;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private coursService: CoursService,
    private categoryService: CoursCategoryService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.coursId = this.route.snapshot.params['id'];
    
    // Initialisation du formulaire
    this.coursForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: [0, [Validators.required, Validators.min(0)]],
      currency: ['TND', Validators.required],
      category_id: ['', Validators.required],
      instructor_id: ['', Validators.required],
      image: [null]
    });

    // Charger les données du cours existant
    this.loadCoursData();

    // Charger les catégories
    this.categoryService.getAll().subscribe({
      next: (data) => (this.categories = data),
      error: () => (this.error = 'Erreur de chargement des catégories')
    });

    // Charger les instructeurs
    this.loadInstructors();
  }

  loadCoursData(): void {
    this.coursService.getCoursById(this.coursId).subscribe({
      next: (cours) => {
        this.coursForm.patchValue({
          title: cours.title,
          description: cours.description,
          price: cours.price,
          currency: cours.currency,
          category_id: cours.category_id,
          instructor_id: cours.instructor_id
        });
        
        if (cours.image) {
          this.currentImage = cours.image;
        }
      },
      error: () => {
        this.error = 'Erreur de chargement des données du cours';
      }
    });
  }

  loadInstructors(): void {
    this.http.get<User[]>('http://localhost:3000/user/showusers', {
      headers: new HttpHeaders({
        Authorization: `Bearer ${localStorage.getItem('token')}`
      })
    }).subscribe({
      next: (response: any) => {
        this.instructors = response.users.filter(
          (user: User) => user.role?.trim().toLowerCase() === 'instructor'
        );
      },
      error: (err) => {
        console.error("Erreur API instructeurs :", err);
        this.error = 'Erreur de chargement des instructeurs';
      }
    });
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.coursForm.patchValue({ image: file });
      // Aperçu de la nouvelle image
      const reader = new FileReader();
      reader.onload = () => {
        this.currentImage = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  submit(): void {
    if (this.coursForm.invalid) return;

    this.loading = true;
    const formData = new FormData();

    Object.entries(this.coursForm.value).forEach(([key, value]) => {
      if (value instanceof Blob || typeof value === 'string') {
        formData.append(key, value);
      } else if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    this.coursService.updateCours(this.coursId, formData).subscribe({
      next: () => {
        this.success = true;
        setTimeout(() => {
          this.router.navigate(['/cours']);
        }, 1500);
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de la mise à jour du cours';
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/cours']);
  }
}
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { CoursService } from 'src/app/services/cours.service';
import { CoursCategoryService } from 'src/app/services/cours-category.service';
import { CoursCategory } from 'src/app/models/cours-category.model';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-cours-create',
  templateUrl: './cours-create.component.html',
  styleUrls: ['./cours-create.component.scss']
})
export class CoursCreateComponent implements OnInit {
  coursForm!: FormGroup;
  loading = false;
  success = false;
  error = '';
  categories: CoursCategory[] = [];
  instructors: User[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private coursService: CoursService,
    private categoryService: CoursCategoryService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
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

    // Charger les catégories
    this.categoryService.getAll().subscribe({
      next: (data) => (this.categories = data),
      error: () => (this.error = 'Erreur de chargement des catégories')
    });

    // Charger les instructeurs (sans passer par UserService)
    const token = localStorage.getItem('token');
    console.log("🔑 Token trouvé:", token);
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<User[]>('http://localhost:3000/user/showusers', {
    headers: new HttpHeaders({
    Authorization: `Bearer ${localStorage.getItem('token')}`
  })
}).subscribe({
 next: (response: any) => {
  console.log("📦 TOUS LES UTILISATEURS :", response.users);
  this.instructors = response.users.filter(
    (user: User) => user.role?.trim().toLowerCase() === 'instructor'
  );
}
,
  error: (err) => {
    console.error("❌ Erreur API instructeurs :", err);
    this.error = 'Erreur de chargement des instructeurs';
  }
});

  }

  // Gestion de l'image
  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.coursForm.patchValue({ image: file });
    }
  }

  // Soumission
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

    this.coursService.createCours(formData).subscribe({
      next: () => {
        this.success = true;
        this.router.navigate(['/cours']);
      },
      error: () => {
        this.error = 'Erreur lors de la création du cours';
        this.loading = false;
      }
    });
  }
}

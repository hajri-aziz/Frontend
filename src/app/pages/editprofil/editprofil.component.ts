import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-editprofil',
  templateUrl: './editprofil.component.html'
})
export class EditprofilComponent implements OnInit {
  userForm: FormGroup;
  profileImageUrl: string | null = null;
  user: any;
  showPassword: boolean = false; 
  selectedFile: File | null = null;
  defaultImage = 'assets/images/default-avatar.png'; // Chemin vers une image par défaut

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      nom: [''],
      prenom: [''],
      email: [''],
      password: [''],
      dateNaissance: [''],
      telephone: [''],
      profileImage: ['']
    });
  }
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Vous devez être connecté pour modifier votre profil.');
      this.router.navigate(['/login']);
      return;
    }

    const userId = this.getUserIdFromToken(token);

    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        this.user = user;
        const dateNaissanceFormatted = new Date(user.dateNaissance).toISOString().split('T')[0];
        this.userForm.patchValue({
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          dateNaissance: dateNaissanceFormatted,
          telephone: user.telephone
        });

        // Gestion améliorée de l'image de profil
        this.profileImageUrl = user.profileImage 
          ? this.normalizeImageUrl(user.profileImage) 
          : this.defaultImage;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des données:', err);
        alert('Erreur lors de la récupération des données.');
      }
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      // Afficher un aperçu immédiat de la nouvelle image
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImageUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.userForm.invalid) {
      alert('Veuillez remplir correctement le formulaire');
      return;
    }

    const formData = new FormData();
    const formValue = this.userForm.value;
  
    // Ajout des champs au FormData
    Object.keys(formValue).forEach(key => {
      if (formValue[key] && key !== 'profileImage') {
        formData.append(key, formValue[key]);
      }
    });
  
    if (this.selectedFile) {
      formData.append('profileImage', this.selectedFile);
    }
  
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const userId = this.getUserIdFromToken(token);
  
    this.userService.updateUser(userId, formData).subscribe({
      next: (response) => {
        console.log('Profil mis à jour avec succès !', response);
        alert('Votre profil a été mis à jour.');
        
        // Mise à jour de l'image après upload
        if (response.profileImage) {
          this.profileImageUrl = this.normalizeImageUrl(response.profileImage);
        }
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour:', err);
        alert(`Erreur lors de la mise à jour: ${err.error?.message || err.message}`);
      }
    });
  }
  
  private getUserIdFromToken(token: string): string {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch (e) {
      console.error('Erreur de décodage du token', e);
      this.router.navigate(['/login']);
      return '';
    }
  }

  private normalizeImageUrl(imagePath: string): string {
    if (!imagePath) return this.defaultImage;
    
    // Si l'image est déjà une URL complète
    if (imagePath.startsWith('http')) return imagePath;
    
    // Nettoyage du chemin et construction de l'URL
    const cleanPath = imagePath.replace(/^\/+/, '').replace(/\\/g, '/');
    return `http://localhost:3000/${cleanPath}`;
  }
}
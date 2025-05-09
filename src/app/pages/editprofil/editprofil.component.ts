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
  profileImageUrl: string | null = null; // Pour stocker l'URL de l'image actuelle
  user: any; // Déclaration de la propriété user pour stocker les données de l'utilisateur

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
      profileImage: [null] // Champ pour l'image
    });
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
        this.user = user; // Initialisation de la propriété user avec les données récupérées
        const dateNaissanceFormatted = new Date(user.dateNaissance).toISOString().split('T')[0];
        this.userForm.patchValue({
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          dateNaissance: dateNaissanceFormatted,
          telephone: user.telephone
        });

        // Afficher l'image actuelle
        this.profileImageUrl = `http://localhost:3000/uploads/${user.profileImage}`;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des données de l\'utilisateur :', err);
        alert('Une erreur est survenue lors de la récupération des données.');
      }
    });
  }

  // Gérer la sélection d'un fichier image
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.profileImageUrl = reader.result as string; // Mise à jour de l'image à afficher
      };
      reader.readAsDataURL(file);  // Lire le fichier comme URL de données
      this.userForm.patchValue({ profileImage: file }); // Ajouter le fichier sélectionné au formulaire
    }
  }
  

  onSubmit() {
    const formData = new FormData();
    const formValue = this.userForm.value;
  
    // Ajout des autres données du formulaire
    formData.append('nom', formValue.nom);
    formData.append('prenom', formValue.prenom);
    formData.append('email', formValue.email);
    formData.append('password', formValue.password);
    formData.append('dateNaissance', formValue.dateNaissance);
    formData.append('telephone', formValue.telephone);
  
    // Ajout de l'image si elle est sélectionnée
    if (formValue.profileImage) {
      formData.append('profileImage', formValue.profileImage);
    }
  
    const token = localStorage.getItem('token');
    const userId = this.getUserIdFromToken(token!);
  
    this.userService.updateUser(userId, formData).subscribe({
      next: (response) => {
        console.log('Profil mis à jour avec succès !');
        alert('Votre profil a été mis à jour.');
  
        // Mise à jour de l'image de profil
        this.profileImageUrl = response.profileImage ? `http://localhost:3000/uploads/${response.profileImage}` : this.profileImageUrl;
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour du profil :', err);
        alert('Une erreur est survenue lors de la mise à jour.');
      }
    });
  }
  
  private getUserIdFromToken(token: string): string {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id;
  }
}

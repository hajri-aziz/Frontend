import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/services/user.service'; // Si vous utilisez un service pour ajouter un utilisateur.

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.scss']
})
export class CreateAccountComponent implements OnInit {
  createAccountForm!: FormGroup; // Formulaire de création d'utilisateur

  constructor(
    private fb: FormBuilder,
    private userService: UserService // Service pour ajouter un utilisateur
  ) {}

  ngOnInit(): void {
    this.createAccountForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      dateNaissance: ['', Validators.required],
      telephone: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]],
      role: ['', Validators.required], // Rôle par défaut 'user', peut être 'admin' si l'admin crée un utilisateur.
      isApproved: [false]
    });
  }

  // Méthode appelée lors de la soumission du formulaire
onAddUserSubmit(): void {
  const user = this.createAccountForm.value; // Récupère les données du formulaire
  console.log(user.isApproved);

    // Envoi des données du formulaire au service pour l'ajout d'utilisateur
    this.userService.register(user).subscribe(
      (response) => {
        console.log('Utilisateur ajouté avec succès:', response);
        // Réinitialiser le formulaire ou effectuer toute autre action (par exemple, redirection)
      },
      (error) => {
        console.error('Erreur lors de l\'ajout de l\'utilisateur:', error);
      }
    );
  }

  
}

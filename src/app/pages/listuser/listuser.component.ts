import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-listuser',
  templateUrl: './listuser.component.html'})
export class ListuserComponent implements OnInit {
  users: any[] = [];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (data: any) => {
        this.users = data.users;  // Assurez-vous que l'API renvoie la liste complète des utilisateurs
        console.log('Users récupérés :', this.users);
      },
      error: (err: any) => {
        console.error('Erreur lors de la récupération des utilisateurs :', err);
      }
    });
  }
  onEditUser(user: any) {
  console.log('Modifier utilisateur:', user);
  // Ouvre un formulaire ou une modale ici
}

onDeleteUser(user: any) {
  if (confirm(`Voulez-vous vraiment supprimer ${user.nom} ?`)) {
    // Appelle ton service pour supprimer
    console.log('Suppression confirmée pour:', user);
  }
}

}


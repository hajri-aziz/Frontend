import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { EditUserDialogComponent } from '../edit-user-dialog/edit-user-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Overlay } from '@angular/cdk/overlay';
import { DeleteConfirmationDialogComponent } from '../delete-confirmation-dialog/delete-confirmation-dialog.component';

@Component({
  selector: 'app-listuser',
  templateUrl: './listuser.component.html',
  styleUrls: ['./listuser.component.scss']
})
  
export class ListuserComponent implements OnInit {
  users: any[] = [];
  constructor(private userService: UserService, private dialog: MatDialog , private overlay: Overlay) {}

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
  document.body.style.overflow = 'hidden'; // Bloque le scroll

  const dialogRef = this.dialog.open(EditUserDialogComponent, {
    data: user,
  width: '400px',
  height: 'auto',
  disableClose: true
  });

  dialogRef.afterClosed().subscribe(result => {
    document.body.style.overflow = 'auto'; // Réactive le scroll après fermeture
    if (result) {
      this.loadUsers();
    }
  });
}

  onDeleteUser(user: any) {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      data: { userName: user.nom },
      width: '400px',
      height: 'auto',
      disableClose: true
    });
  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.userService.deleteUser(user._id).subscribe({
        next: (response: any) => {
          console.log(`Utilisateur ${user.nom} supprimé avec succès.`);
          this.loadUsers(); // Recharge la liste après suppression
        },
        error: (err: any) => {
          console.error(`Erreur lors de la suppression de ${user.nom} :`, err);
        }
      });
    }
  });
}



}


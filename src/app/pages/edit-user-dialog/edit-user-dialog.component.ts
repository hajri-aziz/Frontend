import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-edit-user-dialog',
  templateUrl: './edit-user-dialog.component.html',
})
export class EditUserDialogComponent implements OnInit {
  editForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    public dialogRef: MatDialogRef<EditUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.editForm = this.fb.group({
      nom: [this.data.nom],
      prenom: [this.data.prenom],
      email: [this.data.email]
    });
  }
  

  onSave(): void {
    const updatedUser = { ...this.data, ...this.editForm.value };

    this.userService.updateUser(this.data._id, updatedUser).subscribe({
      next: () => {
        this.dialogRef.close(updatedUser); // Renvoie les données modifiées
      },
      error: err => {
        console.error('Erreur lors de la mise à jour :', err);
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

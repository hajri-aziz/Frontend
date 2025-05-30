import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/user.model';
import { ToastService } from 'src/app/services/toast.service';

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
    public toastService: ToastService,
    @Inject(MAT_DIALOG_DATA) public data: User
  ) {}

  ngOnInit(): void {
    this.editForm = this.fb.group({
      email: [this.data.email, [Validators.required, Validators.email]],
      role: [this.data.role, Validators.required],
      isApproved: [this.data.isApproved, Validators.required]
    });
  }

  onSave(): void {
    if (this.editForm.invalid) {
      return;
    }

    const formData = new FormData();
    // Ajoutez seulement les champs nécessaires
    formData.append('email', this.editForm.value.email);
    formData.append('role', this.editForm.value.role);
    // Convertir le booléen en string si nécessaire
    formData.append('isApproved', this.editForm.value.isApproved.toString());

    console.log("Données envoyées :", {
      email: this.editForm.value.email,
      role: this.editForm.value.role,
      isApproved: this.editForm.value.isApproved
    });

    this.userService.updateUser(this.data._id!, formData).subscribe({
      next: (updatedUser) => {
        console.log('Mise à jour réussie', updatedUser);
        this.dialogRef.close(updatedUser);
        this.toastService.showSuccess('Utilisateur mis à jour avec succès !');
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour :', err);
        this.toastService.showError(err.error.message || 'Une erreur s\'est produite lors de la mise à jour de l\'utilisateur.');
        // Ajoutez ici un message d'erreur à l'utilisateur si nécessaire
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
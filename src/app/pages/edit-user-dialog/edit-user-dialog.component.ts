import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/user.model';

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
    @Inject(MAT_DIALOG_DATA) public data: User
  ) {}

  ngOnInit(): void {
    this.editForm = this.fb.group({
      
      email: [this.data.email],
      role: [this.data.role],
      isApproved: [this.data.isApproved]
    });
  }
  

  onSave(): void {
    const updatedUser: User = { ...this.data, ...this.editForm.value };

    const formData = new FormData();
    for (const key in updatedUser) {
      if (Object.prototype.hasOwnProperty.call(updatedUser, key)) {
        formData.append(key, (updatedUser as any)[key]); // 👈 cast en any ici
      }
    }
    console.log("Données envoyées :", this.editForm.value);
    this.userService.updateUser(this.data._id!, formData).subscribe({
      next: () => {
        this.dialogRef.close(updatedUser);
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour :', err);
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

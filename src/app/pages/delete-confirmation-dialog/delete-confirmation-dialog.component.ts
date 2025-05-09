import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-confirmation-dialog',
  templateUrl: './delete-confirmation-dialog.component.html',
  styleUrls: ['./delete-confirmation-dialog.component.scss']
})
export class DeleteConfirmationDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<DeleteConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { userName: string }
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true); // Fermer et confirmer la suppression
  }

  onCancel(): void {
    this.dialogRef.close(false); // Fermer et annuler la suppression
  }
}

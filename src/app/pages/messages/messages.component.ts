import { Component, OnInit } from '@angular/core';
import { DisponibiliteService, Message } from '../../services/disponibilite.service';
@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit {
  messages: Message[] = [];
  errorMessage: string | null = null;
  successMessage: string | null = null; // Add success message property

  constructor(private disponibiliteService: DisponibiliteService) {}

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages(): void {
    this.disponibiliteService.getMessages().subscribe({
      next: (messages) => {
        this.messages = messages;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de la récupération des messages.';
        console.error('Erreur:', error);
      }
    });
  }

  deleteMessage(id: string): void {
    this.errorMessage = null;
    this.successMessage = null;

    this.disponibiliteService.deleteMessage(id).subscribe({
      next: () => {
        this.messages = this.messages.filter(message => message._id !== id);
        this.successMessage = 'Message visiteur supprimé'; // Show success message
        // Optional: Clear the success message after 3 seconds
        setTimeout(() => {
          this.successMessage = null;
        }, 3000);
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de la suppression du message.';
        console.error('Erreur:', error);
      }
    });
  }
  
}
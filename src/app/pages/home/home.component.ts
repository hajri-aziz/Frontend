import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models';
import { UserService } from 'src/app/services/user.service';
import { PostService } from 'src/app/services/post.service';
import { Post } from 'src/app/models/post.models';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  // Psychiatres
  psychiatres: User[] = [];
  displayedPsychiatres: User[] = [];
  isLoading = true;
  errorMessage = '';
  profileImageUrl = 'assets/Ellipse 23.png';

  // Témoignages
  testimonialPosts: any[] = []; // Changé en any[] temporairement
  testimonialLoading = true;
  testimonialError = '';
  private readonly TESTIMONIAL_IDS = ['6826136e87d3b6b75b841e9b', '6838e4a77e785004343685b8'];

  constructor(
    private router: Router,
    private userService: UserService,
    private postService: PostService,
    private http: HttpClient

  ) {}

  ngOnInit(): void {
    this.loadPsychiatrists();
    this.loadTestimonials();
  }

  loadPsychiatrists(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.userService.getPsychiatristsList().subscribe({
      next: (psychiatres) => {
        this.displayedPsychiatres = psychiatres.slice(0, 3).map(psychiatre => ({
          ...psychiatre,
          profileImage: this.normalizeImageUrl(psychiatre.profileImage)
        }));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.errorMessage = 'Service temporairement indisponible';
        this.isLoading = false;
      }
    });
  }

  async loadTestimonials(): Promise<void> {
    this.testimonialLoading = true;
    this.testimonialError = '';
  
    try {
      const results = await Promise.allSettled(
        this.TESTIMONIAL_IDS.map(id =>
          this.postService.getPostByIdPublic(id).toPromise()
        )
      );
  
      this.testimonialPosts = results
        .filter(result => result.status === 'fulfilled' && !!result.value)
        .map(result => {
          const post = (result as PromiseFulfilledResult<Post>).value;
          return {
            contenu: post.contenu,
            
          };
        });
  
    } catch (error) {
      console.error('Erreur globale:', error);
      this.testimonialError = 'Erreur de chargement';
    } finally {
      this.testimonialLoading = false;
    }
  }
  
  
  private normalizeImageUrl(imagePath: string | undefined): string {
    if (!imagePath) return this.profileImageUrl;
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:3000/${imagePath.replace(/^\/+/, '').replace(/\\/g, '/')}`;
  }

  // Navigation methods...
  navigateToLogin() {
    this.router.navigate(['/login']);
  }
  
  navigatechat() {
    this.router.navigate(['/social-feed']);
  }
  
  navigate() {
    this.router.navigate(['/dispo-event']);
  }
  
  navigate1() {
    this.router.navigate(['/rendz-inscri']);
  }
}
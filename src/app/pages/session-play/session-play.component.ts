import { Component, OnInit } from '@angular/core';
import { ActivatedRoute }      from '@angular/router';
import { CoursSessionService } from 'src/app/services/cours-session.service';

@Component({
  selector: 'app-session-play',
  templateUrl: './session-play.component.html',
  styleUrls: ['./session-play.component.scss']
})
export class SessionPlayComponent implements OnInit {
  session: any;
  sessionId!: string;
  loading = true;
  error: string|null = null;
  embedUrl!: string;

  constructor(
    private route: ActivatedRoute,
    private sessions: CoursSessionService
  ) {}

  ngOnInit() {
    this.sessionId = this.route.snapshot.paramMap.get('id')!;
    this.sessions.getSessionById(this.sessionId).subscribe({
      next: data => {
        this.session = data;
        const videoId = this.extractYoutubeId(data.video_url);
        this.embedUrl = `https://www.youtube.com/embed/${videoId}`;
        this.loading = false;
      },
      error: err => {
        this.error = 'Impossible de charger la session';
        this.loading = false;
      }
    });
  }

  private extractYoutubeId(url: string): string {
    const m = url.match(/[?&]v=([^&]+)/);
    return m ? m[1] : '';
  }
}

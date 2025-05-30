import { Component, OnInit }       from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router }   from '@angular/router';
import { AuthSessionService }       from 'src/app/services/auth-session.service';
import { UserService }              from 'src/app/services/user.service';

@Component({
  selector: 'app-session-login',
  templateUrl: './session-login.component.html',
  styleUrls: ['./session-login.component.scss']
})
export class SessionLoginComponent implements OnInit {
  form!: FormGroup;
  sessionId!: string;
  error: string | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private authSession: AuthSessionService
  ) {}

  ngOnInit(): void {
    // Récupère sessionId depuis ?sessionId=...
    this.sessionId = this.route.snapshot.queryParamMap.get('sessionId') || '';
    this.form = this.fb.group({
      password: ['', Validators.required]
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = null;

    const pwd = this.form.value.password;
    this.authSession.sessionLogin(this.sessionId, pwd).subscribe({
      next: res => {
        // 1) stocke le JWT de session
        localStorage.setItem('sessionToken', res.tokenSession);
        // 2) redirige vers la session (vidéo ou player)
        window.location.href = res.accessLink;
      },
      error: err => {
        this.error = err.error?.message || 'Erreur de mot de passe';
        this.loading = false;
      }
    });
  }
}

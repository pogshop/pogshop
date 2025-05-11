import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {} from '@angular/fire/auth';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth-service.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  constructor(public authService: AuthService) {}

  ngOnInit(): void {}
}

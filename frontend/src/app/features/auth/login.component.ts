import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, CardModule, MessageModule],
    template: `
    <div class="min-h-screen flex items-center justify-center bg-green-50/30 py-12 px-4 sm:px-6 lg:px-8 font-primary">
      <p-card class="max-w-md w-full shadow-2xl border-none overflow-hidden rounded-3xl">
        <div class="p-4">
          <div class="text-center mb-10">
            <img src="/logo.png" alt="Kamela Logo" class="h-24 w-auto mx-auto mb-4 drop-shadow-md">
            <h2 class="text-3xl font-black text-green-900 tracking-tight">KAMELA PORTAL</h2>
            <p class="mt-3 text-sm text-green-700/70 font-medium uppercase tracking-widest">
              Secure Management Entrance
            </p>
          </div>

          <form (ngSubmit)="onSubmit()" class="space-y-6">
            <div class="space-y-4">
              <div class="flex flex-col gap-2">
                <label for="username" class="text-xs font-bold text-green-800 uppercase ml-1">Username</label>
                <div class="p-input-icon-left w-full">
                  <i class="pi pi-user text-green-500 z-10 ml-3"></i>
                  <input pInputText id="username" name="username" type="text" 
                         [(ngModel)]="username" placeholder="Enter your username"
                         class="w-full pl-10 h-12 rounded-xl border border-green-100 focus:border-green-500 transition-all">
                </div>
              </div>

              <div class="flex flex-col gap-2">
                <label for="password" class="text-xs font-bold text-green-800 uppercase ml-1">Password</label>
                <div class="p-input-icon-left w-full">
                  <i class="pi pi-lock text-green-500 z-10 ml-3"></i>
                  <input pInputText id="password" name="password" type="password" 
                         [(ngModel)]="password" placeholder="••••••••"
                         class="w-full pl-10 h-12 rounded-xl border border-green-100 focus:border-green-500 transition-all">
                </div>
              </div>
            </div>

            <p-message *ngIf="error" severity="error" [text]="error" styleClass="w-full rounded-xl"></p-message>

            <p-button type="submit" [loading]="loading" label="Sign In" 
                      styleClass="w-full h-14 bg-green-600 hover:bg-green-700 border-none rounded-xl text-lg font-bold shadow-lg shadow-green-100 transition-all transform active:scale-95">
            </p-button>

            <div class="text-center">
              <span class="text-xs text-green-800/40 font-semibold">AUTHORIZED ACCESS ONLY</span>
            </div>
          </form>
        </div>
      </p-card>
    </div>
  `
})
export class LoginComponent {
    username = '';
    password = '';
    loading = false;
    error = '';

    private authService = inject(AuthService);
    private router = inject(Router);

    onSubmit() {
        this.loading = true;
        this.error = '';
        this.authService.login({ username: this.username, password: this.password }).subscribe({
            next: () => {
                this.router.navigate(['/']);
            },
            error: () => {
                this.error = 'Invalid username or password';
                this.loading = false;
            }
        });
    }
}

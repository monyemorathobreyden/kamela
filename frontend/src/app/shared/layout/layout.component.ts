import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
    template: `
    <div class="min-h-screen bg-green-50/50 flex flex-col">
      <!-- Header -->
      <header class="bg-white border-b border-green-100 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div class="flex items-center space-x-10">
            <div class="flex items-center space-x-3 cursor-pointer" routerLink="/">
              <img src="/logo.png" alt="Kamela Logo" class="h-12 w-auto object-contain">
              <span class="text-2xl font-black tracking-tight text-green-800">KAMELA</span>
            </div>
            <nav class="hidden md:flex space-x-6">
              <a routerLink="/clients" routerLinkActive="text-green-600 border-b-2 border-green-500" class="flex items-center space-x-2 py-5 text-slate-600 hover:text-green-600 font-semibold transition-all">
                <i class="pi pi-users text-lg"></i>
                <span>Clients</span>
              </a>
              <a routerLink="/loans" routerLinkActive="text-green-600 border-b-2 border-green-500" class="flex items-center space-x-2 py-5 text-slate-600 hover:text-green-600 font-semibold transition-all">
                <i class="pi pi-book text-lg"></i>
                <span>Loan Book</span>
              </a>
              <a routerLink="/statistics" routerLinkActive="text-green-600 border-b-2 border-green-500" class="flex items-center space-x-2 py-5 text-slate-600 hover:text-green-600 font-semibold transition-all">
                <i class="pi pi-chart-bar text-lg"></i>
                <span>Statistics</span>
              </a>
              <a *ngIf="user?.role === 'Admin'" routerLink="/users" routerLinkActive="text-green-600 border-b-2 border-green-500" class="flex items-center space-x-2 py-5 text-slate-600 hover:text-green-600 font-semibold transition-all">
                <i class="pi pi-shield text-lg"></i>
                <span>Users</span>
              </a>
            </nav>
          </div>
          <div class="flex items-center space-x-6">
            <div class="flex flex-col items-end">
              <span class="text-sm font-bold text-green-900">{{ user?.username }}</span>
              <span class="text-xs text-green-600 uppercase tracking-widest font-medium">{{ user?.role }}</span>
            </div>
            <button (click)="logout()" class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
              <i class="pi pi-power-off text-xl"></i>
            </button>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="bg-white border-t border-green-100 py-6">
        <div class="max-w-7xl mx-auto px-4 flex justify-between items-center text-green-800/60 text-xs font-medium">
          <div>&copy; 2024 Kamela Payday Loan. All rights reserved.</div>
          <div class="flex space-x-4">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  `
})
export class LayoutComponent {
    private authService = inject(AuthService);
    user = this.authService.currentUserValue;

    logout() {
        this.authService.logout();
    }
}

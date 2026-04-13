import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { AuthResponse, User } from '../models';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);
    private apiUrl = 'http://localhost:8080/auth';

    private currentUserSubject = new BehaviorSubject<User | null>(null);
    currentUser$ = this.currentUserSubject.asObservable();

    constructor() {
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const decoded: any = jwtDecode(token);
                const user: User = {
                    id: decoded.user_id,
                    username: '', // Username not in token payload currently, but could be added
                    role: decoded.role
                };
                this.currentUserSubject.next(user);
            } catch (e) {
                localStorage.removeItem('access_token');
            }
        }
    }

    login(credentials: { username: string; password: string }): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
            tap(response => {
                localStorage.setItem('access_token', response.access_token);
                localStorage.setItem('refresh_token', response.refresh_token);
                this.currentUserSubject.next(response.user);
            })
        );
    }

    logout() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        this.currentUserSubject.next(null);
        this.router.navigate(['/auth/login']);
    }

    get isLoggedIn(): boolean {
        return !!localStorage.getItem('access_token');
    }

    get currentUserValue(): User | null {
        return this.currentUserSubject.value;
    }
}

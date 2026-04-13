import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client, Loan, ApplyLoanResponse, User } from '../models';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private http = inject(HttpClient);
    private baseUrl = 'http://localhost:8080';

    // Client Methods
    getClients(): Observable<Client[]> {
        return this.http.get<Client[]>(`${this.baseUrl}/clients`);
    }

    getClient(id: string): Observable<Client> {
        return this.http.get<Client>(`${this.baseUrl}/clients/${id}`);
    }

    createClient(client: Client): Observable<Client> {
        return this.http.post<Client>(`${this.baseUrl}/clients`, client);
    }

    updateClient(id: string, client: Partial<Client>): Observable<any> {
        return this.http.put(`${this.baseUrl}/clients/${id}`, client);
    }

    // Loan Methods
    getLoans(clientId?: string): Observable<Loan[]> {
        let params: any = {};
        if (clientId) {
            params['client_id'] = clientId;
        }
        return this.http.get<Loan[]>(`${this.baseUrl}/loans`, { params });
    }

    applyLoan(payload: { client_id: string; principal: number; repayment_date: string }): Observable<ApplyLoanResponse> {
        return this.http.post<ApplyLoanResponse>(`${this.baseUrl}/loans/apply`, payload);
    }

    updateLoanStatus(id: string, status: string): Observable<any> {
        return this.http.put(`${this.baseUrl}/loans/${id}/status`, { status });
    }

    uploadDocument(file: File): Observable<{ url: string }> {
        const formData = new FormData();
        formData.append('document', file);
        return this.http.post<{ url: string }>(`${this.baseUrl}/clients/upload`, formData);
    }

    // User Management
    getUsers(): Observable<User[]> {
        return this.http.get<User[]>(`${this.baseUrl}/users/`);
    }

    createUser(user: any): Observable<User> {
        return this.http.post<User>(`${this.baseUrl}/users/register`, user);
    }

    getStatistics(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/loans/statistics`);
    }
}

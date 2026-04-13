import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './shared/layout/layout.component';

export const routes: Routes = [
    {
        path: 'auth/login',
        loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
    },
    {
        path: '',
        component: LayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'clients', pathMatch: 'full' },
            {
                path: 'clients',
                loadComponent: () => import('./features/clients/client-list.component').then(m => m.ClientListComponent)
            },
            {
                path: 'clients/new',
                loadComponent: () => import('./features/clients/client-form.component').then(m => m.ClientFormComponent)
            },
            {
                path: 'clients/:id',
                loadComponent: () => import('./features/clients/client-form.component').then(m => m.ClientFormComponent)
            },
            {
                path: 'loans',
                loadComponent: () => import('./features/loans/loan-list.component').then(m => m.LoanListComponent)
            },
            {
                path: 'users',
                loadComponent: () => import('./features/users/user-list.component').then(m => m.UserListComponent)
            },
            {
                path: 'users/new',
                loadComponent: () => import('./features/users/user-form.component').then(m => m.UserFormComponent)
            },
            {
                path: 'statistics',
                loadComponent: () => import('./features/statistics/statistics.component').then(m => m.StatisticsComponent)
            }
        ]
    },
    { path: '**', redirectTo: '' }
];

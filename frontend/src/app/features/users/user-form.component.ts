import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-user-form',
    standalone: true,
    providers: [MessageService],
    imports: [
        CommonModule, 
        FormsModule, 
        ButtonModule, 
        InputTextModule, 
        SelectModule, 
        FloatLabelModule,
        CardModule,
        ToastModule
    ],
    template: `
    <div class="max-w-2xl mx-auto animate-fade-in">
      <div class="mb-10 flex items-center justify-between bg-white p-6 rounded-2xl border border-green-100 shadow-sm">
        <div>
          <h2 class="text-3xl font-black text-green-900 tracking-tight">Create User</h2>
          <p class="text-green-700/60 font-medium italic">Provision a new Admin or Support profile</p>
        </div>
        <p-button icon="pi pi-times" [rounded]="true" [text]="true" severity="secondary" (click)="onCancel()"></p-button>
      </div>

      <p-toast></p-toast>
      <form #userForm="ngForm" (ngSubmit)="onSubmit(userForm)" class="space-y-8">
        <p-card styleClass="shadow-xl border-none rounded-3xl overflow-hidden p-8">
          <div class="space-y-10">
            <div class="flex flex-col gap-8">
              <p-floatlabel variant="on">
                <input pInputText id="username" name="username" [(ngModel)]="user.username" required class="w-full h-12 rounded-xl border-green-100">
                <label for="username">Username *</label>
              </p-floatlabel>

              <p-floatlabel variant="on">
                <input pInputText type="password" id="password" name="password" [(ngModel)]="user.password" required minlength="6" class="w-full h-12 rounded-xl border-green-100">
                <label for="password">Password (Min 6 chars) *</label>
              </p-floatlabel>

              <p-floatlabel variant="on">
                <p-select id="role" name="role" [(ngModel)]="user.role" [options]="roleOptions"
                           optionLabel="label" optionValue="value" styleClass="w-full h-12 rounded-xl border-green-100 flex items-center">
                </p-select>
                <label for="role">User Role *</label>
              </p-floatlabel>
            </div>

            <div class="pt-10 flex justify-end gap-4 border-t border-green-50">
              <p-button label="Cancel" severity="secondary" [text]="true" (click)="onCancel()" styleClass="rounded-xl px-10"></p-button>
              <p-button type="submit" label="Provision Account" icon="pi pi-check" [disabled]="userForm.invalid"
                       styleClass="bg-green-600 hover:bg-green-700 border-none rounded-xl font-bold shadow-lg shadow-green-100 px-10 py-4">
              </p-button>
            </div>
          </div>
        </p-card>
      </form>
    </div>
    `
})
export class UserFormComponent {
    user = {
        username: '',
        password: '',
        role: 'Support'
    };

    roleOptions = [
        { label: 'Administrator', value: 'Admin' },
        { label: 'Support Staff', value: 'Support' }
    ];

    private apiService = inject(ApiService);
    private router = inject(Router);
    private messageService = inject(MessageService);

    onSubmit(form: any) {
        if (form.invalid) return;

        this.apiService.createUser(this.user).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User created successfully' });
                setTimeout(() => this.router.navigate(['/users']), 1000);
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.error || 'Registration failed' });
            }
        });
    }

    onCancel() {
        this.router.navigate(['/users']);
    }
}

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { User } from '../../core/models';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

@Component({
    selector: 'app-user-list',
    standalone: true,
    imports: [CommonModule, RouterLink, TableModule, ButtonModule, TagModule],
    template: `
    <div class="space-y-8 animate-fade-in">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-green-100 shadow-sm">
        <div>
          <h2 class="text-3xl font-black text-green-900 tracking-tight">System Users</h2>
          <p class="text-green-700/60 font-medium">Manage administrative and support staff profiles</p>
        </div>
        <p-button label="Create New User" icon="pi pi-user-plus" [routerLink]="['/users/new']"
                 styleClass="bg-green-600 hover:bg-green-700 border-none rounded-xl font-bold shadow-lg shadow-green-100 text-sm h-12">
        </p-button>
      </div>

      <div class="bg-white p-1 rounded-2xl border border-green-100 shadow-xl overflow-hidden">
        <p-table [value]="users" [rows]="10" [paginator]="true" 
                styleClass="p-datatable-gridlines p-datatable-sm rounded-xl overflow-hidden"
                [responsiveLayout]="'scroll'">
          <ng-template pTemplate="header">
            <tr class="bg-green-50/50">
              <th pSortableColumn="username" class="text-green-900 font-bold py-4">Username <p-sortIcon field="username"></p-sortIcon></th>
              <th pSortableColumn="role" class="text-green-900 font-bold">Role <p-sortIcon field="role"></p-sortIcon></th>
              <th class="text-green-900 font-bold">Created At</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-user>
            <tr class="hover:bg-green-50/30 transition-all border-green-50">
              <td class="py-4 px-4 font-semibold text-green-900">{{ user.username }}</td>
              <td>
                <p-tag [value]="user.role" [severity]="user.role === 'Admin' ? 'danger' : 'info'" 
                       styleClass="rounded-lg text-[10px] uppercase font-black px-3 py-1"></p-tag>
              </td>
              <td class="text-green-800/60 text-xs">{{ user.created_at | date:'medium' }}</td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>
    `
})
export class UserListComponent implements OnInit {
    users: User[] = [];
    private apiService = inject(ApiService);

    ngOnInit() {
        this.apiService.getUsers().subscribe(users => this.users = users);
    }
}

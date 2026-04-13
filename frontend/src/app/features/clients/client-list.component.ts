import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Client } from '../../core/models';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    selector: 'app-client-list',
    standalone: true,
    imports: [
        CommonModule, 
        RouterLink, 
        TableModule, 
        ButtonModule, 
        TagModule, 
        IconFieldModule, 
        InputIconModule, 
        InputTextModule,
        TooltipModule
    ],
    template: `
    <div class="space-y-8 animate-fade-in">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-green-100 shadow-sm">
        <div>
          <h2 class="text-3xl font-black text-green-900 tracking-tight">Clients</h2>
          <p class="text-green-700/60 font-medium">Manage and monitor borrower profiles and socio-economic data</p>
        </div>
        <p-button label="Add New Client" icon="pi pi-plus" [routerLink]="['/clients/new']"
                 styleClass="bg-green-600 hover:bg-green-700 border-none rounded-xl font-bold shadow-lg shadow-green-100 text-sm h-12">
        </p-button>
      </div>

      <div class="bg-white p-1 rounded-2xl border border-green-100 shadow-xl overflow-hidden">
        <p-table [value]="clients" [rows]="10" [paginator]="true" 
                [globalFilterFields]="['first_name', 'last_name', 'identity_number']"
                styleClass="p-datatable-gridlines p-datatable-sm rounded-xl overflow-hidden"
                [responsiveLayout]="'scroll'"
                #dt>
          <ng-template pTemplate="header">
            <tr class="bg-green-50/50">
              <th pSortableColumn="first_name" class="text-green-900 font-bold py-4">Name <p-sortIcon field="first_name"></p-sortIcon></th>
              <th pSortableColumn="identity_number" class="text-green-900 font-bold">Identity ID <p-sortIcon field="identity_number"></p-sortIcon></th>
              <th pSortableColumn="salary" class="text-green-900 font-bold">Salary <p-sortIcon field="salary"></p-sortIcon></th>
              <th pSortableColumn="employment_type" class="text-green-900 font-bold">Employment <p-sortIcon field="employment_type"></p-sortIcon></th>
              <th class="text-green-900 font-bold text-center">Docs</th>
              <th class="text-green-900 font-bold text-center">Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-client>
            <tr class="hover:bg-green-50/30 transition-all border-green-50">
              <td class="py-4 px-4 font-semibold text-green-900">
                {{ client.first_name }} {{ client.last_name }}
                <div class="text-[10px] text-green-600 font-medium opacity-60 uppercase tracking-tighter">{{ client.workplace_address }}</div>
              </td>
              <td class="text-green-800/80 font-mono text-xs">{{ client.identity_number }}</td>
              <td class="font-black text-green-700">{{ client.salary | currency }}</td>
              <td>
                <p-tag [value]="client.employment_type" [severity]="getSeverity(client.employment_type)" 
                       styleClass="rounded-lg text-[10px] uppercase font-black px-3 py-1"></p-tag>
              </td>
              <td class="text-center">
                <div class="flex justify-center gap-1">
                  <p-button *ngIf="client.identity_doc_url" icon="pi pi-id-card" [rounded]="true" [text]="true" severity="secondary" 
                           (click)="downloadDoc(client.identity_doc_url)" pTooltip="ID Document" styleClass="w-8 h-8"></p-button>
                  <p-button *ngIf="client.salary_advice_url" icon="pi pi-file-excel" [rounded]="true" [text]="true" severity="secondary" 
                           (click)="downloadDoc(client.salary_advice_url)" pTooltip="Salary Advice" styleClass="w-8 h-8"></p-button>
                  <p-button *ngIf="client.selfie_url" icon="pi pi-camera" [rounded]="true" [text]="true" severity="secondary" 
                           (click)="downloadDoc(client.selfie_url)" pTooltip="Selfie" styleClass="w-8 h-8"></p-button>
                  <span *ngIf="!client.identity_doc_url && !client.salary_advice_url && !client.selfie_url" class="text-[10px] text-green-300 italic">No Docs</span>
                </div>
              </td>
              <td class="text-center">
                <div class="flex justify-center gap-2">
                  <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" severity="success"
                           [routerLink]="['/clients', client.id]" pTooltip="Edit Client"></p-button>
                  <p-button icon="pi pi-briefcase" [rounded]="true" [text]="true" severity="info"
                           [routerLink]="['/loans']" [queryParams]="{clientId: client.id}" pTooltip="View Loans"></p-button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="5" class="text-center py-20 text-green-800/40 italic font-bold">
                No borrowers found in the system.
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>
    `,
    styles: [`
        :host ::ng-deep .p-paginator {
            background: transparent;
            border: none;
            padding: 1rem;
        }
        :host ::ng-deep .p-datatable-header {
            background: transparent;
            border: none;
        }
    `]
})
export class ClientListComponent implements OnInit {
    clients: Client[] = [];
    baseUrl = 'http://localhost:8080';
    private apiService = inject(ApiService);

    ngOnInit() {
        this.apiService.getClients().subscribe(clients => this.clients = clients);
    }

    downloadDoc(path: string) {
        window.open(this.baseUrl + path, '_blank');
    }

    getSeverity(type: string): "success" | "secondary" | "info" | "warn" | "danger" {
        switch (type) {
            case 'Permanent': return 'success';
            case 'Contract': return 'info';
            case 'Temporary': return 'warn';
            default: return 'secondary';
        }
    }
}

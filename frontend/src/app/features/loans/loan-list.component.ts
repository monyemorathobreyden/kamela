import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Client, Loan, ApplyLoanResponse } from '../../core/models';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { FloatLabelModule } from 'primeng/floatlabel';

@Component({
    selector: 'app-loan-list',
    standalone: true,
    imports: [
        CommonModule, 
        FormsModule, 
        TableModule, 
        ButtonModule, 
        DialogModule, 
        SelectModule, 
        InputNumberModule, 
        DatePickerModule, 
        TagModule,
        MessageModule,
        FloatLabelModule
    ],
    template: `
    <div class="space-y-8 animate-fade-in">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-green-100 shadow-sm">
        <div>
          <h2 class="text-3xl font-black text-green-900 tracking-tight">Loan Book</h2>
          <p class="text-green-700/60 font-medium">Global ledger of active credit facilities and historical performance</p>
        </div>
        <p-button label="Apply for Loan" icon="pi pi-bolt" (click)="showApplyForm = true"
                 styleClass="bg-green-600 hover:bg-green-700 border-none rounded-xl font-bold shadow-lg shadow-green-100 h-12">
        </p-button>
      </div>

      <!-- Application Dialog -->
      <p-dialog [(visible)]="showApplyForm" [modal]="true" [header]="'Create New Loan Instance'" 
                [style]="{width: '500px'}" styleClass="rounded-3xl border-none shadow-2xl overflow-hidden"
                (onHide)="applicationResult = null">
        <div *ngIf="applicationResult" class="p-4 rounded-2xl mb-4 border" 
             [ngClass]="applicationResult.decision.approved ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'">
          <div class="flex items-center gap-3 mb-4">
            <i class="pi" [ngClass]="applicationResult.decision.approved ? 'pi-check-circle' : 'pi-times-circle'" style="font-size: 1.5rem"></i>
            <span class="text-lg font-black uppercase tracking-tight">{{ applicationResult.decision.approved ? 'Approved' : 'Declined' }}</span>
          </div>
          <div class="space-y-2 text-sm font-medium">
            <p>{{ applicationResult.message }}</p>
            <div class="flex items-center gap-2 pt-2 border-t border-current opacity-20">
              <span>Risk Score: <span class="font-black">{{ applicationResult.decision.score }}/1000</span></span>
            </div>
          </div>
          <p-button label="Dismiss & Refresh Ledger" (click)="closeResult()" 
                   styleClass="w-full mt-6 bg-green-800 hover:bg-green-900 border-none rounded-xl font-bold"></p-button>
        </div>

        <form *ngIf="!applicationResult" (ngSubmit)="applyForLoan()" class="space-y-8 pt-4">
          <div class="space-y-6">
            <p-floatlabel variant="on">
              <p-select [options]="clients" [(ngModel)]="newLoan.client_id" name="clientId"
                        optionLabel="first_name" optionValue="id" styleClass="w-full h-12 rounded-xl flex items-center">
                <ng-template let-client pTemplate="item">
                  <div class="flex flex-col">
                    <span class="font-bold">{{ client.first_name }} {{ client.last_name }}</span>
                    <span class="text-xs opacity-50">{{ client.identity_number }}</span>
                  </div>
                </ng-template>
              </p-select>
              <label>Target Borrower</label>
            </p-floatlabel>

            <p-floatlabel variant="on">
              <p-inputNumber id="principal" name="principal" [(ngModel)]="newLoan.principal" mode="currency" currency="USD" locale="en-US"
                             inputStyleClass="w-full h-12 rounded-xl" styleClass="w-full"></p-inputNumber>
              <label for="principal">Requested Principal</label>
            </p-floatlabel>

            <p-floatlabel variant="on">
              <p-datePicker id="repayment" name="repayment" [(ngModel)]="repaymentDateObj" [showIcon]="true"
                             inputStyleClass="w-full h-12 rounded-xl" styleClass="w-full"></p-datePicker>
              <label for="repayment">Repayment Commitment Date</label>
            </p-floatlabel>
          </div>

          <p-button type="submit" [loading]="loading" label="Execute Application" icon="pi pi-send"
                    styleClass="w-full h-14 bg-green-600 hover:bg-green-700 border-none rounded-xl font-black shadow-lg shadow-green-100"></p-button>
        </form>
      </p-dialog>

      <!-- Ledger Table -->
      <div class="bg-white p-1 rounded-2xl border border-green-100 shadow-xl overflow-hidden">
        <p-table [value]="loans" [rows]="10" [paginator]="true" 
                styleClass="p-datatable-sm p-datatable-gridlines"
                [responsiveLayout]="'scroll'">
          <ng-template pTemplate="header">
            <tr class="bg-green-50/50">
              <th class="py-4 text-green-900 font-bold">Borrower</th>
              <th class="text-green-900 font-bold">Principal</th>
              <th class="text-green-900 font-bold">Total Liability</th>
              <th class="text-green-900 font-bold">Maturity Date</th>
              <th class="text-green-900 font-bold text-center">Status</th>
              <th class="text-green-900 font-bold text-center w-48">Workflow</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-loan>
            <tr class="hover:bg-green-50/30 transition-all border-green-50">
              <td class="py-4 px-4 font-semibold text-green-900 cursor-pointer" (click)="selectedClientId = loan.client_id; loadLoans()">
                {{ getClientName(loan.client_id) }}
              </td>
              <td class="font-bold text-green-800">{{ loan.principal | currency }}</td>
              <td class="text-sm font-medium">
                {{ (loan.principal + loan.interest + loan.admin_fee) | currency }}
                <div class="text-[10px] text-green-600/50 uppercase font-black">Incl. {{ loan.interest | currency }} Interest</div>
              </td>
              <td class="text-xs font-mono font-bold text-green-700">{{ loan.repayment_date | date:'MMM d, y' }}</td>
              <td class="text-center">
                <p-tag [value]="loan.status" [severity]="getStatusSeverity(loan.status)"
                       styleClass="rounded-lg text-[10px] uppercase font-black px-3 py-1"></p-tag>
              </td>
              <td class="text-center">
                <p-select [options]="statusOptions" (onChange)="updateStatus(loan.id!, $event.value)"
                          placeholder="Change Status" styleClass="text-xs h-8 rounded-lg border-green-100 w-full"></p-select>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>
  `
})
export class LoanListComponent implements OnInit {
    loans: Loan[] = [];
    clients: Client[] = [];
    selectedClientId: string = '';
    showApplyForm = false;
    loading = false;
    applicationResult: ApplyLoanResponse | null = null;
    newLoan = { client_id: '', principal: 0, repayment_date: '' };
    repaymentDateObj: Date | null = null;

    statusOptions = [
        { label: 'Active', value: 'Active' },
        { label: 'Fully Paid', value: 'Fully Paid' },
        { label: 'Missed Repayment', value: 'Missed Repayment' }
    ];

    private apiService = inject(ApiService);
    private route = inject(ActivatedRoute);

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            this.selectedClientId = params['clientId'] || '';
            this.loadLoans();
        });
        this.apiService.getClients().subscribe(clients => this.clients = clients);
    }

    loadLoans() {
        this.apiService.getLoans(this.selectedClientId).subscribe(loans => this.loans = loans);
    }

    getClientName(id: string) {
        const client = this.clients.find(c => c.id === id);
        return client ? `${client.first_name} ${client.last_name}` : 'Unknown';
    }

    applyForLoan() {
        if (this.repaymentDateObj) {
            this.newLoan.repayment_date = this.repaymentDateObj.toISOString();
        }
        this.loading = true;
        this.apiService.applyLoan(this.newLoan).subscribe({
            next: (res) => {
                this.applicationResult = res;
                this.loading = false;
            },
            error: (err) => {
                alert(err.error?.error || 'Failed to apply for loan');
                this.loading = false;
            }
        });
    }

    closeResult() {
        this.applicationResult = null;
        this.showApplyForm = false;
        this.loadLoans();
    }

    updateStatus(id: string, status: string) {
        if (status) {
            this.apiService.updateLoanStatus(id, status).subscribe(() => this.loadLoans());
        }
    }

    getStatusSeverity(status: string): "success" | "secondary" | "info" | "warn" | "danger" {
        switch (status) {
            case 'Active': return 'info';
            case 'Fully Paid': return 'success';
            case 'Missed Repayment': return 'danger';
            case 'Pending': return 'warn';
            case 'Rejected': return 'danger';
            default: return 'secondary';
        }
    }
}

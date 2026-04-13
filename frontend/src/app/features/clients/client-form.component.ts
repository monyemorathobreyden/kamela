import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Client } from '../../core/models';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CardModule } from 'primeng/card';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-client-form',
    standalone: true,
    providers: [MessageService],
    imports: [
        CommonModule, 
        FormsModule, 
        ButtonModule, 
        InputTextModule, 
        InputNumberModule, 
        SelectModule, 
        FloatLabelModule,
        CardModule,
        FileUploadModule,
        ToastModule
    ],
    template: `
    <div class="max-w-4xl mx-auto animate-fade-in">
      <div class="mb-10 flex items-center justify-between bg-white p-6 rounded-2xl border border-green-100 shadow-sm">
        <div>
          <h2 class="text-3xl font-black text-green-900 tracking-tight">{{ isEdit ? 'Edit Borrower' : 'New Borrower' }}</h2>
          <p class="text-green-700/60 font-medium italic">Complete the socio-economic profile for credit scoring</p>
        </div>
        <p-button icon="pi pi-times" [rounded]="true" [text]="true" severity="secondary" (click)="onCancel()"></p-button>
      </div>

      <p-toast></p-toast>
      <form #clientForm="ngForm" (ngSubmit)="onSubmit(clientForm)" class="space-y-8">
        <p-card styleClass="shadow-xl border-none rounded-3xl overflow-hidden p-4">
          <div class="space-y-10">
            <!-- Section: Personal Identity -->
            <div>
              <h3 class="flex items-center text-green-800 font-black uppercase tracking-widest text-sm mb-8">
                <i class="pi pi-id-card mr-3 text-lg bg-green-100 p-2 rounded-lg"></i>
                Personal Identity
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="flex flex-col gap-2">
                  <p-floatlabel variant="on">
                    <input pInputText id="first_name" name="first_name" [(ngModel)]="client.first_name" #firstName="ngModel" required class="w-full h-12 rounded-xl border-green-100">
                    <label for="first_name">First Name *</label>
                  </p-floatlabel>
                  <small *ngIf="firstName.invalid && (firstName.dirty || firstName.touched)" class="text-red-500 font-medium ml-1 text-[10px]">Required</small>
                </div>

                <div class="flex flex-col gap-2">
                  <p-floatlabel variant="on">
                    <input pInputText id="last_name" name="last_name" [(ngModel)]="client.last_name" #lastName="ngModel" required class="w-full h-12 rounded-xl border-green-100">
                    <label for="last_name">Last Name *</label>
                  </p-floatlabel>
                  <small *ngIf="lastName.invalid && (lastName.dirty || lastName.touched)" class="text-red-500 font-medium ml-1 text-[10px]">Required</small>
                </div>

                <div class="flex flex-col gap-2">
                  <p-floatlabel variant="on">
                    <input pInputText id="identity_number" name="identity_number" [(ngModel)]="client.identity_number" #idNum="ngModel" required 
                           [disabled]="isEdit" class="w-full h-12 rounded-xl border-green-100 font-mono">
                    <label for="identity_number">Identity ID *</label>
                  </p-floatlabel>
                  <small *ngIf="idNum.invalid && (idNum.dirty || idNum.touched)" class="text-red-500 font-medium ml-1 text-[10px]">Required</small>
                </div>

                <div class="flex flex-col gap-2">
                  <p-floatlabel variant="on">
                    <p-inputNumber id="nqf_level" name="nqf_level" [(ngModel)]="client.nqf_level" [min]="1" [max]="10" required
                                   [showButtons]="true" buttonLayout="horizontal" spinnerMode="horizontal"
                                   incrementButtonIcon="pi pi-plus" decrementButtonIcon="pi pi-minus"
                                   inputStyleClass="w-full h-12 rounded-xl border-green-100 text-center"
                                   styleClass="w-full">
                    </p-inputNumber>
                    <label for="nqf_level">NQF Level *</label>
                  </p-floatlabel>
                </div>
              </div>
            </div>

            <!-- Section: Documents -->
            <div class="pt-8 border-t border-green-50">
              <h3 class="flex items-center text-green-800 font-black uppercase tracking-widest text-sm mb-8">
                <i class="pi pi-file-pdf mr-3 text-lg bg-green-100 p-2 rounded-lg"></i>
                Required Documents (All Mandatory)
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div class="flex flex-col gap-3">
                  <span class="text-[10px] font-black text-green-700 uppercase tracking-tighter">Identity (ID/Passport) *</span>
                  <p-fileUpload mode="basic" name="document" chooseLabel="Upload" [auto]="true" 
                                class="w-full" (onUpload)="onDocUpload($event, 'identity')" 
                                styleClass="w-full bg-green-50 border-green-100 text-green-700 font-bold"
                                [url]="baseUrl + '/clients/upload'" [withCredentials]="true">
                  </p-fileUpload>
                  <div *ngIf="client.identity_doc_url" class="flex items-center text-[10px] text-green-600 bg-green-50/50 p-2 rounded-lg border border-green-100 mt-1">
                    <i class="pi pi-check-circle mr-2"></i> ID READY
                  </div>
                </div>

                <div class="flex flex-col gap-3">
                  <span class="text-[10px] font-black text-green-700 uppercase tracking-tighter">Salary Advice/Payslip *</span>
                  <p-fileUpload mode="basic" name="document" chooseLabel="Upload" [auto]="true" 
                                class="w-full" (onUpload)="onDocUpload($event, 'salary')"
                                styleClass="w-full bg-green-50 border-green-100 text-green-700 font-bold"
                                [url]="baseUrl + '/clients/upload'" [withCredentials]="true">
                  </p-fileUpload>
                  <div *ngIf="client.salary_advice_url" class="flex items-center text-[10px] text-green-600 bg-green-50/50 p-2 rounded-lg border border-green-100 mt-1">
                    <i class="pi pi-check-circle mr-2"></i> SALARY READY
                  </div>
                </div>

                <div class="flex flex-col gap-3">
                  <span class="text-[10px] font-black text-green-700 uppercase tracking-tighter">Selfie Verification *</span>
                  <p-fileUpload mode="basic" name="document" chooseLabel="Upload" [auto]="true" 
                                class="w-full" (onUpload)="onDocUpload($event, 'selfie')"
                                styleClass="w-full bg-green-50 border-green-100 text-green-700 font-bold"
                                [url]="baseUrl + '/clients/upload'" [withCredentials]="true">
                  </p-fileUpload>
                  <div *ngIf="client.selfie_url" class="flex items-center text-[10px] text-green-600 bg-green-50/50 p-2 rounded-lg border border-green-100 mt-1">
                    <i class="pi pi-check-circle mr-2"></i> SELFIE READY
                  </div>
                </div>
              </div>
            </div>

            <!-- Section: Employment/Geog (Simplified) -->
            <div class="pt-8 border-t border-green-50">
               <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="flex flex-col gap-2">
                  <p-floatlabel variant="on">
                    <input pInputText id="work_addr" name="work_addr" [(ngModel)]="client.workplace_address" #workAddr="ngModel" required class="w-full h-12 rounded-xl border-green-100">
                    <label for="work_addr">Workplace Address *</label>
                  </p-floatlabel>
                  <small *ngIf="workAddr.invalid && (workAddr.dirty || workAddr.touched)" class="text-red-500 font-medium ml-1 text-[10px]">Required</small>
                </div>
                 <p-floatlabel variant="on">
                   <p-inputNumber id="salary" name="salary" [(ngModel)]="client.salary" mode="currency" currency="USD" locale="en-US" required
                                  inputStyleClass="w-full h-12 rounded-xl border-green-100" styleClass="w-full"></p-inputNumber>
                   <label for="salary">Monthly Net Salary *</label>
                 </p-floatlabel>
               </div>
            </div>

            <!-- Submit Actions -->
            <div class="pt-10 flex justify-end gap-4 border-t border-green-50">
              <p-button label="Cancel" severity="secondary" [text]="true" (click)="onCancel()" styleClass="rounded-xl px-10"></p-button>
              <p-button type="submit" [label]="isEdit ? 'Update Borrower' : 'Create Borrower Profile'" icon="pi pi-check"
                       [disabled]="clientForm.invalid || !docsUploaded"
                       styleClass="bg-green-600 hover:bg-green-700 border-none rounded-xl font-bold shadow-lg shadow-green-100 px-10 py-4 disabled:opacity-50 disabled:cursor-not-allowed">
              </p-button>
            </div>
          </div>
        </p-card>
      </form>
    </div>
  `
})
export class ClientFormComponent implements OnInit {
    isEdit = false;
    clientId: string | null = null;
    employmentOptions = [
        { label: 'Permanent', value: 'Permanent' },
        { label: 'Temporary', value: 'Temporary' },
        { label: 'Contract', value: 'Contract' },
        { label: 'Unemployed', value: 'Unemployed' }
    ];

    client: Client = {
        first_name: '',
        last_name: '',
        identity_number: '',
        home_coordinates: { latitude: 0, longitude: 0 },
        work_coordinates: { latitude: 0, longitude: 0 },
        workplace_address: '',
        employment_type: 'Permanent',
        nqf_level: 1,
        salary: 0,
        fare_to_work_per_day: 0,
        alt_contact_name: '',
        alt_contact_num: '',
        identity_doc_url: '',
        salary_advice_url: '',
        selfie_url: ''
    };

    baseUrl = 'http://localhost:8080';
    private apiService = inject(ApiService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private messageService = inject(MessageService);

    get docsUploaded(): boolean {
        return !!(this.client.identity_doc_url && this.client.salary_advice_url && this.client.selfie_url);
    }

    ngOnInit() {
        this.clientId = this.route.snapshot.paramMap.get('id');
        if (this.clientId && this.clientId !== 'new') {
            this.isEdit = true;
            this.apiService.getClient(this.clientId).subscribe(client => this.client = client);
        }
    }

    onDocUpload(event: any, type: string) {
        const response = event.originalEvent.body;
        if (response && response.url) {
            if (type === 'identity') this.client.identity_doc_url = response.url;
            if (type === 'salary') this.client.salary_advice_url = response.url;
            if (type === 'selfie') this.client.selfie_url = response.url;
            
            this.messageService.add({ severity: 'success', summary: 'Success', detail: `${type} document uploaded` });
        }
    }

    onSubmit(form: any) {
        if (form.invalid || !this.docsUploaded) {
            this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Please fill all fields and upload required documents' });
            return;
        }

        if (this.isEdit && this.clientId) {
            this.apiService.updateClient(this.clientId, this.client).subscribe({
                next: () => this.onCancel(),
                error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.error || 'Update failed' })
            });
        } else {
            this.apiService.createClient(this.client).subscribe({
                next: () => this.onCancel(),
                error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.error || 'Creation failed' })
            });
        }
    }

    onCancel() {
        this.router.navigate(['/clients']);
    }
}

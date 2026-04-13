import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';

@Component({
    selector: 'app-statistics',
    standalone: true,
    imports: [CommonModule, CardModule, TableModule],
    template: `
    <div class="space-y-10 animate-fade-in">
      <div class="bg-white p-8 rounded-3xl border border-green-100 shadow-sm">
        <h2 class="text-4xl font-black text-green-900 tracking-tight">Performance Analytics</h2>
        <p class="text-green-700/60 font-medium italic mt-2">Monthly trajectory of lending and recovery</p>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <p-card styleClass="shadow-lg border-none rounded-2xl overflow-hidden bg-white border-l-4 border-l-green-500">
           <div class="flex items-center gap-4">
             <div class="p-3 bg-green-50 rounded-xl">
               <i class="pi pi-wallet text-2xl text-green-600"></i>
             </div>
             <div>
               <div class="text-[10px] font-black text-green-700 uppercase tracking-widest">Total Volume</div>
               <div class="text-2xl font-black text-green-900">{{ grandTotalBorrowed | currency }}</div>
             </div>
           </div>
        </p-card>

        <p-card styleClass="shadow-lg border-none rounded-2xl overflow-hidden bg-white border-l-4 border-l-blue-500">
           <div class="flex items-center gap-4">
             <div class="p-3 bg-blue-50 rounded-xl">
               <i class="pi pi-replay text-2xl text-blue-600"></i>
             </div>
             <div>
               <div class="text-[10px] font-black text-blue-700 uppercase tracking-widest">Total Recovered</div>
               <div class="text-2xl font-black text-green-900">{{ grandTotalRepaid | currency }}</div>
             </div>
           </div>
        </p-card>

        <p-card styleClass="shadow-lg border-none rounded-2xl overflow-hidden bg-white border-l-4 border-l-amber-500">
           <div class="flex items-center gap-4">
             <div class="p-3 bg-amber-50 rounded-xl">
               <i class="pi pi-percentage text-2xl text-amber-600"></i>
             </div>
             <div>
               <div class="text-[10px] font-black text-amber-700 uppercase tracking-widest">Recovery Rate</div>
               <div class="text-2xl font-black text-green-900">{{ recoveryRate | number:'1.1-1' }}%</div>
             </div>
           </div>
        </p-card>
      </div>

      <div class="bg-white p-1 rounded-3xl border border-green-100 shadow-2xl overflow-hidden">
        <p-table [value]="stats" styleClass="p-datatable-gridlines p-datatable-lg">
          <ng-template pTemplate="header">
            <tr class="bg-green-50/50">
              <th class="py-6 px-6 text-green-900 font-black uppercase text-xs tracking-widest">Month</th>
              <th class="text-green-900 font-black uppercase text-xs tracking-widest text-center">Loans Issued</th>
              <th class="text-green-900 font-black uppercase text-xs tracking-widest text-right">Amount Lent</th>
              <th class="text-green-900 font-black uppercase text-xs tracking-widest text-center">Paid Back</th>
              <th class="text-green-900 font-black uppercase text-xs tracking-widest text-right">Amount Recovered</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-stat>
            <tr class="hover:bg-green-50/30 transition-all font-medium">
              <td class="py-6 px-6 text-green-900 font-black">{{ stat._id }}</td>
              <td class="text-center font-bold text-green-700 bg-green-50/20">{{ stat.count_borrowed }}</td>
              <td class="text-right font-black text-green-900">{{ stat.total_borrowed | currency }}</td>
              <td class="text-center font-bold text-blue-700 bg-blue-50/20">{{ stat.count_repaid }}</td>
              <td class="text-right font-black text-blue-900">{{ stat.total_repaid | currency }}</td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>
    `
})
export class StatisticsComponent implements OnInit {
    stats: any[] = [];
    grandTotalBorrowed = 0;
    grandTotalRepaid = 0;

    private apiService = inject(ApiService);

    get recoveryRate(): number {
        return this.grandTotalBorrowed > 0 ? (this.grandTotalRepaid / this.grandTotalBorrowed) * 100 : 0;
    }

    ngOnInit() {
        this.apiService.getStatistics().subscribe(stats => {
            this.stats = stats;
            this.grandTotalBorrowed = stats.reduce((acc, curr) => acc + curr.total_borrowed, 0);
            this.grandTotalRepaid = stats.reduce((acc, curr) => acc + curr.total_repaid, 0);
        });
    }
}

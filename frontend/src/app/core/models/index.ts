export interface User {
    id: string;
    username: string;
    role: 'Admin' | 'Support';
}

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    user: User;
}

export interface Client {
    id?: string;
    first_name: string;
    last_name: string;
    identity_number: string;
    home_coordinates: { latitude: number; longitude: number };
    work_coordinates: { latitude: number; longitude: number };
    workplace_address: string;
    employment_type: 'Permanent' | 'Temporary' | 'Contract' | 'Unemployed';
    nqf_level: number;
    salary: number;
    fare_to_work_per_day: number;
    alt_contact_name: string;
    alt_contact_num: string;
    identity_doc_url?: string;
    salary_advice_url?: string;
    selfie_url?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Loan {
    id?: string;
    client_id: string;
    principal: number;
    interest: number;
    admin_fee: number;
    total_due: number;
    repayment_date: string;
    status: 'Pending' | 'Active' | 'Missed Repayment' | 'Fully Paid' | 'Rejected';
    created_at?: string;
    updated_at?: string;
}

export interface DecisionResult {
    approved: boolean;
    score: number;
    reason: string;
}

export interface ApplyLoanResponse {
    message: string;
    decision: DecisionResult;
    loan: Loan;
}

import { Injectable } from '@angular/core';

const REGISTER_DRAFT_KEY = 'register_form_draft';

export interface RegisterDraft {
  email: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
}

@Injectable({ providedIn: 'root' })
export class RegisterDraftService {
  save(draft: RegisterDraft): void {
    sessionStorage.setItem(REGISTER_DRAFT_KEY, JSON.stringify(draft));
  }

  load(): RegisterDraft | null {
    const raw = sessionStorage.getItem(REGISTER_DRAFT_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as RegisterDraft;
    } catch {
      return null;
    }
  }

  clear(): void {
    sessionStorage.removeItem(REGISTER_DRAFT_KEY);
  }
}


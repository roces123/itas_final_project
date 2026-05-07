// src/app/services/loading.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private loadingCount = 0;
  // Ito ang State Management requirement mo para sa Loading
  loading$ = new BehaviorSubject<boolean>(false);

  show() {
    this.loadingCount++;
    this.loading$.next(true);
  }

  hide() {
    this.loadingCount--;
    if (this.loadingCount <= 0) {
      this.loadingCount = 0;
      this.loading$.next(false);
    }
  }
}
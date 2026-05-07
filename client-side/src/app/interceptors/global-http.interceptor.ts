import { 
  HttpInterceptorFn, 
  HttpRequest, 
  HttpHandlerFn, 
  HttpErrorResponse 
} from '@angular/common/http'; 
import { inject } from '@angular/core';
import { catchError, finalize, throwError } from 'rxjs';
import { LoadingService } from '../services/loading.services';

export const globalHttpInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  
  // 1. Kunin ang token mula sa LocalStorage
  // Base sa screenshot mo, 'token' ang key name na ginagamit
  const token = localStorage.getItem('token');
  
  loadingService.show();

  // 2. I-clone ang request para isama ang Authorization Header
  // Ito ang mag-aayos sa 401 Unauthorized error sa Admin Dashboard
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // 3. Ipasa ang authReq sa susunod na handler
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unknown error occurred!';
      
      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Backend-side error (Dito papasok ang 404 o 401 mula sa server)
        errorMessage = error.error?.message || `Error Code: ${error.status}`;
      }
      
      console.error('Interceptor Error:', errorMessage);
      
      // LOGIC: Huwag mag-alert kung 401 (Unauthorized) o 404 (Not Found) 
      // para hindi mag-pop up ang alert habang nag-debug sa console
      if (error.status !== 401 && error.status !== 404) {
        alert(errorMessage); 
      }
      
      return throwError(() => new Error(errorMessage));
    }),
    finalize(() => loadingService.hide())
  );
};
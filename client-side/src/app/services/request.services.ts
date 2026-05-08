import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl.replace('/auth', '')}/requests`;

  submitRequest(data: any): Observable<any> {
    const completePayload = {
      ...data,
      status: 'pending',
      adminFileUrl: '',
      adminRemarks: '',
      createdAt: new Date()
    };
    return this.http.post(this.apiUrl, completePayload);
  }

  // FIXED: Tinanggal ang '/student' para mag-match sa backend route
  updateStudentRequest(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  getMyRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my-requests`);
  }

  getAllRequests(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  updateRequestStatus(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, data);
  }

  cancelRequest(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
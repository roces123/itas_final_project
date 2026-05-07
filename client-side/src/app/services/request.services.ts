import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/requests';

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

  // Para sa Student Edit
  updateStudentRequest(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/student/${id}`, data);
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
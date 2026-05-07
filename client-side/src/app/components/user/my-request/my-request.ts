import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { Firestore, doc, onSnapshot, Unsubscribe } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, Location } from '@angular/common';

@Component({
  selector: 'app-my-request',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-request.html',
  styleUrls: ['./my-request.css']
})
export class MyRequest implements OnInit, OnDestroy {
  private firestore = inject(Firestore);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private location = inject(Location);

  request: any = null;
  private unsubscribe: Unsubscribe | null = null;

  ngOnInit() {
    // Kinukuha ang ID mula sa URL query parameters
    this.route.queryParams.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.startLiveListener(id);
      }
    });
  }

  /**
   * LIVE LISTENER
   * Mahalaga ito para kapag ni-release ni Admin ang request gamit ang adminFileUrl,
   * agad itong lilitaw sa student view.
   */
  startLiveListener(id: string) {
    const docRef = doc(this.firestore, 'requests', id);
    this.unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        this.request = { 
          id: snapshot.id, 
          ...data 
        };
        
        // Pinipilit ang UI na mag-update para lumitaw ang Preview o Download buttons
        this.cdr.detectChanges(); 
      } else {
        console.error("Request not found");
      }
    });
  }

  goBack() {
    this.location.back();
  }

  /**
   * DOWNLOAD LOGIC
   * Gagamitin nito ang 'adminFileUrl' field na sine-save sa Admin side.
   */
  downloadFile(url: string, docType: string) {
    if (!url) {
      alert("No official document available for download yet.");
      return;
    }
    
    try {
      const fileName = (docType || 'Requested_Document').replace(/\s+/g, '_');
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank'; 
      
      // I-set ang download attribute para sa official copy
      link.setAttribute('download', `${fileName}_Official_Copy.pdf`);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      window.open(url, '_blank'); 
    }
  }

  ngOnDestroy() {
    // Siguraduhing i-unsubscribe para maiwasan ang memory leaks
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
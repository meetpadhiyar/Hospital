import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { CommonService } from './common.service';
import { BehaviorSubject, Observable, finalize } from 'rxjs';

@Injectable()
export class loggingInterceptor implements HttpInterceptor {
  
  private ongoingRequests = new BehaviorSubject<number>(0);

  constructor(private commonService: CommonService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Increment the ongoing requests counter
    this.ongoingRequests.next(this.ongoingRequests.value + 1);
    let shouldShowLoading = true;
    this.commonService.showLoading$.subscribe(val => shouldShowLoading = val);
    // Show the loader when the first request starts
    if (this.ongoingRequests.value === 1 && shouldShowLoading) {
      this.commonService.presentLoading('Loading');
    }

    return next.handle(request).pipe(
      finalize(() => {
        // Decrement the ongoing requests counter
        this.ongoingRequests.next(this.ongoingRequests.value - 1);

        // Dismiss the loader when all requests are completed
        if (this.ongoingRequests.value === 0) {
          this.commonService.dismissLoading();
        }
      })
    );
  }
}
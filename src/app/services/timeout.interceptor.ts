import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { timeout } from 'rxjs/operators';

export const DEFAULT_TIMEOUT = 20000;

@Injectable()
export class TimeoutInterceptor implements HttpInterceptor {

    lastRequestTime = 0;
    intercept(req: HttpRequest<any>, next: HttpHandler) {

        // To override the default timeout, set a timeout header when doing the request


        // TODO: Finish this or remove completely
        if (this.lastRequestTime === 0) {
            this.lastRequestTime = new Date().getTime();
        } else {
            const delta = new Date().getTime() - this.lastRequestTime;
            // console.log(delta / 1000 + ' seconds have passed since your last request!');
            if (delta > 1000 * 60 * 30) {
                // 30 minutes have passed since last request was sent
                // Session has expired, log out user
            }
            this.lastRequestTime = new Date().getTime();
        }


        const timeoutValue = Number(req.headers.get('timeout')) || DEFAULT_TIMEOUT;

        // This removes the &ignoreError flag from all requests
        // With the flag the backend wraps failed requests like a 500 into a 200
        // This was needed for the old app but is not needed here
        const newRequest = req.clone({
            url: req.url.replace('&ignoreError', '')
        });

        return next.handle(newRequest).pipe(timeout(timeoutValue));
    }
}
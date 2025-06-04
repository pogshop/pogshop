import { HttpInterceptorFn } from '@angular/common/http';

export const localHostInterceptor: HttpInterceptorFn = (req, next) => {
  // Check if we're on localhost
  if (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  ) {
    // Clone the request and add the test header
    const modifiedRequest = req.clone({
      setHeaders: {
        'X-Test-Environment': 'true',
      },
    });
    return next(modifiedRequest);
  }

  // If not on localhost, proceed with the original request
  return next(req);
};

import { HttpInterceptorFn } from '@angular/common/http';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const newReq = req.clone({
    withCredentials: true,
    headers: req.headers.set('Content-Type', 'application/json')
  });
  return next(newReq);
};
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { BnAuthenticationService } from './bn-authentication-service';
export declare class AuthenticationGuard implements CanActivate {
    private segurancaService;
    constructor(segurancaService: BnAuthenticationService);
    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean;
}

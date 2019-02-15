import { Router } from '@angular/router';
import { BnLoginService } from '../bn-login/login-service/bn-login-service.service';
export declare class BnAuthenticationService {
    private router;
    private loginSv;
    constructor(router: Router, loginSv: BnLoginService);
    validaLogin(state: any): Promise<any>;
}

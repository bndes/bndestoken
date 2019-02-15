import { OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BnLoginService } from '../bn-login/login-service/bn-login-service.service';
import { BnAlertsService } from '../bn-alerts/bn-alerts-service';
export declare class BnBoxUsuarioTopoComponent implements OnInit {
    private loginSv;
    private router;
    protected bnAlertsService: BnAlertsService;
    usuario: any;
    constructor(loginSv: BnLoginService, router: Router, bnAlertsService: BnAlertsService);
    ngOnInit(): void;
    logout(): void;
}

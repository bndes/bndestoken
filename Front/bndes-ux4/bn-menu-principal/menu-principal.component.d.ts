import { OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BuscaMenuService } from './busca-menu.service';
import { BnAlertsService } from '../bn-alerts/bn-alerts-service';
import { BnLoginService } from '../bn-login/login-service/bn-login-service.service';
export declare class MenuPrincipalComponent implements OnInit {
    private buscaSv;
    private loginSv;
    protected bnAlertsService: BnAlertsService;
    private router;
    menuItens: Object[];
    txtBusca: string;
    menuUrl: string;
    exibeBusca: boolean;
    constructor(buscaSv: BuscaMenuService, loginSv: BnLoginService, bnAlertsService: BnAlertsService, router: Router);
    ngOnInit(): void;
    logout(): void;
    executarBusca(): void;
    private fecharMenu();
    onWindowScroll(): void;
}

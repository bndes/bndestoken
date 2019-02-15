import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import 'rxjs/add/observable/fromPromise';
import { BnLoginService } from '../login-service/bn-login-service.service';
export declare class BnTelaLogin {
    private modalAtivo;
    private route;
    private router;
    private loginSv;
    solicitarCnpj: boolean;
    carregando: boolean;
    returnUrl: string;
    log_cnpj: string;
    log_userName: string;
    log_senha: string;
    constructor(modalAtivo: NgbActiveModal, route: ActivatedRoute, router: Router, loginSv: BnLoginService);
    ngOnInit(): void;
    executaLogin(event: any): void;
    fecharModal(): void;
}
export declare class BnTelaLoginComponent {
    private modalSv;
    private route;
    constructor(modalSv: NgbModal, route: ActivatedRoute);
    private abrirModal();
}

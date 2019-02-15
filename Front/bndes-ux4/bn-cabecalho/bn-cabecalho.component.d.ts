import { OnInit } from '@angular/core';
import { BnAlertsService } from '../bn-alerts/bn-alerts-service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BnNotificacoesComponent } from '../bn-notificacoes/bn-notificacoes.component';
export declare class BnCabecalhoComponent implements OnInit {
    private bnAlertsService;
    private modalService;
    nomeSistema: string;
    options: {
        exibeBusca: boolean;
        exibeVerTodasNotificacoes: boolean;
        ordemNotificacoesInversa: boolean;
        logLevelsNotificacoes: {
            'success': boolean;
            'info': boolean;
            'warning': boolean;
            'error': boolean;
        };
    };
    opcoesNotificacoes: any;
    closeResult: string;
    notificacoesErrosAssincronos: BnNotificacoesComponent;
    constructor(bnAlertsService: BnAlertsService, modalService: NgbModal);
    open(content: any): void;
    private getDismissReason(reason);
    ngOnInit(): void;
}

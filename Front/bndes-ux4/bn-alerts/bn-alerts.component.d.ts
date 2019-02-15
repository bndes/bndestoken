import { OnInit } from '@angular/core';
import { BnAlertsService } from './bn-alerts-service';
import { IAlert } from './bn-alerts-ialert';
export declare class BnAlertsComponent implements OnInit {
    private bnAlertsService;
    alerts: Array<IAlert>;
    backup: Array<IAlert>;
    constructor(bnAlertsService: BnAlertsService);
    closeAlert(alert: IAlert): void;
    reset(): void;
    ngOnInit(): void;
    removerAlerta(alerta: any): void;
}

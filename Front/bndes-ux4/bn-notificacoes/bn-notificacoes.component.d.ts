import { OnInit } from '@angular/core';
export declare class BnNotificacoesComponent implements OnInit {
    icone: string;
    tituloNotificacoes: string;
    tipo: string;
    cor: string;
    options: {
        exibeVerTodas: boolean;
        reverse: boolean;
        logLevels: {
            'success': boolean;
            'info': boolean;
            'warning': boolean;
            'error': boolean;
        };
    };
    notificacoes: Array<any>;
    novasNotificacoes: number;
    ngOnInit(): void;
    addNotificacao(notificacao: any): void;
}

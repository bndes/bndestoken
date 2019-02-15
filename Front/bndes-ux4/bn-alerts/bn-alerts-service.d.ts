import { Observable } from 'rxjs/Observable';
import { IAlert } from './bn-alerts-ialert';
export declare class BnAlertsService {
    private novoAlerta;
    novoAlerta$: Observable<IAlert>;
    private id_ultimo_alerta;
    criarAlerta(type: string, title: string, message: string, timeout: number): void;
}

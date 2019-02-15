import { Http, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { Router } from '@angular/router';
import { BnAlertsService } from './bn-alerts/bn-alerts-service';
export declare class ServiceDefault {
    private bndesUxConfig;
    protected http: Http;
    private router;
    protected bnAlertsService: BnAlertsService;
    constructor(bndesUxConfig: any, http: Http, router: Router, bnAlertsService: BnAlertsService);
    getServiceGenerico(urlService: string, retornarRespostaCompleta: boolean): Promise<any>;
    getServiceGenericoSemRetorno(urlService: string, retornarRespostaCompleta: boolean): Promise<any>;
    private tratarRetornoServico(resposta, urlCompleta, retornarRespostaCompleta, ignorarResposta);
    private handleError(error);
    obterUrl(): any;
    postServiceGenerico(urlService: string, urlFull: boolean, parametros: any, header: any): Promise<object>;
    headers(parametros: any): RequestOptions;
}

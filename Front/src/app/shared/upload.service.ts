import { Injectable } from '@angular/core';
import { ConstantesService } from '../ConstantesService';
import { Web3Service } from '../Web3Service';

import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/do';

@Injectable()
export class UploadService {

    serverUrl: string;

    constructor(private http: HttpClient, private constantes: ConstantesService, private web3Service: Web3Service) {
        this.serverUrl = ConstantesService.serverUrl;
    }

    uploadFileLiquidacaoResgate(resgate, filename): Observable<Object> {
        console.log("UploadService - Upload File")

        let comprovante = {
            nome: filename,
            hash: ""
        }

        return this.http.post(this.serverUrl + "upload-liquidacao-resgate", { resgate: resgate, comprovante: comprovante })
            .catch(this.handleError)
    }

    downloadFileLiquidacaoResgate(filename: string): Observable<Object> {
        console.log("UploadService - Download File")

        return this.http.post(this.serverUrl + "download-liquidacao-resgate", { filename: filename }, {
            responseType: 'blob',
            headers: new HttpHeaders().append('Content-Type', 'application/json')
        }).catch(this.handleError)
    }

    calcularHash(filename: any): Observable<Object> {
        console.log("UploadService - Calcular hash")

        return this.http.post(this.serverUrl + "calcular-hash", { filename: filename })
            .catch(this.handleError)
    }

    private handleError(err: HttpErrorResponse) {
        console.log("handle errror em PJService");
        console.log(err);
        return Observable.throw(err.message);
    }
}

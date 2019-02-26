import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ConstantesService } from './ConstantesService';
import  {Md5} from 'ts-md5/dist/md5';

import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/do';

import { PessoaJuridica } from './PessoaJuridica';
import { Utils } from './shared/utils';


@Injectable()
export class PessoaJuridicaService {

  serverUrl: string;

  constructor(private http: HttpClient, private constantes: ConstantesService) {

    this.serverUrl = ConstantesService.serverUrl;
    console.log("PessoaJuridicaService.ts :: Selecionou URL = " + this.serverUrl)

  }

  geraHash(entrada: string): string {
    let saida;
    saida = Md5.hashStr(entrada);
    return saida;
  }

  liquidarResgate(hashID, hashIDLiquidacao): Observable<Object> {
    console.log("liquidarResgate::hashIDLiquidacao=" + hashIDLiquidacao)
    return this.http.post<Object>(this.serverUrl + 'liquida-resgate', { hashID: hashID, hashIDLiquidacao: hashIDLiquidacao })
      .catch(this.handleError)
  }

  recuperaEmpresaPorCnpj(cnpj: string): Observable<any> {
    let str_cnpj = new String(cnpj)

    if (str_cnpj.length < 14) {
      str_cnpj = Utils.completarCnpjComZero(str_cnpj)
    }
    console.log("CNPJ tratado = " + str_cnpj);

    return this.http.post<Object>(this.serverUrl + 'pj-por-cnpj', { cnpj: str_cnpj })
      //.do(pessoaJuridica => console.log('empresa retornada :' +  JSON.stringify(pessoaJuridica)))
      .catch(this.handleError);

  }

  recuperaEmpresaPorContaBlockchain(contaBlockchainCNPJ): Observable<any> {

    console.log("Recupera empresa a partir da contaBlockchainCNPJ " + contaBlockchainCNPJ);

    return this.http.post<Object>(this.serverUrl + 'pj-por-contaBlockchain', { contaBlockchainCNPJ: contaBlockchainCNPJ })
      .catch(this.handleError);

  }

  recuperaTransferenciaPorSubcreditoEHashID(numeroSubcredito, hashID): Observable<any> {
    return this.http.post<Object>(this.serverUrl + 'transf-por-subcredito-hashID', { numeroSubcredito: numeroSubcredito, hashID: hashID })
      .catch(this.handleError);

  }

  recuperaResgatesNaoLiquidados(): Observable<any> {
    return this.http.post<Object>(this.serverUrl + 'resg-nao-liquidados', {})
      .catch(this.handleError);

  }

  buscaResgateNaoLiquidadoPorHash(hashID): Observable<any> {
    return this.http.post<Object>(this.serverUrl + 'busca-resgate-nao-liquidado-por-hash', { hashID: hashID })
      .catch(this.handleError)
  }

  buscaLiquidacaoResgatePorHash(hashID): Observable<any> {
    return this.http.post<Object>(this.serverUrl + 'busca-liquidacao-resgate-por-hash', { hashID: hashID })
      .catch(this.handleError)
  }

  buscaTransferenciaPorHash(hashID) {
    return this.http.post<Object>(this.serverUrl + 'busca-transferencia-por-hash', { hashID: hashID })
      .catch(this.handleError)
  }

  buscaLiberacaoPorHash(hashID) {
    return this.http.post<Object>(this.serverUrl + 'busca-liberacao-por-hash', { hashID: hashID })
      .catch(this.handleError)
  }

  private handleError(err: HttpErrorResponse) {
    console.log("handle errror em PJService");
    console.log(err);
    return Observable.throw(err.message);
  }



}

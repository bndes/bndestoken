import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ConstantesService } from './ConstantesService';

import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/do';

import { Utils } from './shared/utils';


@Injectable()
export class PessoaJuridicaService {

  serverUrl: string;
  operationAPIURL: string;
  mockMongoClient: boolean;

  constructor(private http: HttpClient, private constantes: ConstantesService) {

    this.serverUrl = ConstantesService.serverUrl;
    this.operationAPIURL = ConstantesService.operationAPIURL;
    this.mockMongoClient = ConstantesService.mockMongoClient;
    console.log("PessoaJuridicaService.ts :: Selecionou URL = " + this.serverUrl)

  }

  recuperaClientePorCnpj(cnpj: string): Observable<any> {
    let str_cnpj = new String(cnpj)

    if (str_cnpj.length < 14) {
      str_cnpj = Utils.completarCnpjComZero(str_cnpj)
    }
    let self = this;

    if (!this.mockMongoClient) {
        return this.http.get<Object>(this.operationAPIURL + str_cnpj )
        .do(pessoaJuridica => self.formatPJOperationAPI(pessoaJuridica))        
        .catch(this.handleError);

    }
    else {
      return this.http.post<Object>(this.serverUrl + 'pj-por-cnpj', { cnpj: str_cnpj })
      .do(pessoaJuridica => self.formatPJMongo(pessoaJuridica))
      .catch(this.handleError);
    }
  }


  recuperaEmpresaPorCnpj(cnpj: string): Observable<any> {
    let str_cnpj = new String(cnpj)

    if (str_cnpj.length < 14) {
      str_cnpj = Utils.completarCnpjComZero(str_cnpj)
    }
    let self = this;

    return this.http.post<Object>(this.serverUrl + 'pj-por-cnpj', { cnpj: str_cnpj })
      .do(pessoaJuridica => self.formatPJMongo(pessoaJuridica))
      .catch(this.handleError);
  }



  formatPJOperationAPI (pessoaJuridica) {

    console.log('empresa retornada do GET:' +  JSON.stringify(pessoaJuridica));    

    if (pessoaJuridica && pessoaJuridica.operacoes && pessoaJuridica.operacoes.length>0) {

      let dadosCadastrais = {};
      dadosCadastrais["razaoSocial"] = pessoaJuridica.operacoes[0].cliente;
  
      let subcreditos = [];
  
      pessoaJuridica.operacoes.forEach(operacao => {
      
        this.includeIfNotExists(subcreditos, operacao.numeroContrato);
        
      });

      pessoaJuridica["dadosCadastrais"] = dadosCadastrais;
      pessoaJuridica["subcreditos"] = subcreditos;    
        
    }

    delete pessoaJuridica.operacoes;
    delete pessoaJuridica.desembolsos;
    delete pessoaJuridica.carteira;

    console.log('empresa retornada do GET MODIFICADA:' +  JSON.stringify(pessoaJuridica)); 
    
    return pessoaJuridica;
  }

  includeIfNotExists (subcreditos, numeroContrato) {
    let result = subcreditos.find(sub => sub.numero == numeroContrato);
    if (!result) {
      subcreditos.push(
        {
          numero: numeroContrato
        });
  
    }
  }
  

  formatPJMongo (pessoaJuridica) {    
    console.log('empresa retornada do back:' +  JSON.stringify(pessoaJuridica));

    pessoaJuridica["contasFornecedor"] = "ALTERADO";

    console.log('empresa retornada do back ALTERADA:' +  JSON.stringify(pessoaJuridica));

    return pessoaJuridica;

  }

  

  private handleError(err: HttpErrorResponse) {
    console.log("handle errror em PJService");
    console.log(err);
    return Observable.throw(err.message);
  }


}

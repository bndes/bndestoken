import { Component, OnInit, NgZone } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

import { Liberacao, Subcredito } from './Liberacao';

import { Web3Service } from './../Web3Service';
import { PessoaJuridicaService } from '../pessoa-juridica.service';


import { BnAlertsService } from 'bndes-ux4';
import { ChangeDetectionStrategy } from '@angular/compiler/src/core';

import { Utils } from '../shared/utils';

@Component({
  selector: 'app-liberacao',
  templateUrl: './liberacao.component.html',
  styleUrls: ['./liberacao.component.css']
})
export class LiberacaoComponent implements OnInit {

  liberacao: Liberacao;

  ultimoCNPJ: string;

  maskCnpj: any;

  selectedAccount: any;


  constructor(private pessoaJuridicaService: PessoaJuridicaService, protected bnAlertsService: BnAlertsService, private web3Service: Web3Service,
    private ref: ChangeDetectorRef, private zone: NgZone, private router: Router) {

      let self = this;
      setInterval(function () {
        self.recuperaContaSelecionada(), 1000});

  }

  ngOnInit() {
    this.maskCnpj = Utils.getMaskCnpj();     
    this.liberacao = new Liberacao();
    this.ultimoCNPJ = "";
    this.inicializaLiberacao();
  }

  inicializaLiberacao() {
    this.liberacao.subcreditos = new Array<Subcredito>();    
    this.liberacao.razaoSocial = null;
    this.liberacao.valor = null;
    this.liberacao.saldoCNPJ = null;
    this.liberacao.numeroSubcreditoSelecionado = null;
    this.liberacao.contaBlockchainCNPJ = null;
  }

 async recuperaContaSelecionada() {

  let self = this;
  
  let newSelectedAccount = await this.web3Service.getCurrentAccountSync();

  if ( !self.selectedAccount || (newSelectedAccount !== self.selectedAccount && newSelectedAccount)) {

    this.selectedAccount = newSelectedAccount;
    console.log("selectedAccount=" + this.selectedAccount);
    
  }

}  

  recuperaInformacoesDerivadasCNPJ() {
    this.liberacao.cnpj = Utils.removeSpecialCharacters(this.liberacao.cnpjWithMask);

    if (this.liberacao.cnpj != this.ultimoCNPJ) {
      this.inicializaLiberacao();
      this.ultimoCNPJ = this.liberacao.cnpj;

      if ( this.liberacao.cnpj.length == 14 ) { 
        console.log (" Buscando o CNPJ do cliente (14 digitos fornecidos)...  ")
        this.recuperaClientePorCNPJ(this.liberacao.cnpj);
      } 
      else {
        this.inicializaLiberacao();
      }  
  

    }
  }

  recuperaClientePorCNPJ(cnpj) {
    console.log(cnpj);

    let self = this;

    this.pessoaJuridicaService.recuperaClientePorCnpj(cnpj).subscribe(
      empresa => {
        if (empresa && empresa.dadosCadastrais) {
          console.log("empresa encontrada abaixo ");
          console.log(empresa);

          this.liberacao.cnpj = cnpj;
          this.liberacao.razaoSocial = empresa.dadosCadastrais.razaoSocial;

          if (empresa["subcreditos"] && empresa["subcreditos"].length>0) {

            for (var i = 0; i < empresa["subcreditos"].length; i++) {
            
              let subStr = JSON.parse(JSON.stringify(empresa["subcreditos"][i]));
              self.includeAccountIfAssociated(self, cnpj, subStr);
            }
               
          }
          else {
            let s = "A liberação só pode ocorrer para uma empresa cliente.";
            this.bnAlertsService.criarAlerta("error", "Erro", s, 5);
            console.log(s);
          }
        }
        else {
          let texto = "Nenhuma empresa encontrada com o cnpj " + cnpj;
          console.log(texto);
          Utils.criarAlertaAcaoUsuario( this.bnAlertsService, texto);

          this.inicializaLiberacao();
        }
      },
      error => {
        let texto = "Erro ao buscar dados da empresa";
        console.log(texto);
        Utils.criarAlertaErro( this.bnAlertsService, texto,error);
        this.inicializaLiberacao();
      });

  }


  includeAccountIfAssociated (self, cnpj, sub) {

    self.web3Service.getPJInfoByCnpj(cnpj, sub.numero,
              
      (pjInfo) => {

        console.log("####### estado da conta");        
        console.log(pjInfo);   
        
        //so pode incluir se estiver validada
      if (pjInfo.isValidada) { 
            self.includeIfNotExists(self.liberacao.subcreditos, sub);

            //TODO: otimizar para fazer isso apenas uma vez
            self.liberacao.numeroSubcreditoSelecionado = self.liberacao.subcreditos[0].numero;
            self.recuperaContaBlockchainCliente();

        }
      },
      (error) => {
        console.log("Erro ao verificar se contrato estah associado na blockhain");
      })
  
  }


  includeIfNotExists(subcreditos, sub) {

    let include = true;
    for(var i=0; i < subcreditos.length; i++) { 
      if (subcreditos[i].numero==sub.numero) {
        include=false;
      }
    }  
    if (include) subcreditos.push(sub);
  }



  recuperaContaBlockchainCliente() {

    let self = this;

    console.log("Recupera conta blockchain");

    this.web3Service.getContaBlockchain(self.liberacao.cnpj, self.liberacao.numeroSubcreditoSelecionado,
      function (result) {
        console.log("CNPJ " + self.liberacao.cnpj + " tem conta blockchain " + result);
        self.liberacao.contaBlockchainCNPJ = result;

        self.web3Service.getBalanceOf(self.liberacao.contaBlockchainCNPJ,
            function (result) {
              console.log("Saldo do endereco " + self.liberacao.contaBlockchainCNPJ + " eh " + result);
              self.liberacao.saldoCNPJ = result;
              self.ref.detectChanges();
        },
        function (error) {
            console.log("Erro ao ler o saldo do endereco " + self.liberacao.contaBlockchainCNPJ);
            console.log(error);
            self.liberacao.saldoCNPJ = 0;
        });

      },
      function (error) {
        console.log("Erro ao ler conta blockchain " + this.liberacao.cnpj);
        console.log(error);
        self.liberacao.saldoCNPJ = 0;
      });  

  }

  atualizaInfoPorMudancaSubcredito() {
    this.recuperaContaBlockchainCliente();
  }


  async liberar() {

    let self = this;

    let bRD = await this.web3Service.isResponsibleForDisbursementSync(this.selectedAccount);    
    if (!bRD) 
    {
      let s = "Conta selecionada no Metamask não pode executar Liberação.";
        this.bnAlertsService.criarAlerta("error", "Erro", s, 5);
        return;
    }
    else if (!this.liberacao.contaBlockchainCNPJ) {

      let s = "O Subcrédito Operacional deve possuir uma Conta Blockchain Associada.";
      this.bnAlertsService.criarAlerta("error", "Erro", s, 5);
      console.log(s);
    }
    else {
      console.log(this.liberacao.contaBlockchainCNPJ);
      console.log(this.liberacao.valor);

      this.web3Service.isContaValidada(this.liberacao.contaBlockchainCNPJ, 
    
        (result) => {

          if (!result) {
          
            let msg = "A conta "+ this.liberacao.contaBlockchainCNPJ +" não está validada e portanto não pode receber tokens."; 
            Utils.criarAlertaErro( self.bnAlertsService, msg, msg);  
          }
          else {

              console.log(result);

              this.web3Service.liberacao(this.liberacao.contaBlockchainCNPJ, this.liberacao.valor,
                (txHash) => {
                self.liberacao.hashID = txHash;
      
                Utils.criarAlertasAvisoConfirmacao( txHash, 
                                                    self.web3Service, 
                                                    self.bnAlertsService, 
                                                    "A liberação está sendo enviada para a blockchain.", 
                                                    "A liberação foi confirmada na blockchain.", 
                                                    self.zone) 
                self.router.navigate(['sociedade/dash-transf']);                                                          
                }        
              ,(error) => {
                Utils.criarAlertaErro( self.bnAlertsService, 
                                        "Erro ao liberar na blockchain. Uma possibilidade é a conta selecionada não ser a do BNDES", 
                                        error )  
              }
            );
            Utils.criarAlertaAcaoUsuario( self.bnAlertsService, 
                                          "Confirme a operação no metamask e aguarde a confirmação da liberação." )
          }
        }, (error) => {
          Utils.criarAlertaErro( self.bnAlertsService, 
            "Erro ao verificar se conta está validada", 
            error);
  
        });
      }      
  }
}

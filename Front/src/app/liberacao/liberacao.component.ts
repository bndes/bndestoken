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

  statusHabilitacaoForm: boolean;

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
    this.mudaStatusHabilitacaoForm(true);
    this.liberacao = new Liberacao();
    this.ultimoCNPJ = "";
    this.inicializaLiberacao();
  }

  inicializaLiberacao() {
    this.liberacao.subcreditos = new Array<Subcredito>();
    this.liberacao.razaoSocial = null;
    this.liberacao.valor = null;
    this.liberacao.saldoCNPJ = null;
    this.liberacao.contaBlockchainCNPJ = null;
  }

  mudaStatusHabilitacaoForm(statusForm: boolean) {
    this.statusHabilitacaoForm = statusForm;
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
      this.recuperaClientePorCNPJ(this.liberacao.cnpj);
    }
  }

  recuperaClientePorCNPJ(cnpj) {
    console.log(cnpj);

    let self = this;

    this.pessoaJuridicaService.recuperaEmpresaPorCnpj(cnpj).subscribe(
      empresa => {
        if (empresa) {
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
          console.log("nenhuma empresa encontrada com o cnpj " + cnpj);
          this.inicializaLiberacao();
        }
      },
      error => {
        console.log("Erro ao buscar dados da empresa");
        this.inicializaLiberacao();
      });

  }


  includeAccountIfAssociated (self, cnpj, sub) {

    self.web3Service.getContaBlockchain(cnpj, sub.numero,
              
      (contaBlockchain) => {

        console.log("getConta");        

        console.log(contaBlockchain);        
  
        if (contaBlockchain!=0x0) { //If there is association in the blockchain yet
            self.includeIfNotExists(self.liberacao.subcreditos, sub);
            self.liberacao.numeroSubcreditoSelecionado = self.liberacao.subcreditos[0].numero;
            self.recuperaContaBlockchainCliente();

        }
  
      },
      (error) => {
        console.log("Erro ao verificar se subcredito estah associado na blockhain");
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


  liberar() {

    let self = this;

    if (this.selectedAccount != this.web3Service.getAddressOwnerCacheble()) {

      let s = "A liberação deve ser executada selecionando a conta do BNDES no Metamask.";
      this.bnAlertsService.criarAlerta("error", "Erro", s, 5);
      console.log(s);
      console.log("this.recuperaContaSelecionada()=" + this.recuperaContaSelecionada());
      console.log("this.web3Service.getAddressOwnerCacheble()=" + this.web3Service.getAddressOwnerCacheble());

    }
    else if (this.liberacao.contaBlockchainCNPJ === "" || this.liberacao.contaBlockchainCNPJ === undefined) {

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
                self.statusHabilitacaoForm = false;  
              }
            );
            Utils.criarAlertaAcaoUsuario( self.bnAlertsService, 
                                          "Confirme a operação no metamask e aguarde a confirmação da liberação." )
            self.statusHabilitacaoForm = false;  

          }
        }, (error) => {
          Utils.criarAlertaErro( self.bnAlertsService, 
            "Erro ao verificar se conta está validada", 
            error);
  
        });
      }      
  }
}

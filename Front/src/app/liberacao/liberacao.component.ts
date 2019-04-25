import { Component, OnInit, NgZone } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

import { Liberacao } from './Liberacao';

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

  maskCnpj = [/\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/]

  cnpjSomenteNumeros: string
  contaSelecionada: any;


  constructor(private pessoaJuridicaService: PessoaJuridicaService, protected bnAlertsService: BnAlertsService, private web3Service: Web3Service,
    private ref: ChangeDetectorRef, private zone: NgZone, private router: Router) {

  }

  ngOnInit() {
    this.mudaStatusHabilitacaoForm(true);
    this.inicializaLiberacao();
    this.recuperaContaSelecionada();
  }

  inicializaLiberacao() {
    this.ultimoCNPJ = "";

    this.liberacao = new Liberacao();
    this.liberacao.cnpj = null;
    this.liberacao.razaoSocial = null;
    this.liberacao.valor = null;
    this.liberacao.saldoCNPJ = null;
    this.liberacao.contaBlockchainCNPJ = null;
  }

  mudaStatusHabilitacaoForm(statusForm: boolean) {
    this.statusHabilitacaoForm = statusForm;
  }

  refreshContaBlockchainSelecionada() {
    this.recuperaContaSelecionada();
    this.inicializaLiberacao();
  }


  async recuperaContaSelecionada() {
    let self = this;
    
    this.contaSelecionada = await this.web3Service.getCurrentAccountSync();
    console.log("contaSelecionada=" + this.contaSelecionada);      

  }


  recuperaInformacoesDerivadasCNPJ() {
    this.removerCaracteresEspeciais(this.liberacao.cnpj)

    if (this.cnpjSomenteNumeros != this.ultimoCNPJ) {
      this.ultimoCNPJ = this.cnpjSomenteNumeros;
      this.recuperaClientePorCNPJ(this.cnpjSomenteNumeros);
    }
  }

  removerCaracteresEspeciais(cnpj) {
    this.cnpjSomenteNumeros = cnpj.replace(/-/g, '').replace(/\./g, '').replace('/', '').replace(/_/g, '')
  }

  recuperaClientePorCNPJ(cnpj) {
    console.log(cnpj)
    this.pessoaJuridicaService.recuperaEmpresaPorCnpj(cnpj).subscribe(
      data => {
        if (data) {
          console.log("empresa encontrada abaixo ");
          console.log(data);

          let subcreditos = new Array()

          for (var i = 0; i < data.subcreditos.length; i++) {
            if (data.subcreditos[i].papel === "cliente" && data.subcreditos[i].isActive)
              subcreditos.push(data.subcreditos[i]);
          }

          this.liberacao.cnpj = cnpj;
          this.liberacao.razaoSocial = data.dadosCadastrais.razaoSocial;
          this.liberacao.todosSubcreditos = JSON.parse(JSON.stringify(subcreditos))

          console.log("todosSubcreditos ");
          console.log(this.liberacao.todosSubcreditos);

          if (data.subcreditos && data.subcreditos.length > 0) {
            //inicia com o primeiro subcredito
            this.liberacao.numeroSubcreditoSelecionado = this.liberacao.todosSubcreditos[0].numero;
            //this.liberacao.contaBlockchainCNPJ = this.liberacao.todosSubcreditos[0].contaBlockchain;

            //console.log("Contablockchain recuperada")

            console.log(this.liberacao.todosSubcreditos[0])
            //console.log(this.liberacao.contaBlockchainCNPJ)

            this.recuperaContaBlockchainCliente();

            //this.recuperaSaldoCNPJ();
          }
          else {
            let s = "A liberação só pode ocorrer para uma empresa cliente.";
            this.bnAlertsService.criarAlerta("error", "Erro", s, 5);
            console.log(s);
          }
        }
        else {
          console.log("nenhuma empresa encontrada");
          this.liberacao.razaoSocial = "";
          this.liberacao.contaBlockchainCNPJ = "";
          this.liberacao.todosSubcreditos = undefined
          this.liberacao.saldoCNPJ = 0;
        }
      },
      error => {
        console.log("Erro ao buscar dados da empresa");
        this.liberacao.razaoSocial = "";
        this.liberacao.contaBlockchainCNPJ = "";
        this.liberacao.todosSubcreditos = undefined
        this.liberacao.saldoCNPJ = 0;
      });

  }


  recuperaSaldoCNPJ() {

    let self = this;

    console.log("O endereço é" + self.liberacao.contaBlockchainCNPJ);

    this.web3Service.getBalanceOf(self.liberacao.contaBlockchainCNPJ,
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
  }

  recuperaContaBlockchainCliente() {

    let self = this;

    console.log("Recupera conta blockchain");

    this.web3Service.getContaBlockchain(self.liberacao.cnpj, self.liberacao.numeroSubcreditoSelecionado,
      function (result) {
        console.log("CNPJ " + self.liberacao.cnpj + " tem conta blockchain " + result);
        self.liberacao.contaBlockchainCNPJ = result;

//        self.ref.detectChanges();

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
    for (let i = 0; i < this.liberacao.todosSubcreditos.length; i++) {
      if (this.liberacao.todosSubcreditos[i].numero == this.liberacao.numeroSubcreditoSelecionado) {
        this.liberacao.contaBlockchainCNPJ = this.liberacao.todosSubcreditos[i].contaBlockchain;
      }
    }

    this.recuperaSaldoCNPJ();

  }


  liberar() {

    let self = this;

    console.log("LIBERACAO")

    if (this.contaSelecionada != this.web3Service.getAddressOwnerCacheble()) {

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


//      this.liberacao.contaBlockchainBNDES = this.recuperaContaSelecionada();

      this.web3Service.liberacao(this.liberacao.contaBlockchainCNPJ, this.liberacao.valor,
         (txHash) => {
          self.liberacao.hashID = txHash;
          self.liberacao.cnpj = self.cnpjSomenteNumeros;

          Utils.criarAlertasAvisoConfirmacao( txHash, 
                                              self.web3Service, 
                                              self.bnAlertsService, 
                                              "A liberação está sendo enviada para a blockchain.", 
                                              "A liberação foi confirmada na blockchain.", 
                                              self.zone)       
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

  }
}

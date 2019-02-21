import { Component, OnInit, NgZone } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

import { Liberacao } from './Liberacao';

import { Web3Service } from './../Web3Service';
import { PessoaJuridicaService } from '../pessoa-juridica.service';


import { BnAlertsService } from 'bndes-ux4';
import { ChangeDetectionStrategy } from '@angular/compiler/src/core';

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

          this.liberacao.razaoSocial = data.dadosCadastrais.razaoSocial;
          this.liberacao.todosSubcreditos = JSON.parse(JSON.stringify(subcreditos))

          console.log("todosSubcreditos ");
          console.log(this.liberacao.todosSubcreditos);

          if (data.subcreditos && data.subcreditos.length > 0) {
            //inicia com o primeiro subcredito
            this.liberacao.numeroSubcreditoSelecionado = this.liberacao.todosSubcreditos[0].numero;
            this.liberacao.contaBlockchainCNPJ = this.liberacao.todosSubcreditos[0].contaBlockchain;

            console.log("Contablockchain recuperada")

            console.log(this.liberacao.todosSubcreditos[0])
            console.log(this.liberacao.contaBlockchainCNPJ)

            this.recuperaSaldoCNPJ();
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

    this.web3Service.getBalanceOf(this.liberacao.contaBlockchainCNPJ,
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

        function (txHash) {

          let s = "A liberação está sendo enviada para a blockchain..";
          self.bnAlertsService.criarAlerta("info", "Sucesso", s, 5);
          console.log(s);

          self.liberacao.hashID = txHash;
          self.liberacao.cnpj = self.cnpjSomenteNumeros;

          self.zone.run(() => { });

          self.web3Service.registraWatcherEventosLocal(txHash, function (error, result) {
            if (!error) {
              let s = "A liberação foi confirmada na blockchain.";
              self.bnAlertsService.criarAlerta("info", "Sucesso", s, 5);
              console.log(s);

            }
            else {
              console.log(error);
            }
          });

        }, function (error) {

          let s = "Erro ao liberar na blockchain. Uma possibilidade é a conta selecionada não ser a do BNDES";
          self.bnAlertsService.criarAlerta("error", "Erro", s, 5);
          console.log(s);
          console.log(error);
          self.mudaStatusHabilitacaoForm(true);
        });

      let s = "Confirme a operação no metamask e aguarde a confirmação da liberação.";
      self.bnAlertsService.criarAlerta("info", "", s, 5);
      console.log(s);
      this.mudaStatusHabilitacaoForm(false);

    }

  }
}

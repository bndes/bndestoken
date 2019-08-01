import { Component, OnInit, NgZone } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

import { Transferencia } from './Transferencia';

import { Web3Service } from './../Web3Service';
import { PessoaJuridicaService } from '../pessoa-juridica.service';

import { BnAlertsService } from 'bndes-ux4';
import { Utils } from '../shared/utils';

@Component({
  selector: 'app-transferencia',
  templateUrl: './transferencia.component.html',
  styleUrls: ['./transferencia.component.css']
})
export class TransferenciaComponent implements OnInit {

  transferencia: Transferencia;
  selectedAccount: any;
  maskCnpj: any;
  cnpjOrigem : string;

  constructor(private pessoaJuridicaService: PessoaJuridicaService, protected bnAlertsService: BnAlertsService, private web3Service: Web3Service,
    private ref: ChangeDetectorRef, private zone: NgZone, private router: Router) {

      let self = this;
      setInterval(function () {
        self.recuperaContaSelecionada(), 1000});

  }

  ngOnInit() {
    this.maskCnpj = Utils.getMaskCnpj();      
    this.transferencia = new Transferencia();
    this.inicializaDadosDestino();

  }


  inicializaDadosOrigem() {
    this.transferencia.subcredito = "";
    this.transferencia.saldoOrigem = undefined;    
  }


  inicializaDadosDestino() {

    this.transferencia.cnpjDestino = "";
    this.transferencia.razaoSocialDestino = "";
    this.transferencia.msgEmpresaDestino = "";
  }

  async recuperaContaSelecionada() {

    let self = this;
    
    let newSelectedAccount = await this.web3Service.getCurrentAccountSync();
  
    if ( !self.selectedAccount || (newSelectedAccount !== self.selectedAccount && newSelectedAccount)) {
  
      self.selectedAccount = newSelectedAccount;
      console.log("selectedAccount=" + this.selectedAccount);
      this.transferencia.contaBlockchainOrigem = newSelectedAccount+"";

      this.recuperaEmpresaOrigemPorContaBlockchain(this.transferencia.contaBlockchainOrigem);
      this.ref.detectChanges();
        
    }
  
  }  
  
  recuperaEmpresaOrigemPorContaBlockchain(contaBlockchain) {

    let self = this;

    console.log("ContaBlockchain" + contaBlockchain);

    if ( contaBlockchain != undefined && contaBlockchain != "" && contaBlockchain.length == 42 ) {

      this.web3Service.getPJInfo(contaBlockchain,

          (result) => {

            if ( result.cnpj != 0 ) { //encontrou uma PJ valida  

              console.log(result);
              self.cnpjOrigem = result.cnpj;
              self.transferencia.subcredito = result.idSubcredito;
              self.ref.detectChanges();

           } //fecha if de PJ valida

           else {
             self.inicializaDadosOrigem();
             console.log("Não encontrou PJ valida para a conta blockchain");
           }
           
          },
          (error) => {
            self.inicializaDadosOrigem();
            console.warn("Erro ao buscar dados da conta na blockchain")
          })

      this.recuperaSaldoOrigem(contaBlockchain);        

    } 
    else {
        self.inicializaDadosOrigem();      
    }
}


  recuperaSaldoOrigem(contaBlockchain) {

    let self = this;

    this.web3Service.getBalanceOf(contaBlockchain,

      function (result) {
        console.log("Saldo do endereco " + contaBlockchain + " eh " + result);
        self.transferencia.saldoOrigem = result;
        self.ref.detectChanges();
      },
      function (error) {
        console.log("Erro ao ler o saldo do endereco " + contaBlockchain);
        console.log(error);
        self.transferencia.saldoOrigem = 0;
      });
  }

  recuperaInformacoesDerivadasConta() {

    let self = this;

    let contaBlockchain = this.transferencia.contaBlockchainDestino.toLowerCase();

    console.log("ContaBlockchain" + contaBlockchain);

    if ( contaBlockchain != undefined && contaBlockchain != "" && contaBlockchain.length == 42 ) {

      this.web3Service.getPJInfo(contaBlockchain,

          (result) => {

            if ( result.cnpj != 0 ) { //encontrou uma PJ valida  

              console.log(result);
              self.transferencia.cnpjDestino = result.cnpj;
              if ( self.cnpjOrigem == self.transferencia.cnpjDestino) {
                let texto = "Erro: não é possível transferir entre o mesmo CNPJ: " + self.cnpjOrigem;
                console.log(texto);
                Utils.criarAlertaErro( this.bnAlertsService, texto, null);       

                this.inicializaDadosDestino();                
              } 
              else { 
                this.pessoaJuridicaService.recuperaEmpresaPorCnpj(self.transferencia.cnpjDestino).subscribe(
                  data => {
                      if (data && data.dadosCadastrais) {
                      console.log("RECUPERA EMPRESA DESTINO")
                      console.log(data)
                      self.transferencia.razaoSocialDestino = data.dadosCadastrais.razaoSocial;
                      this.validaEmpresaDestino(contaBlockchain);
                  }
                  else {
                    let texto = "Nenhuma empresa encontrada associada ao CNPJ";
                    console.log(texto);
                    Utils.criarAlertaAcaoUsuario( this.bnAlertsService, texto);       
                    //this.inicializaDadosDestino();
                    this.transferencia.msgEmpresaDestino = "Conta Inválida"
                  }
                },
                  error => {
                      let texto = "Erro ao buscar dados da empresa";
                      console.log(texto);
                      Utils.criarAlertaErro( this.bnAlertsService, texto,error);       
                      this.inicializaDadosDestino();
                  });              
              }
              self.ref.detectChanges();

           } //fecha if de PJ valida

           else {
            let texto = "Nenhuma empresa encontrada associada a conta blockchain";
            console.log(texto);
            Utils.criarAlertaAcaoUsuario( this.bnAlertsService, texto);       
            this.inicializaDadosDestino();
            this.transferencia.msgEmpresaDestino = "Conta Inválida"

             console.log("Não encontrou PJ valida para a conta blockchain");
           }
           
          },
          (error) => {
            let texto = "Erro ao buscar dados da conta";
            console.log(texto);
            Utils.criarAlertaErro( this.bnAlertsService, texto,error);       

            this.inicializaDadosDestino();
            console.warn("Erro ao buscar dados da conta na blockchain")
          })

                 
    } 
    else {
        this.inicializaDadosDestino();
    }
}

  validaEmpresaDestino(contaBlockchainDestino) {
    let self = this

    self.web3Service.isFornecedor(contaBlockchainDestino,
      (result) => {
        if (result) {
          self.transferencia.msgEmpresaDestino = "Fornecedor"
        } else {
          console.log("Conta Invalida")
          self.transferencia.msgEmpresaDestino = "Conta Inválida"
        }
        self.ref.detectChanges()
      },
      (erro) => {
        console.log(erro)
        self.transferencia.msgEmpresaDestino = ""
      })  
  }


  async transferir() {

    let self = this;

    let bClienteOrigem = await this.web3Service.isClienteSync(this.transferencia.contaBlockchainOrigem);
    if (!bClienteOrigem) {
      let s = "Conta de Origem não é de um cliente";
      this.bnAlertsService.criarAlerta("error", "Erro", s, 5);
      return;
    }

    let bFornecedorDestino = await this.web3Service.isFornecedorSync(this.transferencia.contaBlockchainDestino);
    if (!bFornecedorDestino) {
      let s = "Conta de Destino não é de um fornecedor";
      this.bnAlertsService.criarAlerta("error", "Erro", s, 5);
      return;
    }

    let bValidadaOrigem = await this.web3Service.isContaValidadaSync(this.transferencia.contaBlockchainOrigem);
    if (!bValidadaOrigem) {
      let s = "Conta de Origem não validada";
      this.bnAlertsService.criarAlerta("error", "Erro", s, 5);
      return;
    }
    let bValidadaDestino = await this.web3Service.isContaValidadaSync(this.transferencia.contaBlockchainDestino);
    if (!bValidadaDestino) {
      let s = "Conta de Destino não validada";
      this.bnAlertsService.criarAlerta("error", "Erro", s, 5);
      return;
    }

      
    //Multipliquei por 1 para a comparacao ser do valor (e nao da string)
    if ((this.transferencia.valorTransferencia * 1) > (this.transferencia.saldoOrigem * 1)) {

      console.log("saldoOrigem=" + this.transferencia.saldoOrigem);
      console.log("valorTransferencia=" + this.transferencia.valorTransferencia);

      let s = "Não é possível transferir mais do que o valor do saldo de origem.";
      this.bnAlertsService.criarAlerta("error", "Erro", s, 5);
      return;
    }


    this.web3Service.transfer(this.transferencia.contaBlockchainDestino, this.transferencia.valorTransferencia,

        (txHash) => {
        self.transferencia.hashOperacao = txHash;
        Utils.criarAlertasAvisoConfirmacao( txHash, 
                                            self.web3Service, 
                                            self.bnAlertsService, 
                                            "Transferência para cnpj " + self.transferencia.cnpjDestino + "  enviada. Aguarde a confirmação.", 
                                            "A Transferência foi confirmada na blockchain.", 
                                            self.zone);       
        self.router.navigate(['sociedade/dash-transf']);
        
        }        
      ,(error) => {
        Utils.criarAlertaErro( self.bnAlertsService, 
                                "Erro ao transferir na blockchain", 
                                error)  
      }
    );
    Utils.criarAlertaAcaoUsuario( self.bnAlertsService, 
                                  "Confirme a operação no metamask e aguarde a confirmação da transferência." )  
    }



}

import { Component, OnInit, NgZone  } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { DashboardPessoaJuridica } from '../dashboard-id-empresa/DashboardPessoaJuridica';
import { Web3Service } from './../Web3Service';
import { PessoaJuridicaService } from '../pessoa-juridica.service';
import { PessoaJuridica } from '../PessoaJuridica';
import { LogSol } from '../LogSol';
import { BnAlertsService } from 'bndes-ux4';
import { Router, ActivatedRoute } from '@angular/router';
import { Utils } from '../shared/utils';

@Component({
  selector: 'app-validacao-cadastro',
  templateUrl: './validacao-cadastro.component.html',
  styleUrls: ['./validacao-cadastro.component.css']
})
export class ValidacaoCadastroComponent implements OnInit {

  pj: PessoaJuridica;
  isHashInvalido: boolean = false;
  hashDeclaracaoDigitado: string;
  contaSelecionada: any;

  constructor(private pessoaJuridicaService: PessoaJuridicaService, protected bnAlertsService: BnAlertsService, private web3Service: Web3Service,
      private router: Router, private ref: ChangeDetectorRef, private zone: NgZone) {

  }

  ngOnInit() {   
    this.pj = {
      id: -1,
      cnpj: "",
      razaoSocial: "",
      idSubcredito: "",
      salic: "",
      contaBlockchain: "",
      hashDeclaracao: "",
      dadosBancarios: {
        banco: 0,
        agencia: 0,
        contaCorrente: ""
      },
      status: status
  };
  this.recuperaContaSelecionada();  
  }

  recuperaClientePorContaBlockchain(conta) {
    let self = this;    

    if ( conta != undefined && conta != "" && conta.length == 42 ) {

      self.web3Service.getPJInfo(conta,
          (result) => {

            if ( result.cnpj != 0 ) { //encontrou uma PJ valida  

              console.log(result);
              
              self.pj.cnpj = result.cnpj;
              self.pj.idSubcredito = result.idSubcredito;
              self.pj.salic = result.salic;
              self.pj.hashDeclaracao = result.hashDeclaracao;

              this.pessoaJuridicaService.recuperaEmpresaPorCnpj(result.cnpj).subscribe(
                empresa => {
                  if (empresa) {
                    self.pj.razaoSocial = empresa.dadosCadastrais.razaoSocial;
                  }
                  else {
                    console.error("Náo foi encontrada empresa para o CNPJ no banco de dados. CNPJ=" + result.cnpj);
                  }
              }) //fecha busca PJInfo


              self.web3Service.getEstadoContaAsString(conta,
                (result) => {
                    self.pj.status = result;
                },
                (error) => {
                  console.log("Erro ao verificar se a conta está ativa")
              })

           } //fecha if de PJ valida

           else {
             self.apagaCamposDaEstrutura();
             console.log("Não encontrou PJ valida para a conta blockchain");
           }
           
          },
          (error) => {
            self.apagaCamposDaEstrutura();
            console.warn("Erro ao buscar dados da conta na blockchain")
          })
    } 
    else {
        self.apagaCamposDaEstrutura();      
    }
}

  estaContaEstadoAguardandoValidacao() {
    if (this.pj && this.pj.status == "Aguardando validação do Cadastro") {
      return true;
    }
    else {
      return false;
    }
  }

  isHashDigitadoIgualAHashDeclaracao() {
    console.log(this.pj.hashDeclaracao);
    
    if (this.pj && this.pj.hashDeclaracao == this.hashDeclaracaoDigitado) {
      this.recuperaContaSelecionada()            
      return true;
    }
    else {
      return false;
    }
  }

  registrarLogSolidity() {
      let self = this;

      this.web3Service.registraEventosLog(function (error, event) {

          let eventoLog: LogSol;

          if (!error) {
              eventoLog = {
                  a: event.args.a,
                  b: event.args.b
              }

              console.log(eventoLog.a + eventoLog.b);
          }
          else {
              console.log("Erro no registro de eventos de log solidity");
              console.log(error);
          }
      });
  }

  async recuperaContaSelecionada() {
    if ( this.contaSelecionada === undefined ) {    
      this.contaSelecionada = await this.web3Service.getCurrentAccountSync();
      console.log("recuperaContaSelecionada() - carregando");     
    }
    console.log("contaSelecionada=" + this.contaSelecionada);      

  }  

  validarCadastro() {

    this.recuperaContaSelecionada()

    if (this.pj.contaBlockchain === undefined) {
      let s = "A conta blockchain é um Campo Obrigatório";
      this.bnAlertsService.criarAlerta("error", "Erro", s, 2);
      return;
    }

    if (this.hashDeclaracaoDigitado === undefined) {
      let s = "O hash da declaração é um Campo Obrigatório";
      this.bnAlertsService.criarAlerta("error", "Erro", s, 2);
      return;
    }

    if (this.contaSelecionada != this.web3Service.getAddressOwnerCacheble()) 
    {
        let s = "A validação exige que a conta do BNDES seja a selecionada no Metamask.";
        this.bnAlertsService.criarAlerta("error", "Erro", s, 5);
        console.log(s);
        console.log("this.contaSelecionada = " + this.contaSelecionada);
        console.log("this.web3Service.getAddressOwnerCacheble() = " + this.web3Service.getAddressOwnerCacheble());
        return;
    }
  

    let self = this;
    console.log("validarConta(): " + self.pj.contaBlockchain + " - " + self.hashDeclaracaoDigitado);

    let booleano = this.web3Service.validarCadastro(self.pj.contaBlockchain, self.hashDeclaracaoDigitado, 

      
         (txHash) => {
          Utils.criarAlertasAvisoConfirmacao( txHash, 
                                              self.web3Service, 
                                              self.bnAlertsService, 
                                              "Validação de conta enviada. Aguarde a confirmação.", 
                                              "O cadastro da conta foi validado e confirmado na blockchain.", 
                                              self.zone)
          self.router.navigate(['sociedade/dash-empresas']);                                                     
          }        
        ,(error) => {
          Utils.criarAlertaErro( self.bnAlertsService, 
                                 "Erro ao validar cadastro na blockchain", 
                                 error, 
                                 undefined )  
        }
      );
      Utils.criarAlertaAcaoUsuario( self.bnAlertsService, 
                                    "Confirme a operação no metamask e aguarde a confirmação.",
                                    undefined )         
  }

  invalidarCadastro() {

    this.recuperaContaSelecionada()

    let self = this;
    console.log("invalidarConta(): ");
    console.log(self.pj.contaBlockchain);

    if (this.pj.contaBlockchain === undefined) {
      let s = "A conta blockchain é um Campo Obrigatório";
      this.bnAlertsService.criarAlerta("error", "Erro", s, 2)
      return;
    }

    if (this.contaSelecionada != this.web3Service.getAddressOwnerCacheble()) 
    {
        let s = "A invalidação exige que a conta do BNDES seja a selecionada no Metamask.";
        this.bnAlertsService.criarAlerta("error", "Erro", s, 5);
        console.log(s);
        console.log("this.web3Service.getAddressOwnerCacheble() = " + this.web3Service.getAddressOwnerCacheble());
        return;
    }    

    let booleano = this.web3Service.invalidarCadastro(self.pj.contaBlockchain, 
      (result) => {
          let s = "O cadastro da conta foi invalidado.";
          self.bnAlertsService.criarAlerta("info", "Sucesso", s, 5);
          console.log(s);

          self.router.navigate(['sociedade/dash-empresas'])
    },
    (error) => {
      console.log("Erro ao invalidar cadastro")
    });
  }


  apagaCamposDaEstrutura() {

    let self = this;
    self.pj.cnpj = "";
    self.pj.razaoSocial = "";
    self.pj.idSubcredito = "";
    self.pj.salic = "";
    self.pj.status = "";
    self.pj.hashDeclaracao = "";
    self.hashDeclaracaoDigitado = "";
  }


}


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
  selectedAccount: any;

  constructor(private pessoaJuridicaService: PessoaJuridicaService, protected bnAlertsService: BnAlertsService, private web3Service: Web3Service,
      private router: Router, private ref: ChangeDetectorRef, private zone: NgZone) {

        let self = this;
        setInterval(function () {
          self.recuperaContaSelecionada(), 1000});
  
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
      dadosBancarios: undefined,
      status: status
   };
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
    if (this.pj && this.pj.hashDeclaracao == this.hashDeclaracaoDigitado) {
      return true;
    }
    else {
      return false;
    }
  }

  async recuperaContaSelecionada() {
    
    let self = this;
    
    let newSelectedAccount = await this.web3Service.getCurrentAccountSync();

    if ( !self.selectedAccount || (newSelectedAccount !== self.selectedAccount && newSelectedAccount)) {

      this.selectedAccount = newSelectedAccount;
      console.log("selectedAccount=" + this.selectedAccount);

    }
  }



  validarCadastro() {

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

    if (this.selectedAccount != this.web3Service.getAddressOwnerCacheble()) 
    {
        let s = "A validação exige que a conta do BNDES seja a selecionada no Metamask.";
        this.bnAlertsService.criarAlerta("error", "Erro", s, 5);
        console.log(s);
        console.log("this.contaSelecionada = " + this.selectedAccount);
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
                                 error )  
        }
      );
      Utils.criarAlertaAcaoUsuario( self.bnAlertsService, 
                                    "Confirme a operação no metamask e aguarde a confirmação." )         
  }

  invalidarCadastro() {

    let self = this;

    if (this.pj.contaBlockchain === undefined) {
      let s = "A conta blockchain é um Campo Obrigatório";
      this.bnAlertsService.criarAlerta("error", "Erro", s, 2)
      return;
    }

    if (this.selectedAccount != this.web3Service.getAddressOwnerCacheble()) 
    {
        let s = "A invalidação exige que a conta do BNDES seja a selecionada no Metamask.";
        this.bnAlertsService.criarAlerta("error", "Erro", s, 5);
        console.log(s);
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


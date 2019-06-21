import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { Router } from '@angular/router';

import { BnAlertsService } from 'bndes-ux4';

import { Fornecedor } from '../fornecedor/Fornecedor';
import { PessoaJuridicaService } from '../pessoa-juridica.service';
import { Web3Service } from './../Web3Service';
import { Utils } from '../shared/utils';

@Component({
  selector: 'app-recupera-conta-fornecedor',
  templateUrl: './recupera-acesso-fornecedor.component.html',
  styleUrls: ['./recupera-acesso-fornecedor.component.css']
})
export class RecuperaAcessoFornecedorComponent implements OnInit {

  fornecedor: Fornecedor;
  contaBlockchainAssociada: string
  contaEstaValida: boolean;
  selectedAccount: any;
  maskCnpj: any;
  hashdeclaracao: string;
  

  constructor(private pessoaJuridicaService: PessoaJuridicaService, protected bnAlertsService: BnAlertsService,
    private web3Service: Web3Service, private ref: ChangeDetectorRef, private zone: NgZone, private router: Router) { 

      let self = this;
      setInterval(function () {
        self.recuperaContaSelecionada(), 1000});

    }

  ngOnInit() {
    this.maskCnpj = Utils.getMaskCnpj(); 
    this.fornecedor = new Fornecedor();
    this.inicializaDadosTroca();
  }

  inicializaDadosTroca() {
    this.fornecedor.cnpj = "";
    this.fornecedor.dadosCadastrais = undefined;
    this.hashdeclaracao = "";    
  }

  
  changeCnpj() {

    console.log("Entrou no changelog");
    
    this.fornecedor.cnpj = Utils.removeSpecialCharacters(this.fornecedor.cnpjWithMask);
    let cnpj = this.fornecedor.cnpj;

    if ( cnpj.length == 14 ) { 
      console.log (" Buscando o CNPJ do cliente (14 digitos fornecidos)...  " + cnpj)
      this.recuperaFornecedorPorCNPJ(cnpj);
    } 
    else {
      this.inicializaDadosTroca();
    } 

  }


  cancelar() {
    this.fornecedor = new Fornecedor();    
    this.inicializaDadosTroca();
  }


  async recuperaContaSelecionada() {

    let newSelectedAccount = await this.web3Service.getCurrentAccountSync();

    if ( !this.selectedAccount || (newSelectedAccount !== this.selectedAccount && newSelectedAccount)) {

      this.selectedAccount = newSelectedAccount;
      console.log("selectedAccount=" + this.selectedAccount);
      this.verificaContaBlockchainSelecionada(this.selectedAccount); 
    }

  }


  verificaContaBlockchainSelecionada(contaBlockchainSelecionada) {
    
    if (contaBlockchainSelecionada) {

        this.web3Service.getEstadoContaAsString(contaBlockchainSelecionada,
          result => {

            this.contaEstaValida = result
                  
            setTimeout(() => {
              this.ref.detectChanges()
            }, 1000)

          },
          error => {
            console.error("Erro ao verificar o estado da conta")
          }
        )

    }

  }

  recuperaFornecedorPorCNPJ(cnpj) {
    console.log("RECUPERA FORNECEDOR com CNPJ = " + cnpj);

    this.pessoaJuridicaService.recuperaEmpresaPorCnpj(cnpj).subscribe(
      empresa => {
        if (empresa && empresa.dadosCadastrais) {
          console.log("Empresa encontrada - ");
          console.log(empresa);

          this.fornecedor.dadosCadastrais = empresa["dadosCadastrais"];
          this.recuperaContaBlockchainFornecedor();

        }
        else {
          let texto = "nenhuma empresa encontrada";
          console.log(texto);
          Utils.criarAlertaAcaoUsuario( this.bnAlertsService, texto);
        }
      },
      error => {
        let texto = "Erro ao buscar dados da empresa";
        console.log(texto);
        Utils.criarAlertaErro( this.bnAlertsService, texto,error);
        this.inicializaDadosTroca();
      });
      
  }


  recuperaContaBlockchainFornecedor() {

    let self = this;

    this.web3Service.getContaBlockchain(this.fornecedor.cnpj, 0,
      function (result) {
        console.log("Conta blockchain associada a " + self.fornecedor.cnpj +  " é " + result);
        self.contaBlockchainAssociada = result;
        self.ref.detectChanges();
      },
      function (error) {
        console.log("Erro ao ler o conta blockchain " + self.contaBlockchainAssociada);
        console.log(error);
      });  

  }   


  async trocaAssociacaoConta() {

    let self = this;
    let subcredito = 0

    if (!this.contaBlockchainAssociada) {
      let s = "O campo Conta Blockchain Atual é Obrigatório"
      this.bnAlertsService.criarAlerta("error", "Erro", s, 2)
      return;
    }

    let bFornc = await this.web3Service.isFornecedorSync(this.contaBlockchainAssociada);
    if (!bFornc) {
      let s = "Conta não é de um fornecedor";
      this.bnAlertsService.criarAlerta("error", "Erro", s, 5);
      return;
    }

    if (this.hashdeclaracao==undefined || this.hashdeclaracao==null) {
      let s = "O Hash da declaração é um Campo Obrigatório";
      this.bnAlertsService.criarAlerta("error", "Erro", s, 2)
      return;
    }
    else if (!Utils.isValidHash(this.hashdeclaracao)) {
      let s = "O Hash da declaração está preenchido com valor inválido";
      this.bnAlertsService.criarAlerta("error", "Erro", s, 2)
      return;
    }


    let bChangeAccountSync = await this.web3Service.isChangeAccountEnabledSync(this.contaBlockchainAssociada);
    if (!bChangeAccountSync) {
      let s = "A conta não está habilitada para troca. Contacte o BNDES";
      this.bnAlertsService.criarAlerta("error", "Erro", s, 5);
      return;
    }

    let isNewAccountAvailable = await this.web3Service.isContaDisponivelSync(this.selectedAccount);
    if (!isNewAccountAvailable) {
      let msg = "A nova conta não está disponível"
      console.log(msg);
      self.bnAlertsService.criarAlerta("error", "Erro", msg, 2);
      return;
    } 


    this.web3Service.trocaAssociacaoDeConta(parseInt(this.fornecedor.cnpj), 0, 0,this.hashdeclaracao,
    
         (txHash) => {

          Utils.criarAlertasAvisoConfirmacao( txHash, 
                                              self.web3Service, 
                                              self.bnAlertsService, 
                                              "Troca de conta do cnpj " + self.fornecedor.cnpj + "  enviada. Aguarde a confirmação.", 
                                              "A troca foi confirmada na blockchain.", 
                                              self.zone) 
          self.router.navigate(['sociedade/dash-empresas']);

          }        
        ,(error) => {
          Utils.criarAlertaErro( self.bnAlertsService, 
                                 "Erro ao associar na blockchain\nUma possibilidade é você já ter se registrado utilizando essa conta ethereum.", 
                                 error )  
        }
      );
      Utils.criarAlertaAcaoUsuario( self.bnAlertsService, 
                                    "Confirme a operação no metamask e aguarde a confirmação da associação da conta." )      

  }

}

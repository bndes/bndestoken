import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { Router } from '@angular/router';

import { BnAlertsService } from 'bndes-ux4';

import { Cliente, Subcredito } from './../associa-conta-cliente/Cliente';
import { PessoaJuridicaService } from '../pessoa-juridica.service';
import { Web3Service } from './../Web3Service';
import { Utils } from '../shared/utils';

@Component({
  selector: 'app-recupera-conta-cliente',
  templateUrl: './recupera-acesso-cliente.component.html',
  styleUrls: ['./recupera-acesso-cliente.component.css']
})
export class RecuperaAcessoClienteComponent implements OnInit {

  cliente: Cliente;
  numeroSubcreditoSelecionado: number;
  contaBlockchainAssociada: string;
  contaEstaValida: boolean
  selectedAccount: any;
  maskCnpj: any;
  hashdeclaracao: string;
  salic: string;


  constructor(private pessoaJuridicaService: PessoaJuridicaService, protected bnAlertsService: BnAlertsService,
    private web3Service: Web3Service, private ref: ChangeDetectorRef, private zone: NgZone, private router: Router) {

      let self = this;
      setInterval(function () {
        self.recuperaContaSelecionada(), 1000});

    }

  ngOnInit() {
    this.maskCnpj = Utils.getMaskCnpj(); 
    this.cliente = new Cliente();
    this.inicializaDadosTroca();    
  }

  inicializaDadosTroca() {
    this.cliente.dadosCadastrais = undefined;
    this.cliente.subcreditos = new Array<Subcredito>();
    this.numeroSubcreditoSelecionado = undefined;
    this.contaBlockchainAssociada = undefined;    
    this.hashdeclaracao = "";
    this.salic = undefined;
  }

  changeCnpj() {

    console.log("Entrou no changelog");
    this.cliente.cnpj = Utils.removeSpecialCharacters(this.cliente.cnpjWithMask);
    let cnpj = this.cliente.cnpj;
    this.inicializaDadosTroca();

    if ( cnpj.length == 14 ) { 
      console.log (" Buscando o CNPJ do cliente (14 digitos fornecidos)...  " + cnpj)
      this.recuperaClientePorCNPJ(cnpj);
    } 
  }


  cancelar() {
    this.cliente = new Cliente();
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


  recuperaClientePorCNPJ(cnpj) {
    console.log("RECUPERA CLIENTE com CNPJ = " + cnpj);

    this.pessoaJuridicaService.recuperaClientePorCnpj(cnpj).subscribe(
      empresa => {
        if (empresa && empresa.dadosCadastrais) {
          console.log("empresa encontrada - ");
          console.log(empresa);

          this.cliente.cnpj = cnpj;
          this.cliente.dadosCadastrais = empresa["dadosCadastrais"];

          if (empresa["subcreditos"] && empresa["subcreditos"].length>0) {

            for (var i = 0; i < empresa["subcreditos"].length; i++) {
            
              let subStr = JSON.parse(JSON.stringify(empresa["subcreditos"][i]));
              this.includeAccountIfAssociated(cnpj, subStr);
            }
               
          }
          else {
            let s = "Nenhum contrato encontrado associado a empresa.";
            this.bnAlertsService.criarAlerta("error", "Erro", s, 5);
            console.log(s);
          }

        }
        else {
          let texto = "Nenhum cliente encontrado";
          console.log(texto);
          Utils.criarAlertaAcaoUsuario( this.bnAlertsService, texto);
        }
      },
      error => {
        let texto = "Erro ao buscar dados do cliente";
        console.log(texto);
        Utils.criarAlertaErro( this.bnAlertsService, texto,error);
        this.inicializaDadosTroca();
      });

  }

  includeAccountIfAssociated (cnpj, sub) {

    this.web3Service.getPJInfoByCnpj(cnpj, sub.numero,
              
      (pjInfo) => {

        console.log("getConta");        

        console.log(pjInfo);        
  
        if (pjInfo.isTrocavel) { 
            this.includeIfNotExists(this.cliente.subcreditos, sub);
            this.numeroSubcreditoSelecionado = this.cliente.subcreditos[0].numero;
            this.recuperaContaBlockchainCliente();

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

    this.web3Service.getContaBlockchain(this.cliente.cnpj, this.numeroSubcreditoSelecionado,
      function (result) {
        console.log("Conta blockchain associada a " + self.cliente.cnpj +  " é " + result);
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

    if (!this.numeroSubcreditoSelecionado) {
      let s = "O contrato é um Campo Obrigatório";
      this.bnAlertsService.criarAlerta("error", "Erro", s, 2)
      return;
    }
    if (!this.contaBlockchainAssociada) {
      let msg = "O contrato selecionado não possui conta blockchain associada"
      console.log(msg);
      self.bnAlertsService.criarAlerta("error", "Erro", msg, 2);
      return;
    }

    let bCliente = await this.web3Service.isClienteSync(this.contaBlockchainAssociada);
    if (!bCliente) {
      let s = "Conta não é de um cliente";
      this.bnAlertsService.criarAlerta("error", "Erro", s, 5);
      return;
    }
    if (this.salic==undefined || this.salic==null) {
      let s = "O SALIC é um Campo Obrigatório";
      this.bnAlertsService.criarAlerta("error", "Erro", s, 2)
      return;
    }
    else if (!Utils.isValidSalic(this.salic)) {
        let s = "O SALIC está preenchido com valor inválido";
        this.bnAlertsService.criarAlerta("error", "Erro", s, 2)
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
   

    let isNewAccountAvailable = await this.web3Service.isContaDisponivelSync(this.selectedAccount);
    if (!isNewAccountAvailable) {
      let msg = "A nova conta não está disponível"
      console.log(msg);
      self.bnAlertsService.criarAlerta("error", "Erro", msg, 2);
      return;
    } 

    let bChangeAccountSync = await this.web3Service.isChangeAccountEnabledSync(this.contaBlockchainAssociada);
    if (!bChangeAccountSync) {
      let s = "A conta não está habilitada para troca. Contacte o BNDES";
      this.bnAlertsService.criarAlerta("error", "Erro", s, 5);
      return;
    }



    self.web3Service.trocaAssociacaoDeConta(parseInt(self.cliente.cnpj), 
       self.numeroSubcreditoSelecionado, Number(this.salic), this.hashdeclaracao,
    
        (txHash) => {

        Utils.criarAlertasAvisoConfirmacao( txHash, 
                                            self.web3Service, 
                                            self.bnAlertsService, 
                                            "Troca de conta do cnpj " + self.cliente.cnpj + "  enviada. Aguarde a confirmação.", 
                                            "A troca foi confirmada na blockchain.", 
                                            self.zone)
        self.router.navigate(['sociedade/dash-empresas']);                                                     
        }        
      ,(error) => {
        Utils.criarAlertaErro( self.bnAlertsService, 
                                "Erro ao trocar conta na blockchain", 
                                error)  
      }
    );
    Utils.criarAlertaAcaoUsuario( self.bnAlertsService, 
                                  "Confirme a operação no metamask e aguarde a confirmação da associação da conta." )       



  }

}

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
    this.cliente.id = 0;
    this.cliente.dadosCadastrais = undefined;
    this.cliente.subcreditos = new Array<Subcredito>();
    this.contaBlockchainAssociada = undefined;    
  }

  changeCnpj() {

    console.log("Entrou no changelog");
    this.cliente.cnpj = Utils.removeSpecialCharacters(this.cliente.cnpjWithMask);
    let cnpj = this.cliente.cnpj;

    if ( cnpj.length == 14 ) { 
      console.log (" Buscando o CNPJ do cliente (14 digitos fornecidos)...  " + cnpj)
      this.recuperaClientePorCNPJ(cnpj);
    } 
    else {
      this.inicializaDadosTroca();
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

    this.pessoaJuridicaService.recuperaEmpresaPorCnpj(cnpj).subscribe(
      empresa => {
        if (empresa) {
          console.log("empresa encontrada - ");
          console.log(empresa);

          this.cliente.cnpj = cnpj;
          this.cliente.dadosCadastrais = empresa["dadosCadastrais"];
          this.cliente.id = empresa["_id"];

          if (empresa["subcreditos"] && empresa["subcreditos"].length>0) {

            for (var i = 0; i < empresa["subcreditos"].length; i++) {
            
              let subStr = JSON.parse(JSON.stringify(empresa["subcreditos"][i]));
              this.includeAccountIfAssociated(cnpj, subStr);
            }
               
          }
          else {
            let s = "Nenhum subcrédito encontrado associado a empresa.";
            this.bnAlertsService.criarAlerta("error", "Erro", s, 5);
            console.log(s);
          }

        }
        else {
          console.log("nenhuma empresa encontrada");
        }
      },
      error => {
        console.log("Erro ao buscar dados da empresa");
        this.inicializaDadosTroca();
      });

  }

  includeAccountIfAssociated (cnpj, sub) {

    this.web3Service.getContaBlockchain(cnpj, sub.numero,
              
      (contaBlockchain) => {

        console.log("getConta");        

        console.log(contaBlockchain);        
  
        if (contaBlockchain!=0x0) { //If there is association in the blockchain
            this.includeIfNotExists(this.cliente.subcreditos, sub);
            this.numeroSubcreditoSelecionado = this.cliente.subcreditos[0].numero;
            this.recuperaContaBlockchainCliente();

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
    

    this.web3Service.getContaBlockchain(this.cliente.cnpj, this.numeroSubcreditoSelecionado,
      function (result) {
        console.log("Saldo do cnpj " + self.contaBlockchainAssociada + " eh " + result);
        self.contaBlockchainAssociada = result;
        self.ref.detectChanges();
      },
      function (error) {
        console.log("Erro ao ler o saldo do endereco " + self.contaBlockchainAssociada);
        console.log(error);
      });  

  }  

  cancelaAssociacaoContaCliente() {

    let self = this;

    if (!this.contaBlockchainAssociada) {
      console.log("O subcrédito selecionado não possui conta blockchain associada")

      let msg = "O subcrédito selecionado não possui conta blockchain associada"
      self.bnAlertsService.criarAlerta("error", "Erro", msg, 2);
      return;
    }

/*
    self.web3Service.trocaAssociacaoDeConta(parseInt(self.cliente.cnpj), self.numeroSubcreditoSelecionado, 0,
    
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
                                "Erro ao associar na blockchain\nUma possibilidade é você já ter se registrado utilizando essa conta ethereum.", 
                                error)  
      }
    );
    Utils.criarAlertaAcaoUsuario( self.bnAlertsService, 
                                  "Confirme a operação no metamask e aguarde a confirmação da associação da conta." )       

*/

  }

}

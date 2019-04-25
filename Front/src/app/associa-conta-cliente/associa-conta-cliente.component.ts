import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BnAlertsService } from 'bndes-ux4';


import { Cliente, Subcredito } from './Cliente';
import { PessoaJuridicaService } from '../pessoa-juridica.service';
import { Web3Service } from './../Web3Service';
import { Utils } from '../shared/utils';



@Component({
  selector: 'app-associa-conta-cliente',
  templateUrl: './associa-conta-cliente.component.html',
  styleUrls: ['./associa-conta-cliente.component.css']
})
export class AssociaContaClienteComponent implements OnInit {

  cliente: Cliente;
  subcreditoSelecionado: number;
  hashdeclaracao: string;
  salic: number;

  contaEstaValida: string;
  selectedAccount: any;

   maskCnpj: any;


  constructor(private pessoaJuridicaService: PessoaJuridicaService, protected bnAlertsService: BnAlertsService,
    private web3Service: Web3Service, private router: Router, private zone: NgZone, private ref: ChangeDetectorRef) {       

      let self = this;
      setInterval(function () {
        self.recuperaContaSelecionada(), 1000});
    }

  ngOnInit() {
    this.maskCnpj = Utils.getMaskCnpj(); 
    this.cliente = new Cliente();
    this.cliente.subcreditos = new Array<Subcredito>();
  }

  inicializaDadosDerivadosPessoaJuridica() {
    this.cliente.id = 0
    this.cliente.dadosCadastrais = undefined;
    this.cliente.subcreditos = new Array<Subcredito>();
  }

  changeCnpj() {

    this.cliente.cnpj = Utils.removeSpecialCharacters(this.cliente.cnpjWithMask);
    let cnpj = this.cliente.cnpj;

    if ( cnpj.length == 14 ) { 
      console.log (" Buscando o CNPJ do cliente (14 digitos fornecidos)...  " + cnpj)
      this.recuperaClientePorCNPJ(cnpj);
    } 
    else {
      this.inicializaDadosDerivadosPessoaJuridica();
    }  
  }

  cancelar() { 
    this.cliente = new Cliente();
    this.inicializaDadosDerivadosPessoaJuridica();
  }

  async recuperaContaSelecionada() {

    let self = this;
    
    let newSelectedAccount = await this.web3Service.getCurrentAccountSync();

    if ( !self.selectedAccount || (newSelectedAccount !== self.selectedAccount && newSelectedAccount)) {

      this.selectedAccount = newSelectedAccount;
      console.log("selectedAccount=" + this.selectedAccount);
      this.verificaEstadoContaBlockchainSelecionada(this.selectedAccount); 
    }

  }

  verificaEstadoContaBlockchainSelecionada(contaBlockchainSelecionada) {
    
    let self = this;
    console.log("result contaBlockchainSelecionada=" + contaBlockchainSelecionada);            

    if (contaBlockchainSelecionada) {

        this.web3Service.getEstadoContaAsString(contaBlockchainSelecionada,

          result => {

            self.contaEstaValida = result
            console.log("result conta=" + result);            
                  
            setTimeout(() => {
              self.ref.detectChanges()
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

    let self = this;

    this.pessoaJuridicaService.recuperaEmpresaPorCnpj(cnpj).subscribe(
      empresa => {
        if (empresa) {
          console.log("empresa encontrada - ");
          console.log(empresa);

          self.cliente.id = empresa["_id"];
          self.cliente.dadosCadastrais = empresa["dadosCadastrais"];

          for (var i = 0; i < empresa["subcreditos"].length; i++) {
           
            let subStr = JSON.parse(JSON.stringify(empresa["subcreditos"][i]));

            this.web3Service.getContaBlockchain(cnpj, subStr.numero,
              
              (contaBlockchain) => {

                console.log("contaBlockchain");
                console.log(contaBlockchain);

                if (contaBlockchain==0x0) { //If there is no association in the blockchain yet
                    self.includeIfNotExists(self.cliente.subcreditos, subStr);
                    self.subcreditoSelecionado = self.cliente.subcreditos[0].numero;
                }

              },
              (error) => {
                console.log("Erro ao verificar se subcredito estah associado na blockhain");
              })
          }

        }
        else {
          //Do no clean fields to better UX
          console.log("nenhuma empresa encontrada");
        }
      },
      error => {
        console.log("Erro ao buscar dados da empresa");
        this.inicializaDadosDerivadosPessoaJuridica();
      });

  }


  includeIfNotExists(subcreditos, subStr) {

    let include = true;
    for(var i=0; i < subcreditos.length; i++) { 
      if (subcreditos[i].numero==subStr.numero) {
        include=false;
      }
    }  
    if (include) subcreditos.push(subStr);
  }



  associarContaCliente() {

    let self = this;

    if (this.subcreditoSelecionado === undefined) {
      let s = "O Subcrédito é um Campo Obrigatório";
      this.bnAlertsService.criarAlerta("error", "Erro", s, 2)
      return
    }

    if (this.hashdeclaracao === undefined) {
      let s = "O Hash da declaração é um Campo Obrigatório";
      this.bnAlertsService.criarAlerta("error", "Erro", s, 2)
      return
    }  
    
    if (this.salic === undefined) {
      let s = "O SALIC é um Campo Obrigatório";
      this.bnAlertsService.criarAlerta("error", "Erro", s, 2)
      return
    }     

    this.web3Service.isContaDisponivel(this.selectedAccount, 
    
      (result) => {

        if (!result) {
          
          let msg = "A conta "+ this.selectedAccount +" não está disponível para associação"; 
          Utils.criarAlertaErro( self.bnAlertsService, "Conta não   disponível para associação", msg);  
        }

        else {

          this.web3Service.cadastra(parseInt(self.cliente.cnpj), self.subcreditoSelecionado, self.salic, self.hashdeclaracao,

            (txHash) => {
  
            Utils.criarAlertasAvisoConfirmacao( txHash, 
                                                self.web3Service, 
                                                self.bnAlertsService, 
                                                "Associação do cnpj " + self.cliente.cnpj + " enviada. Aguarde a confirmação.", 
                                                "A associação foi confirmada na blockchain.", 
                                                self.zone)       
            }        
          ,(error) => {
            Utils.criarAlertaErro( self.bnAlertsService, 
                                    "Erro ao associar na blockchain\nUma possibilidade é você já ter se registrado utilizando essa conta ethereum.", 
                                    error)  
          });
          Utils.criarAlertaAcaoUsuario( self.bnAlertsService, 
                                      "Confirme a operação no metamask e aguarde a confirmação da associação da conta.")
         

        } 

      }, (error) => {
        Utils.criarAlertaErro( self.bnAlertsService, 
          "Erro ao verificar se conta está disponível", 
          error);

      });


  }



  refreshContaBlockchainSelecionada() {
    this.recuperaContaSelecionada();
  }  
}

import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BnAlertsService } from 'bndes-ux4';


import { Cliente } from './Cliente';
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
  statusHabilitacaoForm: boolean;
  subcreditoSelecionado: number;
  hashdeclaracao: string;
  salic: number;

  file: any = null;

  declaracao: string
  declaracaoAssinada: string

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
    this.mudaStatusHabilitacaoForm(true);
    this.cliente = new Cliente();
  }

  inicializaDadosDerivadosPessoaJuridica() {
    this.cliente.id = 0
    this.cliente.dadosCadastrais = undefined
    this.cliente.subcreditos = undefined;
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
  }

  mudaStatusHabilitacaoForm(statusForm: boolean) {
    this.statusHabilitacaoForm = statusForm;
  }

  async recuperaContaSelecionada() {

    let self = this;
    
    let newSelectedAccount = await this.web3Service.getCurrentAccountSync();

    if (newSelectedAccount !== self.selectedAccount && newSelectedAccount) {

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

    this.pessoaJuridicaService.recuperaEmpresaPorCnpj(cnpj).subscribe(
      empresa => {
        if (empresa) {
          console.log("empresa encontrada - ");
          console.log(empresa);

          let subcreditos = new Array()

          for (var i = 0; i < empresa["subcreditos"].length; i++) {
            var teste1 = empresa["subcreditos"][i].papel === "cliente";
            var teste2 = empresa["subcreditos"][i].isActive;

            if (teste1 && teste2) {
              subcreditos.push(empresa["subcreditos"][i]);
            }
          }

          this.cliente.id = empresa["_id"];
          this.cliente.dadosCadastrais = empresa["dadosCadastrais"];
          this.cliente.subcreditos = JSON.parse(JSON.stringify(subcreditos));

          if (this.cliente.subcreditos && this.cliente.subcreditos.length>0) {            
            this.subcreditoSelecionado = this.cliente.subcreditos[0].numero;
          }

          this.declaracao = "Declaro que sou a empresa de Razão Social " + this.cliente.dadosCadastrais.razaoSocial + " com o CNPJ " + this.cliente.cnpj
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





  associarContaCliente() {

    let self = this;
//TODO: descobrir porque nao esta funcionando

/*

    console.log("hashdeclaracao=" + this.hashdeclaracao);

    console.log("salic=" + this.salic);

    let contaBlockchain = this.selectedAccount;
    console.log("contaBlockchain=" + contaBlockchain);

    let subcreditoSelecionado = this.subcreditoSelecionado;
    console.log("subcreditoSelecionado=" + subcreditoSelecionado);

    if (subcreditoSelecionado === undefined) {
      let s = "O Subcrédito é um Campo Obrigatório";
      this.bnAlertsService.criarAlerta("error", "Erro", s, 2)
      return
    }


    this.web3Service.isContaDisponivel(this.selectedAccount, 
    
      (result) => {

        console.log("RESULT=" + result);

        if (!result) {
          
          Utils.criarAlertaErro( self.bnAlertsService, 
            "Conta não disponível", 
            "A conta "+ this.selectedAccount +" não está disponível para associação", 
            self.mudaStatusHabilitacaoForm )  

        }

        else {

          this.web3Service.cadastra(parseInt(self.cliente.cnpj), subcreditoSelecionado, this.salic, this.hashdeclaracao,

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
                                    error, 
                                    self.mudaStatusHabilitacaoForm )  
          });
          Utils.criarAlertaAcaoUsuario( self.bnAlertsService, 
                                      "Confirme a operação no metamask e aguarde a confirmação da associação da conta.",
                                      self.mudaStatusHabilitacaoForm )
         
        }

      }, (error) => {
        Utils.criarAlertaErro( self.bnAlertsService, 
          "Erro ao verificar se conta está disponível", 
          error, 
          self.mudaStatusHabilitacaoForm )  
      }
      
    );
*/

  }




  refreshContaBlockchainSelecionada() {
    this.recuperaContaSelecionada();
  }  
}

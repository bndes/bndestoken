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
  salic: string;

  contaEstaValida: string;
  selectedAccount: any;

   maskCnpj: any;


  constructor(private pessoaJuridicaService: PessoaJuridicaService, protected bnAlertsService: BnAlertsService,
    private web3Service: Web3Service, private router: Router, private zone: NgZone, private ref: ChangeDetectorRef) {       

      let self = this;
      setInterval(function () {
        self.recuperaContaSelecionada(), 
        1000});
    }

  ngOnInit() {
    this.maskCnpj = Utils.getMaskCnpj(); 
    this.cliente = new Cliente();
    this.cliente.subcreditos = new Array<Subcredito>();
  }

  inicializaDadosDerivadosPessoaJuridica() {
    this.cliente.dadosCadastrais = undefined;
    this.subcreditoSelecionado = undefined;
    this.cliente.subcreditos = new Array<Subcredito>();
  }

  changeCnpj() {

    this.cliente.cnpj = Utils.removeSpecialCharacters(this.cliente.cnpjWithMask);
    let cnpj = this.cliente.cnpj;
    this.inicializaDadosDerivadosPessoaJuridica();

    if ( cnpj.length == 14 ) { 
      console.log (" Buscando o CNPJ do cliente (14 digitos fornecidos)...  " + cnpj)
      this.recuperaClientePorCNPJ(cnpj);
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

    this.pessoaJuridicaService.recuperaClientePorCnpj(cnpj).subscribe(
      empresa => {
        if (empresa && empresa.dadosCadastrais) {
          console.log("empresa encontrada - ");
          console.log(empresa);
          this.inicializaDadosDerivadosPessoaJuridica();
          
          self.cliente.dadosCadastrais = empresa["dadosCadastrais"];

          for (var i = 0; i < empresa["subcreditos"].length; i++) {
           
            let subStr = JSON.parse(JSON.stringify(empresa["subcreditos"][i]));
            self.includeAccountIfNoAssociated(self, cnpj, subStr);

          }

        }
        else {
          //Do no clean fields to better UX
          let texto = "Nenhum cliente encontrado";
          console.log(texto);
          Utils.criarAlertaAcaoUsuario(this.bnAlertsService, texto);

        }
      },
      error => {
        let texto = "Erro ao buscar dados do cliente";
        console.log(texto);
        Utils.criarAlertaErro( this.bnAlertsService, texto,error);
        this.inicializaDadosDerivadosPessoaJuridica();
      });

  }

  includeAccountIfNoAssociated (self, cnpj, sub) {

    self.web3Service.getPJInfoByCnpj(cnpj, sub.numero,
              
      (pjInfo) => {
  
        if (pjInfo.isAssociavel) { 

            self.includeIfNotExists(self.cliente.subcreditos, sub);
            self.subcreditoSelecionado = self.cliente.subcreditos[0].numero;
        }
  
      },
      (error) => {
        console.log("Erro ao verificar se contrato estah associado na blockhain");
        console.log(error);
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



  associarContaCliente() {

    let self = this;

    if (this.subcreditoSelecionado === undefined) {
      let s = "O Contrato é um Campo Obrigatório";
      this.bnAlertsService.criarAlerta("error", "Erro", s, 2)
      return
    }

    if (this.salic==undefined || this.salic==null) {
      let s = "O SALIC é um Campo Obrigatório";
      this.bnAlertsService.criarAlerta("error", "Erro", s, 2)
      return
    }
    else if (!Utils.isValidSalic(this.salic)) {
      let s = "O SALIC está preenchido com valor inválido";
      this.bnAlertsService.criarAlerta("error", "Erro", s, 2)
      return;  
  }    

    if (this.hashdeclaracao==undefined || this.hashdeclaracao==null) {
      let s = "O Hash da declaração é um Campo Obrigatório";
      this.bnAlertsService.criarAlerta("error", "Erro", s, 2)
      return
    } 
    else if (!Utils.isValidHash(this.hashdeclaracao)) {
      let s = "O Hash da declaração está preenchido com valor inválido";
      this.bnAlertsService.criarAlerta("error", "Erro", s, 2)
      return;
    }
    


    this.web3Service.isContaDisponivel(this.selectedAccount, 
    
      (result) => {

        if (!result) {
          
          let msg = "A conta "+ this.selectedAccount +" não está disponível para associação"; 
          Utils.criarAlertaErro( self.bnAlertsService, "Conta não disponível para associação", msg);  
        }

        else {

          this.web3Service.cadastra(parseInt(self.cliente.cnpj), self.subcreditoSelecionado, Number(self.salic), self.hashdeclaracao,

            (txHash) => {
  
            Utils.criarAlertasAvisoConfirmacao( txHash, 
                                                self.web3Service, 
                                                self.bnAlertsService, 
                                                "Associação do cnpj " + self.cliente.cnpj + " enviada. Aguarde a confirmação.", 
                                                "A associação foi confirmada na blockchain.", 
                                                self.zone) 
            self.router.navigate(['sociedade/dash-empresas']);
            
            }        
          ,(error) => {
            Utils.criarAlertaErro( self.bnAlertsService, 
                                    "Erro ao associar na blockchain", 
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

}

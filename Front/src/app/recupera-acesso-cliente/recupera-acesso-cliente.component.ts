import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { Router } from '@angular/router';

import { BnAlertsService } from 'bndes-ux4';

import { Cliente } from './Cliente';
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
  statusHabilitacaoForm: boolean;
  subcreditoSelecionado: number;
  contaBlockchainAssociada: string;
  contaSelecionada: any;
  hashdeclaracao: string;

  file: any = null;

  declaracao: string
  declaracaoAssinada: string

  contaEstaValida: boolean

  constructor(private pessoaJuridicaService: PessoaJuridicaService, protected bnAlertsService: BnAlertsService,
    private web3Service: Web3Service, private ref: ChangeDetectorRef, private zone: NgZone, private router: Router) { }

  ngOnInit() {
    this.mudaStatusHabilitacaoForm(true);
    this.inicializaPessoaJuridica();
    this.recuperaContaSelecionada();    
  }

  inicializaPessoaJuridica() {
    this.cliente = new Cliente();
    this.cliente.id = 0;
    this.cliente.cnpj = "";
    this.cliente.dadosCadastrais = undefined;
    this.cliente.subcreditos = undefined;
    this.subcreditoSelecionado = 0;
    this.hashdeclaracao = "";
  }

  refreshContaBlockchainSelecionada() {
    this.recuperaContaSelecionada();
  }

  uploadArquivo(idElemento: string) {
    this.file = (<HTMLInputElement>document.getElementById(idElemento)).files[0];

    var fileReader = new FileReader();
    fileReader.readAsText(this.file, "UTF-8");

    return fileReader;
  }

  onKey(cnpj : string) { 
    if ( cnpj.length == 14 ) {
      console.log (" Buscando o CNPJ do cliente (14 digitos fornecidos)...  " + cnpj)
      this.cliente.cnpj = cnpj;
      this.recuperaClientePorCNPJ(cnpj);
      this.recuperaContaBlockchainCliente();
    }   
  }

  receberDeclaracaoAssinada(declaracaoAssinadaRecebida) {
    console.log(declaracaoAssinadaRecebida)

    this.declaracaoAssinada = declaracaoAssinadaRecebida
  }

  cancelar() {
    this.cliente.dadosCadastrais = undefined
  }

  mudaStatusHabilitacaoForm(statusForm: boolean) {
    this.statusHabilitacaoForm = statusForm;
  }

  async recuperaContaSelecionada() {

    let self = this;
    
    this.contaSelecionada = await this.web3Service.getCurrentAccountSync();
    console.log("contaSelecionada=" + this.contaSelecionada);      
    this.verificaContaBlockchainSelecionada(this.contaSelecionada); 

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
          console.log("nenhuma empresa encontrada");
        }
      },
      error => {
        console.log("Erro ao buscar dados da empresa");
        this.inicializaPessoaJuridica();
      });

  }

  recuperaContaBlockchainCliente() {

    let self = this;

    this.web3Service.getContaBlockchain(this.cliente.cnpj, this.subcreditoSelecionado,
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
    let contaBlockchain = this.contaSelecionada;

    if (self.contaBlockchainAssociada === "" || self.contaBlockchainAssociada === undefined) {
      console.log("O subcrédito selecionado não possui conta blockchain associada")

      let msg = "O subcrédito selecionado não possui conta blockchain associada"
      self.bnAlertsService.criarAlerta("error", "Erro", msg, 2);
    } else if (self.hashdeclaracao === "" || self.hashdeclaracao === undefined) {
      console.log("Não for informado o hash da declaração");

      let msg = "Não for informado o hash da declaração";
      self.bnAlertsService.criarAlerta("error", "Erro", msg, 2);      
    }
    else {

      self.web3Service.cancelarAssociacaoDeConta(parseInt(self.cliente.cnpj), self.subcreditoSelecionado, 0, false,
      
         (txHash) => {

          Utils.criarAlertasAvisoConfirmacao( txHash, 
                                              self.web3Service, 
                                              self.bnAlertsService, 
                                              "Troca de conta do cnpj " + self.cliente.cnpj + "  enviada. Aguarde a confirmação.", 
                                              "A troca foi confirmada na blockchain.", 
                                              self.zone)       
          }        
        ,(error) => {
          Utils.criarAlertaErro( self.bnAlertsService, 
                                 "Erro ao associar na blockchain\nUma possibilidade é você já ter se registrado utilizando essa conta ethereum.", 
                                 error, 
                                 self.mudaStatusHabilitacaoForm )  
        }
      );
      Utils.criarAlertaAcaoUsuario( self.bnAlertsService, 
                                    "Confirme a operação no metamask e aguarde a confirmação da associação da conta.",
                                    self.mudaStatusHabilitacaoForm )       
    }
  }
}

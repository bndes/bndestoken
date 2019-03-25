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
  contaSelecionada: any;


  constructor(private pessoaJuridicaService: PessoaJuridicaService, protected bnAlertsService: BnAlertsService,
    private web3Service: Web3Service, private router: Router, private zone: NgZone, private ref: ChangeDetectorRef) { }

  ngOnInit() {
    this.mudaStatusHabilitacaoForm(true);
    this.inicializaPessoaJuridica();
    this.recuperaContaSelecionada();
  }

  inicializaPessoaJuridica() {

    this.cliente = new Cliente()
    this.cliente.id = 0
    this.cliente.cnpj = ""
    this.cliente.dadosCadastrais = undefined
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
    }   
  }

  carregaCertificadoDigital($event): void {
    let self = this;

    var fileReader = this.uploadArquivo("certificado");

    fileReader.onload = function (e) {
      self.cliente.cnpj = fileReader.result
      self.recuperaClientePorCNPJ(self.cliente.cnpj.trim())
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


  associaContaCliente() {

    let self = this;

    //console.log("hashdeclaracao(ANTES)=" + this.hashdeclaracao);
    //this.hashdeclaracao = this.pessoaJuridicaService.geraHash( this.hashdeclaracao );
    console.log("hashdeclaracao=" + this.hashdeclaracao);

    console.log("salic=" + this.salic);

    let contaBlockchain = this.contaSelecionada;
    console.log("contaBlockchain=" + contaBlockchain);

    let subcreditoSelecionado = this.subcreditoSelecionado;
    console.log("subcreditoSelecionado=" + subcreditoSelecionado);

    if (subcreditoSelecionado === undefined) {
      let s = "O Subcrédito é um Campo Obrigatório";
      this.bnAlertsService.criarAlerta("error", "Erro", s, 2)
      return
    }

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
        }
      );
      Utils.criarAlertaAcaoUsuario( self.bnAlertsService, 
                                    "Confirme a operação no metamask e aguarde a confirmação da associação da conta.",
                                    self.mudaStatusHabilitacaoForm )

  }
}

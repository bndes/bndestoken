import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { Router } from '@angular/router';

import { BnAlertsService } from 'bndes-ux4';

import { Cliente } from './Cliente';
import { PessoaJuridicaService } from '../pessoa-juridica.service';
import { Web3Service } from './../Web3Service';


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
      this.recuperaClientePorCNPJComSubcreditosComConta(cnpj);
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


  recuperaClientePorCNPJComSubcreditosComConta(cnpj) {
    console.log("RECUPERA CLIENTE com CNPJ = " + cnpj);

    this.pessoaJuridicaService.recuperaEmpresaPorCnpj(cnpj).subscribe(
      empresa => {
        if (empresa) {
          console.log("empresa encontrada - ");
          console.log(empresa);

          let subcreditos = new Array()


          for (var i = 0; i < empresa["subcreditos"].length; i++) {
            var teste1 = empresa["subcreditos"][i].papel === "cliente";
            var teste2 = empresa["subcreditos"][i].contaBlockchain != "";
            var teste3 = empresa["subcreditos"][i].isActive;

            if (teste1 && teste2 && teste3) {
              subcreditos.push(empresa["subcreditos"][i]);
            }
          }

          this.cliente.id = empresa["_id"];
          this.cliente.dadosCadastrais = empresa["dadosCadastrais"];
          this.cliente.subcreditos = JSON.parse(JSON.stringify(subcreditos));

          if (this.cliente.subcreditos && this.cliente.subcreditos.length>0) {            
            this.subcreditoSelecionado = this.cliente.subcreditos[0].numero;
            this.contaBlockchainAssociada = this.cliente.subcreditos[0].contaBlockchain;            
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

  recuperaContaBlockchainAssociada() {

    console.log("RECUPERA Conta Blockchain associada ao subcrédito");
    console.log(this.subcreditoSelecionado);

    var i = 0;

    for (i = 0; this.cliente.subcreditos[i]; i++) {
      console.log("i=" + i);
        if (this.cliente.subcreditos[i].numero == this.subcreditoSelecionado) {
          console.log("Dentro do if"); 
          this.contaBlockchainAssociada = this.cliente.subcreditos[i].contaBlockchain;
        }
    }

    console.log("Conta Blockchain Associada = " + this.contaBlockchainAssociada);
  }

  cancelaAssociacaoContaCliente() {

    let self = this;
    let contaBlockchain = this.contaSelecionada;

    if (self.contaBlockchainAssociada === "" || self.contaBlockchainAssociada === undefined) {
      console.log("O subcrédito selecionado não possui conta blockchain associada")

      let msg = "O subcrédito selecionado não possui conta blockchain associada"
      self.bnAlertsService.criarAlerta("error", "Erro", msg, 2);
    } else {

      self.web3Service.cancelarAssociacaoDeConta(parseInt(self.cliente.cnpj), self.subcreditoSelecionado, 0, false,

        function (txHash) {
          let s = "Troca de conta do cnpj " + self.cliente.cnpj + "  enviada. Aguarde a confirmação.";
          self.bnAlertsService.criarAlerta("info", "Sucesso", s, 5);
          console.log(s);

          self.web3Service.registraWatcherEventosLocal(txHash, function (error, result) {
            if (!error) {
              let s = "A associação foi confirmada na blockchain.";
              self.bnAlertsService.criarAlerta("info", "Sucesso", s, 5);
              console.log(s);

              console.log("Início da gravação no BD");

              self.pessoaJuridicaService.trocarContaCliente(self.cliente, self.subcreditoSelecionado, contaBlockchain).subscribe(
                data => {
                  console.log("PJ alterada no mongo - ")

                  self.router.navigate(['sociedade/dash-empresas'])
                },
                error => {
                  let s = "Não foi possível realizar atualização no banco de dados, embora os dados tenham sido cadastrados na blockchain"
                  self.bnAlertsService.criarAlerta("error", "Erro", s, 5)
                  console.log(s + error)
                  self.mudaStatusHabilitacaoForm(true)
                }
              );

              console.log("Fim da gravação no BD");

              self.zone.run(() => { });
            }
            else {
              console.log(error);
            }
          });
        },
        function (error) {

          let s = "Erro ao cadastrar na blockchain\nUma possibilidade é você já ter se registrado utilizando essa conta ethereum."
          self.bnAlertsService.criarAlerta("error", "Erro", s, 5)
          console.log(s)
          console.log(error)
          self.mudaStatusHabilitacaoForm(true);
        })
    }

  }

}

import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core'
import { Router } from '@angular/router';

import { BnAlertsService } from 'bndes-ux4'
import { Repassador } from '../Repassador/Repassador'

import { PessoaJuridicaService } from '../pessoa-juridica.service'
import { Web3Service } from './../Web3Service'

import WebSign from 'websign-client'

@Component({
  selector: 'app-recupera-acesso-repassador',
  templateUrl: './recupera-acesso-repassador.component.html',
  styleUrls: ['./recupera-acesso-repassador.component.css']
})
export class RecuperaAcessoRepassadorComponent implements OnInit {

  repassador: Repassador
  statusHabilitacaoForm: boolean
  subcreditoSelecionado: number
  contaBlockchainAssociada: string

  file: any = null

  declaracao: string
  declaracaoAssinada: string

  cnpjCliente: string
  subcreditosCliente: any = []

  listaSubcreditos = []

  maskCnpj = [/\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/]

  cnpjSomenteNumeros: string

  contaEstaValida: boolean;
  contaBlockchainSelecionada: string;

  constructor(private pessoaJuridicaService: PessoaJuridicaService, protected bnAlertsService: BnAlertsService,
    private web3Service: Web3Service, private ref: ChangeDetectorRef, private zone: NgZone, private router: Router) { }

  ngOnInit() {
    this.mudaStatusHabilitacaoForm(true)
    this.inicializaPessoaJuridica()

    this.declaracaoAssinada = undefined
  }

  inicializaPessoaJuridica() {
    this.repassador = new Repassador()
    this.repassador.id = 0
    this.repassador.cnpj = ""
    this.repassador.dadosCadastrais = undefined
    this.repassador.subcreditos = undefined

    this.cnpjCliente = ""
    this.subcreditosCliente = []
  }

  refreshContaBlockchainSelecionada() {
    this.recuperaContaSelecionada()
  }

  uploadArquivo(idElemento: string) {
    this.file = (<HTMLInputElement>document.getElementById(idElemento)).files[0]

    var fileReader = new FileReader()
    fileReader.readAsText(this.file, "UTF-8")

    return fileReader
  }

  carregaCertificadoDigital($event): void {
    let self = this

    var fileReader = this.uploadArquivo("certificado")

    fileReader.onload = function (e) {
      self.repassador.cnpj = fileReader.result
      self.recuperaRepassadorPorCNPJ(self.repassador.cnpj.trim())
    }
  }

  receberDeclaracaoAssinada(declaracaoAssinadaRecebida) {
    console.log(declaracaoAssinadaRecebida)

    this.declaracaoAssinada = declaracaoAssinadaRecebida
  }

  mudaStatusHabilitacaoForm(statusForm: boolean) {
    this.statusHabilitacaoForm = statusForm
  }

  async recuperaContaSelecionada() {
    this.contaBlockchainSelecionada = (await this.web3Service.getCurrentAccountSync()) + "";
    this.verificaContaBlockchainSelecionada(this.contaBlockchainSelecionada);
  }
  

  verificaContaBlockchainSelecionada(contaBlockchainSelecionada) {
    this.web3Service.accountIsActive(contaBlockchainSelecionada,
      result => {

        if (result) {
          this.contaEstaValida = false
        } else {
          this.contaEstaValida = true
        }
        setTimeout(() => {
          this.ref.detectChanges()
        }, 1000)

      },
      error => {
        console.error("Erro ao verificar o estado da conta")
      }
    )
  }

  removerCaracteresEspeciais(cnpj) {
    return cnpj.replace(/-/g, '').replace(/\./g, '').replace('/', '').replace(/_/g, '')
  }

  recuperaClientePorCNPJ(cnpj) {
    console.log("RECUPERA CLIENTE com CNPJ = " + cnpj)

    this.cnpjSomenteNumeros = this.removerCaracteresEspeciais(cnpj)

    this.pessoaJuridicaService.recuperaEmpresaPorCnpj(this.cnpjSomenteNumeros).subscribe(
      empresa => {
        if (empresa) {
          console.log("empresa encontrada - ")
          console.log(empresa)

          let subcreditos = new Array()

          for (var i = 0; i < empresa["subcreditos"].length; i++) {
            if (empresa["subcreditos"][i].papel === "cliente" && empresa["subcreditos"][i].isActive)
              subcreditos.push(empresa["subcreditos"][i]);
          }

          this.subcreditosCliente = JSON.parse(JSON.stringify(subcreditos))

          this.filtrarListaDeSubcreditos(this.subcreditosCliente)
        }
        else {
          console.log("nenhuma empresa encontrada")
          this.subcreditosCliente = []
        }
      },
      error => {
        console.log("Erro ao buscar dados da empresa")
        this.inicializaPessoaJuridica()
      })

  }

  filtrarListaDeSubcreditos(subcreditosCliente) {
    let self = this

    self.listaSubcreditos = []

    subcreditosCliente.forEach(subcreditoCliente => {
      this.repassador.subcreditos.forEach(subcreditoRepassador => {
        if (subcreditoRepassador.papel === "repassador" && subcreditoCliente.nome == subcreditoRepassador.nome && subcreditoCliente.numero == subcreditoRepassador.numero) {
          self.listaSubcreditos.push(
            {
              numero: subcreditoRepassador.numero,
              nome: subcreditoRepassador.nome,
              contaBlockchain: subcreditoRepassador.contaBlockchain
            })
        }
      })
    })

  }

  recuperaRepassadorPorCNPJ(cnpj) {

    console.log("RECUPERA REPASSADOR com CNPJ = " + cnpj)

    this.pessoaJuridicaService.recuperaEmpresaPorCnpj(cnpj).subscribe(
      empresa => {
        if (empresa) {
          console.log("Empresa encontrada - ")
          console.log(empresa)

          this.repassador.id = empresa["_id"]
          this.repassador.dadosCadastrais = empresa["dadosCadastrais"]
          this.repassador.subcreditos = empresa["subcreditos"]

          this.declaracao = "Declaro que sou a empresa de Razão Social " + this.repassador.dadosCadastrais.razaoSocial + " com o CNPJ " + this.repassador.cnpj

        }
        else {
          console.log("Nenhuma empresa encontrada")
        }
      },
      error => {
        console.log("Erro ao buscar dados da empresa")
        this.inicializaPessoaJuridica()
      })

  }

  recuperaContaBlockchainAssociada() {

    console.log("Recupera Conta Blockchain associada ao subcrédito")

    var i = 0

    for (i = 0; this.repassador.subcreditos[i]; i++) {
      if (this.repassador.subcreditos[i].numero == this.subcreditoSelecionado.toString()) {
        this.contaBlockchainAssociada = this.repassador.subcreditos[i].contaBlockchain
      }
    }

  }

  cancelaAssociacaoContaRepassador() {

    let self = this
    let contaBlockchain = this.contaBlockchainSelecionada;

    if (this.cnpjCliente === undefined || this.subcreditoSelecionado === undefined) {
      let s = "Os campos CNPJ do Cliente e Subcrédito do Cliente são Obrigatórios"
      this.bnAlertsService.criarAlerta("error", "Erro", s, 2)
      return
    }

    if (self.contaBlockchainAssociada === "" || self.contaBlockchainAssociada === undefined) {
      let msg = "O subcrédito selecionado não possui conta blockchain associada"
      self.bnAlertsService.criarAlerta("error", "Erro", msg, 5)
      return
    }

    self.web3Service.cancelarAssociacaoDeConta(parseInt(self.repassador.cnpj), self.subcreditoSelecionado, parseInt(this.removerCaracteresEspeciais(self.cnpjCliente)), true,

      function (txHash) {
        let s = "Troca de conta do cnpj " + self.repassador.cnpj + "  enviada. Aguarde a confirmação."
        self.bnAlertsService.criarAlerta("info", "Sucesso", s, 5)
        console.log(s)

        self.web3Service.registraWatcherEventosLocal(txHash, function (error, result) {
          if (!error) {
            let s = "A Troca de conta foi confirmada na blockchain."
            self.bnAlertsService.criarAlerta("info", "Sucesso", s, 5)
            console.log(s)

            console.log("Início da gravação no BD")
            self.pessoaJuridicaService.trocarContaRepassador(self.repassador, self.subcreditoSelecionado, contaBlockchain).subscribe(
              data => {
                console.log("PJ alterada no mongo - ")
                console.log(data)

                self.router.navigate(['sociedade/dash-empresas'])
              },
              error => {
                let s = "Não foi possível realizar atualização no banco de dados, embora os dados tenham sido cadastrados na blockchain"
                self.bnAlertsService.criarAlerta("error", "Erro", s, 5)
                console.log(s + " " + error)
                self.mudaStatusHabilitacaoForm(true)

              })

            self.zone.run(() => { })
          } else {
            console.log(error)
          }
        })
      },
      function (error) {

        let s = "Erro ao cadastrar na blockchain\nUma possibilidade é você já ter se registrado utilizando essa conta ethereum."
        self.bnAlertsService.criarAlerta("error", "Erro", s, 5)
        console.log(s)
        console.log(error)
        self.mudaStatusHabilitacaoForm(true)
      })
  }


}
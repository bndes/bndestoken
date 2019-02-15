import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { BnAlertsService } from 'bndes-ux4'

import { Repassador } from '../Repassador/Repassador';
import { PessoaJuridicaService } from '../pessoa-juridica.service'
import { Web3Service } from './../Web3Service'


@Component({
  selector: 'app-associa-conta-repassador',
  templateUrl: './associa-conta-repassador.component.html',
  styleUrls: ['./associa-conta-repassador.component.css']
})
export class AssociaContaRepassadorComponent implements OnInit {

  repassador: Repassador
  statusHabilitacaoForm: boolean
  subcreditoSelecionado: number

  file: any = null

  declaracao: string
  declaracaoAssinada: string

  cnpjCliente: string
  subcreditosCliente: any = []

  maskCnpj = [/\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/]

  cnpjSomenteNumeros: string

  contaEstaValida: boolean;
  contaSelecionada: any;
  

  constructor(private pessoaJuridicaService: PessoaJuridicaService, protected bnAlertsService: BnAlertsService,
    private web3Service: Web3Service, private router: Router, private zone: NgZone, private ref: ChangeDetectorRef, ) { }

  ngOnInit() {
    this.mudaStatusHabilitacaoForm(true)
    this.inicializaPessoaJuridica();
    this.recuperaContaSelecionada();
  }

  inicializaPessoaJuridica() {
    this.repassador = new Repassador()
    this.repassador.id = 0
    this.repassador.cnpj = ""
    this.repassador.dadosCadastrais = undefined
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

  limparCampos() {
    this.repassador.dadosCadastrais = undefined
    this.cnpjCliente = ""
    this.subcreditosCliente = []
  }

  mudaStatusHabilitacaoForm(statusForm: boolean) {
    this.statusHabilitacaoForm = statusForm
  }


  async recuperaContaSelecionada() {
    
    this.contaSelecionada = await this.web3Service.getCurrentAccountSync();
    console.log("contaSelecionada=" + this.contaSelecionada);      
    this.verificaContaBlockchainSelecionada(this.contaSelecionada); 

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

  recuperaRepassadorPorCNPJ(cnpj) {
    console.log("RECUPERA Repassador com CNPJ = " + cnpj)

    this.pessoaJuridicaService.recuperaEmpresaPorCnpj(cnpj).subscribe(
      empresa => {
        if (empresa) {
          console.log("empresa encontrada - ")
          console.log(empresa)

          this.repassador.id = empresa["_id"]
          this.repassador.dadosCadastrais = empresa["dadosCadastrais"]
          this.repassador.subcreditos = empresa["subcreditos"]

          this.declaracao = "Declaro que sou a empresa de Razão Social " + this.repassador.dadosCadastrais.razaoSocial + " com o CNPJ " + this.repassador.cnpj
        }
        else {
          console.log("nenhuma empresa encontrada")
        }
      },
      error => {
        console.log("Erro ao buscar dados da empresa")
        this.inicializaPessoaJuridica()
      })

  }

  adicionaSubcreditoConta(numeroSubcredito, contaBlockchainRecebida) {
    let nomeSubcredito

    for (var i = 0; i < this.subcreditosCliente.length; i++) {
      if (this.subcreditosCliente[i].numero == numeroSubcredito) {
        nomeSubcredito = this.subcreditosCliente[i].nome
      }
    }
    this.repassador.subcreditos.push({
      numero: numeroSubcredito,
      nome: nomeSubcredito,
      contaBlockchain: contaBlockchainRecebida,
      isActive: true,
      papel: "repassador"
    })
  }


  associaContaRepassador() {

    let self = this

    let contaBlockchain = this.recuperaContaSelecionada()
    console.log("contaBlockchain=" + contaBlockchain)

    let subcreditoSelecionado = this.subcreditoSelecionado
    console.log("subcreditoSelecionado=" + subcreditoSelecionado)

    if (this.cnpjCliente === undefined || subcreditoSelecionado === undefined) {
      let s = "Os campos CNPJ do Cliente e Subcrédito do Cliente são Obrigatórios"
      this.bnAlertsService.criarAlerta("error", "Erro", s, 2)
      return
    }

    this.adicionaSubcreditoConta(subcreditoSelecionado, contaBlockchain)

    this.web3Service.cadastra(parseInt(self.repassador.cnpj), subcreditoSelecionado, 0, parseInt(this.removerCaracteresEspeciais(self.cnpjCliente)), true,"",

      function (txHash) {
        let s = "Associação do cnpj " + self.repassador.cnpj + "  enviada. Aguarde a confirmação."
        self.bnAlertsService.criarAlerta("info", "Sucesso", s, 5)
        console.log(s)

        self.web3Service.registraWatcherEventosLocal(txHash, function (error, result) {
          if (!error) {
            let s = "A Associação de conta foi confirmada na blockchain."
            self.bnAlertsService.criarAlerta("info", "Sucesso", s, 5)
            console.log(s)

            console.log("Início da gravação no BD")
            self.pessoaJuridicaService.associaContaRepassador(self.repassador).subscribe(
              data => {
                console.log("PJ alterada no mongo - ")
                console.log(data)

                self.router.navigate(['sociedade/dash-empresas'])
              },
              error => {
                let s = "Não foi possível realizar atualização no banco de dados, embora os dados tenham sido cadastrados na blockchain"
                this.bnAlertsService.criarAlerta("error", "Erro", s, 5)
                console.log(s + error)
                self.mudaStatusHabilitacaoForm(true)

              })

            self.zone.run(() => { })
          } else {
            console.log(error)
          }
        })
      }, function (error) {

        let s = "Erro ao associar na blockchain\nUma possibilidade é você já ter se registrado utilizando essa conta ethereum."
        self.bnAlertsService.criarAlerta("error", "Erro", s, 5)
        console.log(s)
        console.log(error)
        self.mudaStatusHabilitacaoForm(true)
      })

    let s = "Confirme a operação no metamask e aguarde a confirmação da associação da conta."
    self.bnAlertsService.criarAlerta("info", "", s, 5)
    console.log(s)
    this.mudaStatusHabilitacaoForm(false)

  }
}

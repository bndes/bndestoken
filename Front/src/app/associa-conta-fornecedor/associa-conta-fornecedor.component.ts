import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { BnAlertsService } from 'bndes-ux4'

import { Fornecedor } from '../fornecedor/Fornecedor'
import { PessoaJuridicaService } from '../pessoa-juridica.service'
import { Web3Service } from './../Web3Service'


@Component({
  selector: 'app-associa-conta-fornecedor',
  templateUrl: './associa-conta-fornecedor.component.html',
  styleUrls: ['./associa-conta-fornecedor.component.css']
})
export class AssociaContaFornecedorComponent implements OnInit {

  fornecedor: Fornecedor
  statusHabilitacaoForm: boolean

  hashdeclaracao: string;

  file: any = null

  declaracao: string
  declaracaoAssinada: string

  contaEstaValida: boolean;
  contaSelecionada: any;


  constructor(private pessoaJuridicaService: PessoaJuridicaService, protected bnAlertsService: BnAlertsService,
    private web3Service: Web3Service, private router: Router, private zone: NgZone, private ref: ChangeDetectorRef) { }

  ngOnInit() {
    this.mudaStatusHabilitacaoForm(true)
    this.inicializaPessoaJuridica();
    this.recuperaContaSelecionada();
  }


  inicializaPessoaJuridica() {
    this.fornecedor = new Fornecedor()
    this.fornecedor.id = 0
    this.fornecedor.cnpj = ""
    this.fornecedor.dadosCadastrais = undefined
    this.fornecedor.contasFornecedor = undefined
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

  onKeyCNPJFornecedor(cnpj : string) { 
    if ( cnpj.length == 14 ) {
      console.log (" Buscando o CNPJ do fornecedor (14 digitos fornecidos)...  " + cnpj)
      this.fornecedor.cnpj = cnpj;
      this.recuperaFornecedorPorCNPJ(cnpj);
    }   
  }

  carregaCertificadoDigital($event): void {
    let self = this

    var fileReader = this.uploadArquivo("certificado")

    fileReader.onload = function (e) {
      self.fornecedor.cnpj = fileReader.result
      self.recuperaFornecedorPorCNPJ(self.fornecedor.cnpj.trim())
    }
  }

  receberDeclaracaoAssinada(declaracaoAssinadaRecebida) {

    this.declaracaoAssinada = declaracaoAssinadaRecebida
  }

  cancelar() {
    this.fornecedor.dadosCadastrais = undefined
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

  recuperaFornecedorPorCNPJ(cnpj) {
    console.log("RECUPERA Fornecedor com CNPJ =" + cnpj)

    this.pessoaJuridicaService.recuperaEmpresaPorCnpj(cnpj).subscribe(
      empresa => {
        if (empresa) {
          console.log("empresa encontrada - ")
          console.log(empresa)

          this.fornecedor.id = empresa["_id"]
          this.fornecedor.dadosCadastrais = empresa["dadosCadastrais"]

          //Simplificacao para front tratar apenas uma conta do fornecedor
          this.fornecedor.contasFornecedor = empresa["contasFornecedor"]

          this.declaracao = "Declaro que sou a empresa de Razão Social " + this.fornecedor.dadosCadastrais.razaoSocial + " com o CNPJ " + this.fornecedor.cnpj

          console.log("conta fornecedor - ")
          console.log(this.fornecedor.contasFornecedor)
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

  adicionaContaFornecedor(): Fornecedor {
    this.fornecedor.contasFornecedor.push({
      numero: 0,
      nome: "Principal",
      contaBlockchain: this.contaSelecionada,
      isActive: true
    })

    return this.fornecedor
  }

  associaContaFornecedor() {

    let self = this

    /*
    let erro = this.validaDadosBancarios()

    if (erro[0]) {
      this.bnAlertsService.criarAlerta("error", "Erro", erro[1], 2)
      return
    }*/

    let contaBlockchain = this.recuperaContaSelecionada()
    let fornecedor = this.adicionaContaFornecedor()

    console.log("Fornecedor - ")
    console.log(fornecedor)
    console.log("contaBlockchain = " + contaBlockchain)
    console.log("CNPJ do Fornecedor = " + self.fornecedor.cnpj)

    //this.hashdeclaracao = this.pessoaJuridicaService.geraHash( this.hashdeclaracao );
    console.log("this.hashdeclaracao = " + this.hashdeclaracao );

    this.web3Service.cadastra(parseInt(fornecedor.cnpj), 0, 0, this.hashdeclaracao,
      function (txHash) {
        let s = "Associação do cnpj " + fornecedor.cnpj + "  enviada. Aguarde a confirmação."
        self.bnAlertsService.criarAlerta("info", "Sucesso", s, 5)
        console.log(s)

        console.log("contaBlockchain 2 =" + contaBlockchain)

        self.web3Service.registraWatcherEventosLocal(txHash, function (error, result) {
          if (!error) {
            let s = "A associação de conta foi confirmada na blockchain."
            self.bnAlertsService.criarAlerta("info", "Sucesso", s, 5)
            self.zone.run(() => { });
            console.log(s)
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

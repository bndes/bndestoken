import { Component, OnInit, ChangeDetectorRef, ViewChild, TemplateRef } from '@angular/core';
import { RegistroSaldoContas } from './registro-saldo-contas';
import { PessoaJuridicaService } from '../pessoa-juridica.service';
import { Web3Service } from '../Web3Service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { BnAlertsService } from 'bndes-ux4';

@Component({
  selector: 'app-registro-saldo-contas',
  templateUrl: './registro-saldo-contas.component.html',
  styleUrls: ['./registro-saldo-contas.component.css']
})
export class RegistroSaldoContasComponent implements OnInit {

  p: number = 1;
  order: string = 'saldo';
  reverse: boolean = true;

  novoBanco: any
  novaAgencia: any
  novaContaCorrente: any
  novoDigitoContaCorrente: any

  declaracao: string
  declaracaoAssinada: string

  listaContaSaldo: RegistroSaldoContas[] = undefined
  estadoLista: string = "undefined"

  contaBlockchainSelecionada: string = ""

  ehFornecedor: boolean = false;
  closeResult: string

  posicaoRegistroQueSeraAlterado: number

  extratoAberto: boolean = false
  contaExtrato: string

  isActive: boolean[] = []

  constructor(private pessoaJuridicaService: PessoaJuridicaService, private web3Service: Web3Service,
    private ref: ChangeDetectorRef, private modalService: NgbModal, private bnAlertsService: BnAlertsService) { }

  ngOnInit() {
    this.iniciaRegistroSaldoConta()
  }

  iniciaRegistroSaldoConta() {
    setTimeout(() => {
      this.listaContaSaldo = []
      this.declaracaoAssinada = undefined

      this.recuperaContaSelecionada()
      this.recuperaContas(this.contaBlockchainSelecionada)
    }, 1000)

    setTimeout(() => {
      this.estadoLista = this.estadoLista === "undefined" ? "vazia" : "cheia"
      this.ref.detectChanges()
    }, 2000)
  }

  async recuperaContaSelecionada() {
    this.contaBlockchainSelecionada = (await this.web3Service.getCurrentAccountSync()) + "";
  }
  

  recuperaContas(contaBlockchainSelecionada) {

    let self = this;
    
/*
    this.pessoaJuridicaService.recuperaEmpresaPorContaBlockchain(contaBlockchainSelecionada).subscribe(
      data => {
        if (data) {
          let subcreditos = data['subcreditos']
          let contasFornecedor = data['contasFornecedor']

          this.declaracao = "Declaro que sou a empresa de Razão Social " + data['dadosCadastrais'].razaoSocial + " com o CNPJ " + data.cnpj

          if (subcreditos.length > 0) {
            for (var i = 0; i < subcreditos.length; i++) {

              if (subcreditos[i].contaBlockchain != "" && subcreditos[i].contaBlockchain != null) {
                self.recuperaSaldos(subcreditos[i], false)

              }
            }
          } 
          
          if (contasFornecedor.length > 0) {
            this.ehFornecedor = true

            for (var i = 0; i < contasFornecedor.length; i++) {

              if (contasFornecedor[i].contaBlockchain != "" && contasFornecedor[i].contaBlockchain != null) {
                self.recuperaSaldos(contasFornecedor[i], true)

              }
            }
          }
        }

      },
      error => {
        console.log("Erro ao recuperar a Conta Blockchain")
      }
    )
    */
  }

  recuperaSaldos(contaPJ, ehFornecedor) {

    console.log("RECUPERANDO OS SALDOS")

    let self = this
    let registroSaldoContas = new RegistroSaldoContas()

    this.web3Service.accountIsActive(contaPJ.contaBlockchain,
      (result) => {

        if (result) {
          registroSaldoContas.status = "OK"
        } else {
          registroSaldoContas.status = "Desativada"
        }
        
        self.web3Service.getBalanceOf(contaPJ.contaBlockchain,
          function (result) {

            let saldo = result

            registroSaldoContas.conta = contaPJ.contaBlockchain
            registroSaldoContas.saldo = saldo

            if (ehFornecedor) {
              registroSaldoContas.dadosBancarios = contaPJ.dadosBancarios
            } else {
              registroSaldoContas.dadosBancarios = { banco: "-", agencia: "-", contaCorrente: "-" }
            }

            self.listaContaSaldo.push(registroSaldoContas)
            self.estadoLista = "cheia"
            self.ref.detectChanges()

            self.isActive = new Array(self.listaContaSaldo.length).fill(false)
            console.log(self.listaContaSaldo)

          },
          function (error) {
            console.log("Erro ao recuperar o saldo")
            console.log(error)
          })

        self.ref.detectChanges()
      },
      (erro) => {
        console.log(erro)
      })


  }


  setOrder(value: string) {
    if (this.order === value) {
      this.reverse = !this.reverse;
    }
    this.order = value;
    this.ref.detectChanges()
  }

  customComparator(itemA, itemB) {
    return itemA - itemB
  }

  passarDadosParaPopUp(posicao) {
    this.declaracaoAssinada = undefined

    this.novoBanco = this.listaContaSaldo[posicao].dadosBancarios.banco
    this.novaAgencia = this.listaContaSaldo[posicao].dadosBancarios.agencia

    let conta = this.listaContaSaldo[posicao].dadosBancarios.contaCorrente.toString().split('-')
    this.novaContaCorrente = conta[0]
    this.novoDigitoContaCorrente = conta[1]

    this.posicaoRegistroQueSeraAlterado = posicao
  }

  openPopUp(content) {
    this.modalService.open(content, {})
  }

  receberDeclaracaoAssinada(declaracaoAssinadaRecebida) {
    console.log(declaracaoAssinadaRecebida)

    this.declaracaoAssinada = declaracaoAssinadaRecebida
  }

  selecionaConta(posicao, registroSaldoContas) {

    this.contaExtrato = registroSaldoContas.conta
    this.extratoAberto = false

    if (this.isActive[posicao]) {
      this.extratoAberto = false
      this.isActive[posicao] = false
    } else {
      this.isActive = new Array(this.listaContaSaldo.length).fill(false)
      this.extratoAberto = true
      this.isActive[posicao] = true
    }
    this.ref.detectChanges()
  }

}

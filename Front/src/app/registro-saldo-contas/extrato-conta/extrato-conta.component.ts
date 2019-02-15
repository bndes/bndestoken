import { Component, OnInit, Input, ChangeDetectorRef, NgZone, OnChanges } from '@angular/core';

import { Extrato } from './extrato';
import { Transferencia } from '../../transferencia/Transferencia';

import { PessoaJuridicaService } from '../../pessoa-juridica.service';
import { Web3Service } from '../../Web3Service';

@Component({
  selector: 'app-extrato-conta',
  templateUrl: './extrato-conta.component.html',
  styleUrls: ['./extrato-conta.component.css']
})
export class ExtratoContaComponent implements OnInit, OnChanges {

  @Input() contaBlockchainExtrato: string

  cnpjDaConta: string
  listaExtrato: Extrato[]
  isContaOrigem: boolean

  valorTotal: number

  qtdPorPagina: number = 10

  p: number = 1;

  constructor(private pessoaJuridicaService: PessoaJuridicaService,
    private web3Service: Web3Service, private ref: ChangeDetectorRef, private zone: NgZone) { }

  ngOnInit() {
  }

  ngOnChanges() {
    this.inicializaExtrato()
  }

  inicializaExtrato() {
    this.listaExtrato = new Array()
    this.valorTotal = 0

    this.recuperaCNPJ(this.contaBlockchainExtrato)
    this.listarExtratoConta()
  }

  recuperaCNPJ(contaBlockchain) {

    let self = this;

    if (contaBlockchain != "") {
      this.web3Service.getCNPJ(contaBlockchain,
        function (result) {
          self.cnpjDaConta = result.c[0];
          self.ref.detectChanges();
        },
        function (error) {
          console.log("erro na recuperacao do cnpj");
          console.log(error);
        }
      );
    }
  }

  atualizaQtdItensPorPagina(qtdItens) {
    this.qtdPorPagina = qtdItens
    this.ref.detectChanges()
  }

  listarExtratoConta() {

    let self = this;

    this.web3Service.registraEventosLiberacao(function (error, event) {
      if (!error) {

        let valorLiberacao = self.web3Service.converteInteiroParaDecimal(parseInt(event.args.valor))
        let transactionHash = event.transactionHash

        let extrato: Extrato
        let dataHora: Date

        self.pessoaJuridicaService.buscaLiberacaoPorHash(transactionHash).subscribe(
          data => {
            if (self.contaBlockchainExtrato === data.contaBlockchainDestino) {

              extrato = {
                tipoDeTransacao: "Liberação",
                cnpj: data.cnpjDestino,
                descricao: "-",
                valor: valorLiberacao,
                dataHora: dataHora
              }

              self.valorTotal += valorLiberacao

              self.listaExtrato.push(extrato)

              self.web3Service.getBlockTimestamp(event.blockHash,
                function (error, result) {
                  if (!error) {
                    extrato.dataHora = new Date(result.timestamp * 1000);
                    self.ref.detectChanges();
                  }
                  else {
                    console.log("Erro ao recuperar data e hora do bloco");
                    console.error(error);
                  }
                });
            }
          },
          error => {

          }
        )

      }
      else {
        console.log("Erro no registro de eventos de liberacao");
        console.log(error);
      }

    });


    this.web3Service.registraEventosTransferencia(function (error, event) {
      if (!error) {

        let valorTransferencia = self.web3Service.converteInteiroParaDecimal(parseInt(event.args.valor))
        let transactionHash = event.transactionHash

        let extrato: Extrato
        let dataHora: Date

        self.pessoaJuridicaService.buscaTransferenciaPorHash(transactionHash).subscribe(
          data => {
            if (self.contaBlockchainExtrato === data.contaBlockchainOrigem || self.contaBlockchainExtrato === data.contaBlockchainDestino) {

              self.isContaOrigem = self.contaBlockchainExtrato === data.contaBlockchainOrigem ? true : false

              if (self.isContaOrigem) {
                valorTransferencia = valorTransferencia * (-1)
              }

              extrato = {
                tipoDeTransacao: "Transferência",
                cnpj: self.isContaOrigem ? self.cnpjDaConta : data.cnpjDestino,
                descricao: data.descricao,
                valor: valorTransferencia,
                dataHora: dataHora
              }

              self.valorTotal += valorTransferencia

              self.listaExtrato.push(extrato)

              self.web3Service.getBlockTimestamp(event.blockHash,
                function (error, result) {
                  if (!error) {
                    extrato.dataHora = new Date(result.timestamp * 1000);
                    self.ref.detectChanges();
                  }
                  else {
                    console.log("Erro ao recuperar data e hora do bloco");
                    console.error(error);
                  }
                });
            }
          },
          error => {
            console.log("Não foi possível encontrar a transferência.")
          }
        )
      }
      else {
        console.log("Erro no registro de eventos transferência");
        console.log(error);
      }

    });

    this.web3Service.registraEventosRepasse(function (error, event) {
      if (!error) {
        let valorTransferencia = self.web3Service.converteInteiroParaDecimal(parseInt(event.args.valor))
        let transactionHash = event.transactionHash

        let extrato: Extrato
        let dataHora: Date

        self.pessoaJuridicaService.buscaTransferenciaPorHash(transactionHash).subscribe(
          data => {
            if (self.contaBlockchainExtrato === data.contaBlockchainOrigem || self.contaBlockchainExtrato === data.contaBlockchainDestino) {

              self.isContaOrigem = self.contaBlockchainExtrato === data.contaBlockchainOrigem ? true : false

              if (self.isContaOrigem) {
                valorTransferencia = valorTransferencia * (-1)
              }

              extrato = {
                tipoDeTransacao: "Repasse",
                cnpj: self.isContaOrigem ? self.cnpjDaConta : data.cnpjDestino,
                descricao: data.descricao,
                valor: valorTransferencia,
                dataHora: dataHora
              }

              self.valorTotal += valorTransferencia

              self.listaExtrato.push(extrato)

              self.web3Service.getBlockTimestamp(event.blockHash,
                function (error, result) {
                  if (!error) {
                    extrato.dataHora = new Date(result.timestamp * 1000);
                    self.ref.detectChanges();
                  }
                  else {
                    console.log("Erro ao recuperar data e hora do bloco");
                    console.error(error);
                  }
                });
            }
          },
          error => {
            console.log("Não foi possível encontrar a transferência.")
          });

      } else {
        console.log("Erro no registro de eventos repasse");
        console.log(error);
      }

    });

    this.web3Service.registraEventosResgate(function (error, event) {
      if (!error) {
        let valorResgate = self.web3Service.converteInteiroParaDecimal(parseInt(event.args.valor))
        let transactionHash = event.transactionHash

        let extrato: Extrato
        let dataHora: Date

        self.pessoaJuridicaService.buscaResgateNaoLiquidadoPorHash(transactionHash).subscribe(
          data => {
            if (self.contaBlockchainExtrato === data.contaBlockchainOrigem) {

              valorResgate = valorResgate * (-1)

              extrato = {
                tipoDeTransacao: "Resgate",
                cnpj: data.cnpjOrigem,
                descricao: "-",
                valor: valorResgate,
                dataHora: dataHora
              }

              self.valorTotal += valorResgate

              self.listaExtrato.push(extrato)

              self.web3Service.getBlockTimestamp(event.blockHash,
                function (error, result) {
                  if (!error) {
                    extrato.dataHora = new Date(result.timestamp * 1000);
                    self.ref.detectChanges();
                  }
                  else {
                    console.log("Erro ao recuperar data e hora do bloco");
                    console.error(error);
                  }
                });
            }
          },
          error => {
            console.log("Não foi possível encontrar o Resgate")
          });
      }
      else {
        console.log("Erro no registro de eventos de resgate");
        console.log(error);
      }
    });


  }

}

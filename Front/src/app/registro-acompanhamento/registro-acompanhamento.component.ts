import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';

import { Web3Service } from './../Web3Service';
import { PessoaJuridicaService } from '../pessoa-juridica.service';

import { RegistroAcompanhamento } from './registro-acompanhamento'
import { Transferencia } from '../transferencia/Transferencia';
import { Utils } from '../shared/utils';

@Component({
  selector: 'app-registro-acompanhamento',
  templateUrl: './registro-acompanhamento.component.html',
  styleUrls: ['./registro-acompanhamento.component.css']
})
export class RegistroAcompanhamentoComponent implements OnInit {

  registroAcompanhamento: RegistroAcompanhamento
  subcreditoSelecionado: number;

  ultimoCNPJ: string;
  p: number = 1;
  order: string = 'dataHora';
  reverse: boolean = false;

  maskCnpj = [/\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/]

  constructor(private pessoaJuridicaService: PessoaJuridicaService, private web3Service: Web3Service,
    private ref: ChangeDetectorRef, private zone: NgZone) { }

  ngOnInit() {
    setTimeout(() => {
      this.inicializaRegistroAcompanhamento();
    }, 500)
  }

  inicializaRegistroAcompanhamento() {
    this.ultimoCNPJ = "";

    this.registroAcompanhamento = new RegistroAcompanhamento();
    this.registroAcompanhamento.cnpj = null;
    this.registroAcompanhamento.razaoSocial = null;
    this.registroAcompanhamento.contaBlockchain = null;
    this.registroAcompanhamento.listaTransferencias = new Array();

    this.recuperaContaSelecionada();
    this.recuperaEmpresa(this.registroAcompanhamento.contaBlockchain);
  }

  // refreshContaBlockchainSelecionada() {
  //   this.inicializaRegistroAcompanhamento();
  // }

  async recuperaContaSelecionada() {
    this.registroAcompanhamento.contaBlockchain = (await this.web3Service.getCurrentAccountSync()) + "";
  }
  

  recuperaEmpresa(contaBlockchain) {
    this.pessoaJuridicaService.recuperaEmpresaPorContaBlockchain(contaBlockchain).subscribe(
      data => {
        if (data) {
          console.log("Razao social de empresa encontrada - " + data["dadosCadastrais"]["razaoSocial"]);
          this.registroAcompanhamento.razaoSocial = data["dadosCadastrais"]["razaoSocial"];

          console.log("CNPJ da empresa encontrada - " + data["cnpj"]);
          this.registroAcompanhamento.cnpj = data["cnpj"];

          console.log("Subcreditos da empresa encontrados")
          console.log(data["subcreditos"])
          this.registroAcompanhamento.subcreditos = data["subcreditos"]

          this.subcreditoSelecionado = -1
          this.recuperaTransferencias()

        }
        else {
          console.log("nenhuma razao social encontrada");
          this.registroAcompanhamento.razaoSocial = "";

          console.log("Nenhum CNPJ foi encontrado");
          this.registroAcompanhamento.cnpj = "";
        }
      },
      error => {
        console.log("Erro ao buscar razao social da empresa");
        this.registroAcompanhamento.razaoSocial = "";

        console.log("Erro ao buscar o CNPJ da empresa");
        this.registroAcompanhamento.cnpj = "";
      });
  }

  recuperaTransferencias() {

    console.log("Recupera transferencia")

    let self = this

    self.registroAcompanhamento.listaTransferencias = []

    self.web3Service.registraEventosTransferencia(function (error, event) {
      if (!error) {
        let transferencia = new Transferencia()

        transferencia.cnpjDestino = event.args.toCnpj
        transferencia.valorTransferencia = self.web3Service.converteInteiroParaDecimal ( event.args.valor )
        transferencia.hashOperacao = event.transactionHash
        let str_cnpj = Utils.completarCnpjComZero(event.args.fromCnpj)
        if (self.registroAcompanhamento.cnpj == str_cnpj) {

          self.pessoaJuridicaService.recuperaTransferenciaPorSubcreditoEHashID(self.subcreditoSelecionado, transferencia.hashOperacao).subscribe(
            data => {
              if (data.length > 0) {
                console.log("Transferencia recuperada");
                console.log(data[0])

                transferencia.razaoSocialDestino = data[0].razaoSocialDestino
                transferencia.contaBlockchainDestino = data[0].contaBlockchainDestino
                transferencia.descricao = data[0].descricao
                transferencia.documentoDeSuporte = data[0].documentoDeSuporte
                transferencia.dataHora = data[0].dataHora

                self.zone.run(() => {
                  self.registroAcompanhamento.listaTransferencias.push(transferencia)
                })

              }
              else {
                console.log("nenhuma transferencia encontrada");
              }
            },
            error => {
              console.log("Erro ao buscar transferencias");
            });
        }

      } else {
        console.log("Erro no registro de eventos de transferencias");
        console.log(error);
      }
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
}

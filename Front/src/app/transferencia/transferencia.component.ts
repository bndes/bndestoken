import { Component, OnInit, NgZone } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

import { Transferencia } from './Transferencia';

import { Web3Service } from './../Web3Service';
import { PessoaJuridicaService } from '../pessoa-juridica.service';

import { BnAlertsService } from 'bndes-ux4';


@Component({
  selector: 'app-transferencia',
  templateUrl: './transferencia.component.html',
  styleUrls: ['./transferencia.component.css']
})
export class TransferenciaComponent implements OnInit {

  ultimaContaBlockchainDestino: string;

  transferencia: Transferencia;
  statusHabilitacaoForm: boolean;

  papel: string // R - Repassador C - Cliente

  maskCnpj = [/\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/]  

  constructor(private pessoaJuridicaService: PessoaJuridicaService, protected bnAlertsService: BnAlertsService, private web3Service: Web3Service,
    private ref: ChangeDetectorRef, private zone: NgZone, private router: Router) {

  }

  ngOnInit() {
    this.mudaStatusHabilitacaoForm(true);
    this.inicializaTransferencia();
  }

  inicializaTransferencia() {
    this.ultimaContaBlockchainDestino = "";

    this.transferencia = new Transferencia();
    this.recuperaContaSelecionada();
    this.transferencia.cnpjDestino = "";
    this.transferencia.contaBlockchainDestino = "";
    this.transferencia.razaoSocialDestino = "";
    this.transferencia.valorTransferencia = null;
    this.transferencia.subcredito = "";
    this.transferencia.msgEmpresaDestino = ""
  }

  mudaStatusHabilitacaoForm(statusForm: boolean) {
    this.statusHabilitacaoForm = statusForm;
  }

  refreshContaBlockchainSelecionada() {
    this.inicializaTransferencia();
  }



  async recuperaContaSelecionada() {
    console.log("recuperaContaSelecionada =");
    console.log(this.transferencia.contaBlockchainOrigem);

    let contaSelecionada = await this.web3Service.getCurrentAccountSync();
    
    this.transferencia.contaBlockchainOrigem = contaSelecionada + "";
    this.recuperaSaldoOrigem(this.transferencia.contaBlockchainOrigem);
    this.recuperaEmpresaOrigem(this.transferencia.contaBlockchainOrigem);
    this.ref.detectChanges();
  }

  recuperaSaldoOrigem(contaBlockchain) {

    let self = this;

    this.web3Service.getBalanceOf(contaBlockchain,

      function (result) {
        console.log("Saldo do endereco " + contaBlockchain + " eh " + result);
        self.transferencia.saldoOrigem = result;
        self.ref.detectChanges();
      },
      function (error) {
        console.log("Erro ao ler o saldo do endereco " + contaBlockchain);
        console.log(error);
        self.transferencia.saldoOrigem = 0;
      });
  }

  recuperaInformacoesDerivadasConta() {

    if (this.transferencia.contaBlockchainDestino != "") {
      // this.recuperaEmpresaOrigem(this.transferencia.contaBlockchainOrigem);
      this.recuperaEmpresaDestino(this.transferencia.contaBlockchainDestino.toLowerCase());
      // this.ultimaContaBlockchainDestino = this.transferencia.contaBlockchainDestino;
    } else {
      this.transferencia.razaoSocialDestino = "";
      this.transferencia.papelEmpresaDestino = "";
      this.transferencia.cnpjDestino = "";
      this.transferencia.msgEmpresaDestino = ""
    }
  }

  recuperaEmpresaOrigem(contaBlockchain) {

    console.log("Recupera empresa para - " + contaBlockchain);

    this.pessoaJuridicaService.recuperaEmpresaPorContaBlockchain(contaBlockchain).subscribe(
      data => {
        if (data) {
          let todosSubcreditos = data.subcreditos

          for (var i = 0; i < todosSubcreditos.length; i++) {
            if (todosSubcreditos[i].contaBlockchain === contaBlockchain) {
              this.transferencia.subcredito = todosSubcreditos[i].nome + " - " + todosSubcreditos[i].numero
              this.transferencia.numeroSubcredito = todosSubcreditos[i].numero
            }
          }

        } else {
          console.log("nenhuma empresa encontrada");
          this.transferencia.papelEmpresaOrigem = "";
        }
      },
      error => {
        console.log("Erro ao buscar empresa por conta blockchain");
        this.transferencia.papelEmpresaOrigem = "";
      });

    this.web3Service.isRepassador(contaBlockchain,
      (result) => {
        if (result) {
          this.transferencia.papelEmpresaOrigem = "R";
        } else {
          this.transferencia.papelEmpresaOrigem = "C"
        }
      },
      (error) => {
        console.log("Erro ao identificar papel da empresa")
      })
  }


  recuperaEmpresaDestino(contaBlockchainDestino) {
    console.log("Conta blockchain Destino - " + contaBlockchainDestino)

    let self = this

    this.pessoaJuridicaService.recuperaEmpresaPorContaBlockchain(contaBlockchainDestino).subscribe(
      data => {
        if (data) {
          console.log("RECUPERA EMPRESA DESTINO")
          console.log(data)

          this.transferencia.cnpjDestino = data.cnpj
          this.transferencia.razaoSocialDestino = data.dadosCadastrais.razaoSocial;

          this.validaEmpresaDestino(contaBlockchainDestino)

        }
        else {
          console.log("nenhuma empresa encontrada");
          this.transferencia.razaoSocialDestino = "";
          this.transferencia.papelEmpresaDestino = "";
          this.transferencia.cnpjDestino = ""
          this.transferencia.msgEmpresaDestino = "Conta Inválida"
        }
      },
      error => {
        console.log("Erro ao buscar dados da empresa");
        this.transferencia.razaoSocialDestino = "";
        this.transferencia.papelEmpresaDestino = "";
        this.transferencia.cnpjDestino = "";
        this.transferencia.msgEmpresaDestino = ""
      });
  }

  validaEmpresaDestino(contaBlockchainDestino) {
    let self = this

    this.web3Service.isRepassador(contaBlockchainDestino,
      (result) => {
        console.log("É um repassador - " + result)

        console.log(contaBlockchainDestino)
        console.log(self.transferencia.contaBlockchainOrigem)

        if (result) {
          self.web3Service.isRepassadorSucredito(contaBlockchainDestino, self.transferencia.contaBlockchainOrigem,
            (result) => {
              console.log(result)
              if (result) {
                self.transferencia.msgEmpresaDestino = "Repassador do Subcrédito"
              } else {
                self.transferencia.msgEmpresaDestino = "Repassador Inválido"
              }
              self.ref.detectChanges()
            },
            (erro) => {
              console.log(erro)
              self.transferencia.msgEmpresaDestino = ""
            })

          self.transferencia.papelEmpresaDestino = "R";
        } else {
          self.web3Service.isFornecedor(contaBlockchainDestino,
            (result) => {
              if (result) {
                self.transferencia.msgEmpresaDestino = "Fornecedor"
                self.transferencia.papelEmpresaDestino = "F";
              } else {
                console.log("Conta Invalida")
                self.transferencia.msgEmpresaDestino = "Conta Inválida"
                self.transferencia.papelEmpresaDestino = "";
              }
              self.ref.detectChanges()
            },
            (erro) => {
              self.transferencia.msgEmpresaDestino = ""
            })
        }
      },
      (erro) => {
        console.log(erro)
        self.transferencia.msgEmpresaDestino = ""
      })
  }


  transferir() {

    let self = this;

    this.recuperaContaSelecionada();

    console.log("VALOR TRANSFERENCIA")
    console.log(this.transferencia.valorTransferencia);

    if (this.transferencia.papelEmpresaOrigem != "R" && this.transferencia.papelEmpresaOrigem != "C") {
      let s = "A transferëncia deve ter como origem a conta de um Cliente ou Repasador.";
      this.bnAlertsService.criarAlerta("error", "Erro", s, 5);
      console.log(s);

    }
    else if (this.transferencia.papelEmpresaDestino != "R" && this.transferencia.papelEmpresaDestino != "F") {
      let s = "A transferëncia deve ter como destino a conta de um Repassador ou Fornecedor.";
      this.bnAlertsService.criarAlerta("error", "Erro", s, 5);
      console.log(s);
    }
    //Multipliquei por 1 para a comparacao ser do valor (e nao da string)
    else if ((this.transferencia.valorTransferencia * 1) > (this.transferencia.saldoOrigem * 1)) {

      console.log("saldoOrigem=" + this.transferencia.saldoOrigem);
      console.log("valorTransferencia=" + this.transferencia.valorTransferencia);

      let s = "Não é possível transferir mais do que o valor do saldo de origem.";
      this.bnAlertsService.criarAlerta("error", "Erro", s, 5);
      console.log(s);
    }
    else {

      console.log("TRANSFERIR")
      console.log(this.transferencia.contaBlockchainDestino)
      console.log(this.transferencia.valorTransferencia)

      this.web3Service.transfer(this.transferencia.contaBlockchainDestino, this.transferencia.valorTransferencia,

        function (txHash) {
          let s = "Transferência para cnpj " + self.transferencia.cnpjDestino + "  enviada. Aguarde a confirmação.";
          self.bnAlertsService.criarAlerta("info", "Sucesso", s, 5);
          console.log(s);

          self.transferencia.hashOperacao = txHash;

          self.web3Service.registraWatcherEventosLocal(txHash, function (error, result) {
            if (!error) {
              let s = "A associação foi confirmada na blockchain.";
              self.bnAlertsService.criarAlerta("info", "Sucesso", s, 5);
              console.log(s);
  
              console.log("Início da gravação no BD");

              self.pessoaJuridicaService.cadastraTransf(self.transferencia).subscribe(
                data => {
                  if (data) {
                    console.log("inseriu no bd");

                    self.zone.run(() => {
                      self.router.navigate(['sociedade/dash-transf'])
                    });
                        
                    // self.inicializaTransferencia();
                    // self.mudaStatusHabilitacaoForm(true);

                    // self.ref.detectChanges()
                  }
                  else {
                    console.log("nao inseriu no bd");
                  }
                },
                error => {
                  console.log("Erro inserir no bd");
                });
              
              console.log("Fim da gravação no BD");
  
              self.zone.run(() => {});
            }
            else {
              console.log(error);
            }
          });

        }, function (error) {

          let s = "Erro ao transferir na blockchain";
          self.bnAlertsService.criarAlerta("error", "Erro", s, 5);
          console.log(s);
          console.log(error);
          self.mudaStatusHabilitacaoForm(true);
        });

      let s = "Confirme a operação no metamask e aguarde a confirmação da transferência.";
      self.bnAlertsService.criarAlerta("info", "", s, 5);
      console.log(s);
      this.mudaStatusHabilitacaoForm(false);

    }


  }


}

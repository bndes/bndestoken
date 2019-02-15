import { Component, OnInit, NgZone } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';

import { Resgate } from './Resgate';

import { Web3Service } from './../Web3Service';
import { PessoaJuridicaService } from '../pessoa-juridica.service';

import { BnAlertsService } from 'bndes-ux4';


@Component({
  selector: 'app-resgate',
  templateUrl: './resgate.component.html',
  styleUrls: ['./resgate.component.css']
})
export class ResgateComponent implements OnInit {

  resgate: Resgate = new Resgate();

  ultimoCNPJ: string;

  statusHabilitacaoForm: boolean;

  constructor(private pessoaJuridicaService: PessoaJuridicaService, protected bnAlertsService: BnAlertsService, private web3Service: Web3Service,
    private ref: ChangeDetectorRef, private zone: NgZone) {
  }

  ngOnInit() {

    setTimeout(() => {
      this.mudaStatusHabilitacaoForm(true);
      this.inicializaResgate();
    }, 1000)
  }

  inicializaResgate() {
    console.log("Init resgate");
    this.ultimoCNPJ = "";

    this.recuperaContaSelecionada();
    this.recuperaCNPJ(this.resgate.contaBlockchainOrigem);
    this.recuperaSaldoOrigem(this.resgate.contaBlockchainOrigem);
    this.recuperaEmpresa(this.resgate.contaBlockchainOrigem);
    this.recuperaAddrCarteiraBNDES();
    this.resgate.valor = 0;
  }

  refreshContaBlockchainSelecionada() {
    this.inicializaResgate();
  }

  mudaStatusHabilitacaoForm(statusForm: boolean) {
    this.statusHabilitacaoForm = statusForm;
  }

  async recuperaContaSelecionada() {

    let self = this;
    
    this.resgate.contaBlockchainOrigem = (await this.web3Service.getCurrentAccountSync()) + "";
    console.log("contaSelecionada=" + this.resgate.contaBlockchainOrigem);      

  }


  recuperaCNPJ(contaBlockchain) {

    let self = this;

    if (contaBlockchain != "") {

      this.web3Service.getCNPJ(contaBlockchain,
        function (result) {
          console.log("cnpj abaixo");
          console.log(result.c[0]);
          self.resgate.cnpjOrigem = result.c[0];
          self.ref.detectChanges();
        },
        function (error) {
          console.log("erro na recuperacao do cnpj");
          console.log(error);
        }
      );
    }
  }

  recuperaSaldoOrigem(contaBlockchain) {

    let self = this;

    this.web3Service.getBalanceOf(contaBlockchain,
      function (result) {
        console.log("Saldo do endereco " + contaBlockchain + " eh " + result);
        self.resgate.saldoOrigem = result;
        self.ref.detectChanges();
      },
      function (error) {
        console.log("Erro ao ler o saldo do endereco " + contaBlockchain);
        console.log(error);
        self.resgate.saldoOrigem = 0;
      });
  }


  recuperaEmpresa(contaBlockchain) {

    console.log("Recupera Razao social para - " + contaBlockchain);

    this.pessoaJuridicaService.recuperaEmpresaPorContaBlockchain(contaBlockchain).subscribe(
      data => {
        if (data) {
          console.log(data)

          console.log("Razao social de empresa encontrada - " + data.dadosCadastrais.razaoSocial);
          this.resgate.razaoSocialOrigem = data.dadosCadastrais.razaoSocial;

          if (data.contasFornecedor) {
            this.resgate.ehFornecedor = true;

            for (var i = 0; i < data.contasFornecedor.length; i++) {
              if (data.contasFornecedor[i].contaBlockchain === contaBlockchain) {
                this.resgate.bancoOrigem = data["contasFornecedor"][i].dadosBancarios.banco;
                this.resgate.agenciaOrigem = data["contasFornecedor"][i].dadosBancarios.agencia;
                this.resgate.contaCorrenteOrigem = data["contasFornecedor"][i].dadosBancarios.contaCorrente;
              }
            }

          }
          else {
            this.resgate.ehFornecedor = false;
          }


        }
        else {
          console.log("nenhuma razao social encontrada");
          this.resgate.razaoSocialOrigem = "";
          this.resgate.ehFornecedor = false;

        }
      },
      error => {
        console.log("Erro ao buscar razao social da empresa");
        this.resgate.razaoSocialOrigem = "";
        this.resgate.ehFornecedor = false;

      });
  }


  recuperaAddrCarteiraBNDES() {

    let self = this;

    this.web3Service.getAddressOwner(
      function (result) {
        self.resgate.contaBlockchainBNDES = result;
        self.ref.detectChanges();
        console.log("owner abaixo");
        console.log(result);
      },
      function (error) {
        console.log("erro na recuperacao do owner");
        console.log(error);
      }
    );

  }


  resgatar() {

    let self = this;

//    this.recuperaContaSelecionada();

    if (!this.resgate.ehFornecedor) {

      let s = "O resgate deve ser realizado para a conta de um fornecedor.";
      this.bnAlertsService.criarAlerta("error", "Erro", s, 5);
      console.log(s);

    }
    else if ((this.resgate.valor * 1) > (Number(this.resgate.saldoOrigem) * 1)) {
      let s = "Não é possível resgatar mais do que o valor do saldo de origem.";
      this.bnAlertsService.criarAlerta("error", "Erro", s, 5);
      console.log(s);

    }
    else {


      this.web3Service.resgata(this.resgate.valor,

        function (txHash) {
          let s = "Resgate para cnpj " + self.resgate.cnpjOrigem + "  enviado. Aguarde a confirmação.";
          self.bnAlertsService.criarAlerta("info", "Sucesso", s, 5)
          console.log(s);

          self.resgate.hashID = txHash

          self.web3Service.registraWatcherEventosLocal(txHash, function (error, result) {
            if (!error) {
              let s = "O Resgate foi confirmado na blockchain."
              self.bnAlertsService.criarAlerta("info", "Sucesso", s, 5)
              console.log(s)

              console.log("Início da gravação no BD")
              self.pessoaJuridicaService.cadastraResgate(self.resgate).subscribe(

                data => {
                  if (data) {
                    console.log("Inseriu no BD");
                    self.mudaStatusHabilitacaoForm(true);
                    self.inicializaResgate();

                  }
                  else {
                    console.log("Não inseriu no BD");
                  }
                },
                error => {
                  console.log("Erro ao inserir no BD");
                });

              self.zone.run(() => { })
            } else {
              console.log(error)
            }
          })

        }, function (error) {

          let s = "Erro ao resgatar na blockchain";
          self.bnAlertsService.criarAlerta("error", "Erro", s, 5)
          console.log(s);
          console.log(error);
          self.mudaStatusHabilitacaoForm(true);

        });

      let s = "Confirme a operação no metamask e aguarde a confirmação do resgate.";
      self.bnAlertsService.criarAlerta("info", "", s, 5);
      console.log(s);
      this.mudaStatusHabilitacaoForm(false);

    }

  }


}

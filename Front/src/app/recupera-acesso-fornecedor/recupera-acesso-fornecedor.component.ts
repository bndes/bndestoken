import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { Router } from '@angular/router';

import { BnAlertsService } from 'bndes-ux4';

import { Fornecedor } from '../fornecedor/Fornecedor';
import { PessoaJuridicaService } from '../pessoa-juridica.service';
import { Web3Service } from './../Web3Service';


@Component({
  selector: 'app-recupera-conta-fornecedor',
  templateUrl: './recupera-acesso-fornecedor.component.html',
  styleUrls: ['./recupera-acesso-fornecedor.component.css']
})
export class RecuperaAcessoFornecedorComponent implements OnInit {

  fornecedor: Fornecedor;
  statusHabilitacaoForm: boolean;

  file: any = null;

  contaBlockchainAntiga: string

  declaracao: string
  declaracaoAssinada: string

  contaEstaValida: boolean;
  contaBlockchainSelecionada: any;
  

  constructor(private pessoaJuridicaService: PessoaJuridicaService, protected bnAlertsService: BnAlertsService,
    private web3Service: Web3Service, private ref: ChangeDetectorRef, private zone: NgZone, private router: Router) { }

  ngOnInit() {
    this.mudaStatusHabilitacaoForm(true);
    this.inicializaPessoaJuridica();
  }

  inicializaPessoaJuridica() {
    this.fornecedor = new Fornecedor();
    this.fornecedor.id = 0;
    this.fornecedor.cnpj = "";
    this.fornecedor.dadosCadastrais = undefined;
    this.fornecedor.contasFornecedor = undefined;
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
      self.fornecedor.cnpj = fileReader.result
      self.recuperaFornecedorPorCNPJ(self.fornecedor.cnpj.trim())
    }
  }

  receberDeclaracaoAssinada(declaracaoAssinadaRecebida) {
    console.log(declaracaoAssinadaRecebida)

    this.declaracaoAssinada = declaracaoAssinadaRecebida
  }

  cancelar() {
    this.fornecedor.dadosCadastrais = undefined
  }


  mudaStatusHabilitacaoForm(statusForm: boolean) {
    this.statusHabilitacaoForm = statusForm;
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

  recuperaFornecedorPorCNPJ(cnpj) {
    console.log("RECUPERA FORNECEDOR com CNPJ = " + cnpj);

    this.pessoaJuridicaService.recuperaEmpresaPorCnpj(cnpj).subscribe(
      empresa => {
        if (empresa) {
          console.log("Empresa encontrada - ");
          console.log(empresa);

          let contasFornecedor = new Array();

          for (var i = 0; i < empresa["contasFornecedor"].length; i++) {
            if (empresa["contasFornecedor"][i].isActive)
              contasFornecedor.push(empresa["contasFornecedor"][i])
          }

          this.fornecedor.id = empresa["_id"];
          this.fornecedor.dadosCadastrais = empresa["dadosCadastrais"];
          this.fornecedor.contasFornecedor = JSON.parse(JSON.stringify(contasFornecedor));
          this.declaracao = "Declaro que sou a empresa de Razão Social " + this.fornecedor.dadosCadastrais.razaoSocial + " com o CNPJ " + this.fornecedor.cnpj

          console.log("DadosCadastrais = " + this.fornecedor.dadosCadastrais.cidade);
          console.log("ContasFornecedor = " + this.fornecedor.contasFornecedor);

        }
        else {
          console.log("Nenhuma empresa encontrada");
        }
      },
      error => {
        console.log("Erro ao buscar dados da empresa");
        this.inicializaPessoaJuridica();
      });

  }

  cancelaAssociacaoContaFornecedor() {

    let self = this
    let subcredito = 0
    let contaBlockchain = this.contaBlockchainSelecionada;

    if (this.contaBlockchainAntiga === undefined) {
      let s = "O campo Conta Blockchain Atual é Obrigatório"
      this.bnAlertsService.criarAlerta("error", "Erro", s, 2)
      return
    }

    this.web3Service.cancelarAssociacaoDeConta(parseInt(self.fornecedor.cnpj), subcredito, 0, false,
      (txHash) => {

        let s = "Troca de conta do cnpj " + self.fornecedor.cnpj + "  enviada. Aguarde a confirmação.";
        self.bnAlertsService.criarAlerta("info", "Aviso", s, 5);
        console.log(s);

        self.web3Service.registraWatcherEventosLocal(txHash, function (error, result) {
          if (!error) {
            let s = "A Troca de conta foi confirmada na blockchain."
            self.bnAlertsService.criarAlerta("info", "Confirmação", s, 5)
            console.log(s)

            self.zone.run(() => { })
          } else {
            console.log(error)
          }
        })
      },
      (error) => {
        let s = "Erro ao cadastrar na blockchain\nUma possibilidade é você já ter se registrado utilizando essa conta ethereum."
        self.bnAlertsService.criarAlerta("error", "Erro", s, 5)
        console.log(s);
        console.log(error);
        self.mudaStatusHabilitacaoForm(true);
      })
  }

}

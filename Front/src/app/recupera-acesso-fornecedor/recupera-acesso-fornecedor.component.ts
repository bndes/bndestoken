import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { Router } from '@angular/router';

import { BnAlertsService } from 'bndes-ux4';

import { Fornecedor } from '../fornecedor/Fornecedor';
import { PessoaJuridicaService } from '../pessoa-juridica.service';
import { Web3Service } from './../Web3Service';
import { Utils } from '../shared/utils';

@Component({
  selector: 'app-recupera-conta-fornecedor',
  templateUrl: './recupera-acesso-fornecedor.component.html',
  styleUrls: ['./recupera-acesso-fornecedor.component.css']
})
export class RecuperaAcessoFornecedorComponent implements OnInit {

  fornecedor: Fornecedor;
  contaBlockchainAntiga: string
  contaEstaValida: boolean;
  selectedAccount: any;
  maskCnpj: any;
  

  constructor(private pessoaJuridicaService: PessoaJuridicaService, protected bnAlertsService: BnAlertsService,
    private web3Service: Web3Service, private ref: ChangeDetectorRef, private zone: NgZone, private router: Router) { 

      let self = this;
      setInterval(function () {
        self.recuperaContaSelecionada(), 1000});

    }

  ngOnInit() {
    this.maskCnpj = Utils.getMaskCnpj(); 
    this.fornecedor = new Fornecedor();
    this.inicializaPessoaJuridica();
  }

  inicializaPessoaJuridica() {
    this.fornecedor.id = 0;
    this.fornecedor.cnpj = "";
    this.fornecedor.dadosCadastrais = undefined;
    this.fornecedor.contasFornecedor = undefined;
  }

  


  cancelar() {
    this.fornecedor.dadosCadastrais = undefined
  }


  async recuperaContaSelecionada() {

    let newSelectedAccount = await this.web3Service.getCurrentAccountSync();

    if ( !this.selectedAccount || (newSelectedAccount !== this.selectedAccount && newSelectedAccount)) {

      this.selectedAccount = newSelectedAccount;
      console.log("selectedAccount=" + this.selectedAccount);
      this.verificaContaBlockchainSelecionada(this.selectedAccount); 
    }

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

    if (!this.contaBlockchainAntiga) {
      let s = "O campo Conta Blockchain Atual é Obrigatório"
      this.bnAlertsService.criarAlerta("error", "Erro", s, 2)
      return;
    }
/*
    this.web3Service.cancelarAssociacaoDeConta(parseInt(self.fornecedor.cnpj), subcredito, 0,
    
         (txHash) => {

          Utils.criarAlertasAvisoConfirmacao( txHash, 
                                              self.web3Service, 
                                              self.bnAlertsService, 
                                              "Troca de conta do cnpj " + self.fornecedor.cnpj + "  enviada. Aguarde a confirmação.", 
                                              "A troca foi confirmada na blockchain.", 
                                              self.zone) 
          self.router.navigate(['sociedade/dash-empresas']);

          }        
        ,(error) => {
          Utils.criarAlertaErro( self.bnAlertsService, 
                                 "Erro ao associar na blockchain\nUma possibilidade é você já ter se registrado utilizando essa conta ethereum.", 
                                 error )  
        }
      );
      Utils.criarAlertaAcaoUsuario( self.bnAlertsService, 
                                    "Confirme a operação no metamask e aguarde a confirmação da associação da conta." )      
*/
  }

}

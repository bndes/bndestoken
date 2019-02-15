import { Component, OnInit, NgZone } from '@angular/core';

import {ChangeDetectorRef} from '@angular/core';

import { BnAlertsService } from 'bndes-ux4';

import { Web3Service } from './../Web3Service';
import { PessoaJuridicaService } from '../pessoa-juridica.service';

@Component({
  selector: 'app-balance-manutencao',
  templateUrl: './balance-manutencao.component.html',
  styleUrls: ['./balance-manutencao.component.css']
})
export class BalanceManutencaoComponent implements OnInit {

    endereco: string;
    saldo: string;
    novoSaldo: number;

    cnpj: string;
    razaoSocial: string;
    identificacaoSubcredito: string;

    formHabilitado: boolean;

    constructor(private web3Service: Web3Service, private pessoaJuridicaService: PessoaJuridicaService,
        private ref: ChangeDetectorRef, protected bnAlertsService: BnAlertsService) 
    { 
        this.formHabilitado = false;
    }

    ngOnInit() 
    {
    }
    
    recuperaInformacoesDerivadasEndereco () 
    {
        console.log("Endereço que vai ser buscado " + this.endereco);
        this.pessoaJuridicaService.recuperaEmpresaPorContaBlockchain(this.endereco).subscribe(
            data => { 
                if (!data) 
                {
                    this.cnpj = "";
                    this.razaoSocial = "";
                    this.identificacaoSubcredito = "";
                    this.saldo = "";
                    this.novoSaldo = null;
                    this.formHabilitado = false;
                    this.ref.detectChanges();            
                }
                else
                {
                    console.log("Dados retornados: ");
                    console.log(data);
                    this.cnpj = data.cnpj;
                    this.razaoSocial = data.dadosCadastrais.razaoSocial;
    
                    console.log("Número de subcréditos: " +  data.subcreditos.length);
                    for (let i = 0; i < data.subcreditos.length; i++)
                    {
                        console.log("Loop " + i);
                        console.log("parâmetro: " + this.endereco);
                        console.log("conta do array " + data.subcreditos[i].contaBlockchain);
                        if (data.subcreditos[i].contaBlockchain.toLowerCase == this.endereco.toLowerCase)
                        {
                            console.log("Nome: " + data.subcreditos[i].nome);
                            console.log("Número: " + data.subcreditos[i].numero);
                            this.identificacaoSubcredito = data.subcreditos[i].numero + 
                                "-" + data.subcreditos[i].nome;
                            console.log("Subcredito carregado: " + this.identificacaoSubcredito);
                            break;
                        }
                    }
                    let self = this;
                    this.web3Service.getBalanceOf(this.endereco,
                        function (result) {
                            console.log("Retornou ok");
                            console.log("Saldo do endereco " + self.endereco + " eh " + result);
                            self.saldo = result;
                            self.formHabilitado = true;
                            self.ref.detectChanges();
                        },
                        function (error) {
                            console.log("Retornou com erro");
                            console.log("Erro ao ler o saldo do endereco " + self.endereco);
                            console.log(error);
                            self.saldo = "0";
                            self.formHabilitado = false;
                            self.ref.detectChanges();
                        }
                    );
                }
            }

        );        
    }    

    async salvarNovoSaldo () 
    {

        let contaSelecionada = await this.web3Service.getCurrentAccountSync();

        if (contaSelecionada != this.web3Service.getAddressOwnerCacheble()) 
        {
            let s = "A manutenção exige que a conta do BNDES seja a selecionada no Metamask.";
            this.bnAlertsService.criarAlerta("error", "Erro", s, 5);
            console.log(s);
            console.log("this.web3Service.getAddressOwnerCacheble() = " + this.web3Service.getAddressOwnerCacheble());
       }
       else 
       {
            console.log(this.endereco);
            console.log(this.novoSaldo);
    
            this.web3Service.setBalanceOf(this.endereco, this.novoSaldo,
                function(result) 
                {
                    let s = "Atualizado de saldo para endereço " + this.endereco + " realizada com sucesso";
                    this.bnAlertsService.criarAlerta("info", "Sucesso", s, 5);
                    console.log(s);
                }, function(error) 
                {
                    let s = "Erro ao atualizar a blockchain. Uma possibilidade é a conta selecionada não ser a do BNDES";
                    this.bnAlertsService.criarAlerta("error", "Erro", s, 5);
                    console.log(s);
                    console.log(error);
                }
            );
    
            let s = "Confirme a operação no metamask e aguarde a confirmação da liberação.";
            this.bnAlertsService.criarAlerta("info", "", s, 5);
            console.log(s);    
        }
    }

    
}

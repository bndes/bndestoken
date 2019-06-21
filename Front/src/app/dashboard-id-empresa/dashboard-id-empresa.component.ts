import { Component, OnInit, NgZone } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { DashboardPessoaJuridica } from './DashboardPessoaJuridica';
import { Web3Service } from './../Web3Service';
import { PessoaJuridicaService } from '../pessoa-juridica.service';


import { BnAlertsService } from 'bndes-ux4';

@Component({
    selector: 'app-dashboard-id-empresa',
    templateUrl: './dashboard-id-empresa.component.html',
    styleUrls: ['./dashboard-id-empresa.component.css']
})



export class DashboardIdEmpresaComponent implements OnInit {

    listaTransacoesPJ: DashboardPessoaJuridica[] = undefined;
    blockchainNetworkPrefix: string;

    estadoLista: string = "undefined";

    p: number = 1;
    order: string = 'dataHora';
    reverse: boolean = false;

    selectedAccount: any;

    constructor(private pessoaJuridicaService: PessoaJuridicaService, protected bnAlertsService: BnAlertsService, private web3Service: Web3Service,
        private ref: ChangeDetectorRef, private zone: NgZone) {

            let self = this;
            self.recuperaContaSelecionada();
                        
            setInterval(function () {
              self.recuperaContaSelecionada(), 
              1000}); 
              
    }

    ngOnInit() {
        setTimeout(() => {
            this.listaTransacoesPJ = [];
            console.log("Zerou lista de transacoes");

            this.registrarExibicaoEventos();
        }, 1500)

        setTimeout(() => {
            this.estadoLista = this.estadoLista === "undefined" ? "vazia" : "cheia"
            this.ref.detectChanges()
        }, 2300)
    }

    async recuperaContaSelecionada() {

        let self = this;
        
        let newSelectedAccount = await this.web3Service.getCurrentAccountSync();
    
        if ( !self.selectedAccount || (newSelectedAccount !== self.selectedAccount && newSelectedAccount)) {
    
          this.selectedAccount = newSelectedAccount;
          console.log("selectedAccount=" + this.selectedAccount);
        }
    
      }    

    registrarExibicaoEventos() {

        this.blockchainNetworkPrefix = this.web3Service.getInfoBlockchainNetwork().blockchainNetworkPrefix;

        this.estadoLista = "vazia"

        console.log("*** Executou o metodo de registrar exibicao eventos");

        this.registraEventosCadastro();

        this.registraEventosTroca();

        this.registraEventosValidacao();

        this.registraEventosInvalidacao();
        
    }


    registraEventosCadastro() {

        console.log("*** Executou o metodo de registrar eventos CADASTRO");

        let self = this;        
        this.web3Service.registraEventosCadastro(function (error, event) {

            if (!error) {

                let transacaoPJ: DashboardPessoaJuridica;
                let eventoCadastro = event

                console.log("Evento Cadastro");
                console.log(eventoCadastro);

                     
                transacaoPJ = {
                    cnpj: eventoCadastro.args.cnpj,
                    razaoSocial: "",
                    contaBlockchain: eventoCadastro.args.addr,
                    salic: eventoCadastro.args.salic,
                    hashID: eventoCadastro.transactionHash,
                    uniqueIdentifier: eventoCadastro.transactionHash,
                    dataHora: null,
                    hashDeclaracao: eventoCadastro.args.idProofHash,
                    nomeConta: eventoCadastro.args.idFinancialSupportAgreement,
                    status: "Conta Cadastrada"
                }

                self.includeIfNotExists(transacaoPJ);
                self.recuperaInfoDerivadaPorCnpj(self, transacaoPJ);
                self.recuperaDataHora(self, event, transacaoPJ);


            } else {
                console.log("Erro no registro de eventos de cadastro");
                console.log(error);
            }
        });
    }


    registraEventosTroca() {

        console.log("*** Executou o metodo de registrar eventos TROCA");

        let self = this;

        self.web3Service.registraEventosTroca(function (error, event) {

            let transacaoPJ: DashboardPessoaJuridica
            let eventoTroca = event

            console.log("Evento Troca");
            console.log(eventoTroca);

            if (!error) {

                let transacaoPJContaInativada = {
                    cnpj: eventoTroca.args.cnpj,
                    razaoSocial: "",
                    contaBlockchain: eventoTroca.args.oldAddr,
                    salic: eventoTroca.args.salic,
                    hashID: eventoTroca.transactionHash,
                    uniqueIdentifier: eventoTroca.transactionHash + "Old",
                    dataHora: null,
                    hashDeclaracao: eventoTroca.args.idProofHash,
                    nomeConta: eventoTroca.args.idFinancialSupportAgreement,
                    status: "Conta Inativada por Troca"
                };

                self.includeIfNotExists(transacaoPJContaInativada);
                self.recuperaInfoDerivadaPorCnpj(self, transacaoPJContaInativada);
                self.recuperaDataHora(self, event, transacaoPJContaInativada);
  


                transacaoPJ = {
                    cnpj: eventoTroca.args.cnpj,
                    razaoSocial: "",
                    contaBlockchain: eventoTroca.args.newAddr,
                    salic: eventoTroca.args.salic,
                    hashID: eventoTroca.transactionHash,
                    uniqueIdentifier: eventoTroca.transactionHash + "New",                    
                    dataHora: null,
                    hashDeclaracao: eventoTroca.args.idProofHash,
                    nomeConta: eventoTroca.args.idFinancialSupportAgreement,
                    status: "Conta Associada por Troca"
                };

                //TODO: nao precisa chamar novamente
                self.includeIfNotExists(transacaoPJ);
                self.recuperaInfoDerivadaPorCnpj(self, transacaoPJ);
                self.recuperaDataHora(self, event, transacaoPJ);
            }    

        });        
    }

    registraEventosValidacao() {

        console.log("*** Executou o metodo de registrar eventos VALIDACAO");        

        let self = this;        
        this.web3Service.registraEventosValidacao(function (error, event) {

            if (!error) {

                let transacaoPJ: DashboardPessoaJuridica;

                console.log("Evento validacao");
                console.log(event);

                      
                transacaoPJ = {
                    cnpj: event.args.cnpj,
                    razaoSocial: "",
                    contaBlockchain: event.args.addr,
                    salic: event.args.salic,
                    hashID: event.transactionHash,
                    uniqueIdentifier: event.transactionHash,
                    dataHora: null,
                    hashDeclaracao: "",
                    nomeConta: event.args.idFinancialSupportAgreement,
                    status: "Conta Validada"
                }
                self.includeIfNotExists(transacaoPJ);
                self.recuperaInfoDerivadaPorCnpj(self, transacaoPJ);
                self.recuperaDataHora(self, event, transacaoPJ);

            } else {
                console.log("Erro no registro de eventos de validacao");
                console.log(error);
            }
        });
        
    }


    registraEventosInvalidacao() {

        console.log("*** Executou o metodo de registrar eventos INVALIDACAO");                

        let self = this;        
        this.web3Service.registraEventosInvalidacao(function (error, event) {

            if (!error) {

                let transacaoPJ: DashboardPessoaJuridica;

                console.log("Evento invalidacao");
                console.log(event);
                      
                transacaoPJ = {
                    cnpj: event.args.cnpj,
                    razaoSocial: "",
                    contaBlockchain: event.args.addr,
                    salic: event.args.salic,
                    hashID: event.transactionHash,
                    uniqueIdentifier: event.transactionHash,                    
                    dataHora: null,
                    hashDeclaracao: "",
                    nomeConta: event.args.idFinancialSupportAgreement,
                    status: "Conta Invalidada por Validador"
                }
                self.includeIfNotExists(transacaoPJ);
                self.recuperaInfoDerivadaPorCnpj(self, transacaoPJ);                
                self.recuperaDataHora(self, event, transacaoPJ);


            } else {
                console.log("Erro no registro de eventos de invalidacao");
                console.log(error);
            }
        });
        
    }

    includeIfNotExists(transacaoPJ) {
        let result = this.listaTransacoesPJ.find(tr => tr.uniqueIdentifier == transacaoPJ.uniqueIdentifier);
        if (!result) this.listaTransacoesPJ.push(transacaoPJ);        
    }


    setOrder(value: string) {
        if (this.order === value) {
            this.reverse = !this.reverse;
        }
        this.order = value;
        this.ref.detectChanges();
    }

    customComparator(itemA, itemB) {
        return itemB - itemA;
    }

    recuperaInfoDerivadaPorCnpj(self, transacaoPJ) {
        self.pessoaJuridicaService.recuperaEmpresaPorCnpj(transacaoPJ.cnpj).subscribe(
            data => {
                transacaoPJ.razaoSocial = "Erro: Não encontrado";
                if (data && data.dadosCadastrais) {
                    transacaoPJ.razaoSocial = data.dadosCadastrais.razaoSocial;
                  }
                  
                // Colocar dentro da zona do Angular para ter a atualização de forma correta
                self.zone.run(() => {
                    self.estadoLista = "cheia"
                    console.log("inseriu transacao Troca");
                });

            },
            error => {
                console.log("Erro ao buscar dados da empresa");
                transacaoPJ.razaoSocial = "";
                transacaoPJ.contaBlockchain = "";
            });

        if (transacaoPJ.salic=="0") transacaoPJ.salic="-";
        if (transacaoPJ.nomeConta=="0") transacaoPJ.nomeConta="-";

    }

    recuperaDataHora(self, event, transacaoPJ) {
        self.web3Service.getBlockTimestamp(event.blockHash,
            function (error, result) {
                if (!error) {
                    transacaoPJ.dataHora = new Date(result.timestamp * 1000);
                    self.ref.detectChanges();
                }
                else {
                    console.log("Erro ao recuperar data e hora do bloco");
                    console.error(error);
                }
        });

    }

}

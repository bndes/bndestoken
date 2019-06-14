declare var google: any;

import { Component, OnInit, NgZone, ViewChild } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardTransferencia } from './DashboardTransferencia';
import { Web3Service } from './../Web3Service';
import { PessoaJuridicaService } from '../pessoa-juridica.service';

import { GoogleMapsService, Marcador, MarcadorLinha } from '../shared/google-maps.service';

import { BnAlertsService } from 'bndes-ux4';


@Component({
  selector: 'app-dashboard-transferencias',
  templateUrl: './dashboard-transferencias.component.html',
  styleUrls: ['./dashboard-transferencias.component.css']
})
export class DashboardTransferenciasComponent implements OnInit {

  public pieChartData: any = {
    chartType: 'PieChart',
    dataTable: [
      ['tipo', 'valores'],
      ['Liberação', 0],
      ['Ordem de pagamento', 0],
      ['Solicitação de Resgate', 0]
    ],
    options: { 'title': 'Tipos de Transações', 'pieSliceText': 'value' },
    
  };

  public barChartData: any = {
    chartType: 'Bar',
    data: {},
    dataTable: [
      ['Tipo', 'Volume'],
      ['Liberação', 0],
      ['Pagamento', 0],
      ['Solicitação de Resgate', 0]      
    ],

  };



  public contadorLiberacao: number;
  public contadorResgate: number;
  public contadorTransferencia: number;

  public volumeLiberacao: number;
  public volumeResgate: number;
  public volumeTransferencia: number;

  listaTransferencias: DashboardTransferencia[] = undefined;
  estadoLista: string = "undefined"

  p: number = 1;
  order: string = 'dataHora';
  reverse: boolean = false;

  marcadores: Marcador[] = []
  marcadoresLinha: MarcadorLinha[] = []
  latitudeInicial: number = -15.7942287;
  longitudeInicial: number = -47.8821658;
  zoom: number = 6;

  isActive: boolean[] = []
  mapaEstaAtivo: boolean = false
  labelMap: string[] = ["A", "B"]

  @ViewChild('pieChart') pieChart;
  @ViewChild('barChart') barChart;

  razaoSocialBNDES: string = "Banco Nacional De Desenvolvimento Econômico E Social";
  selectedAccount: any;  
  blockchainNetworkPrefix: string;  

  constructor(private pessoaJuridicaService: PessoaJuridicaService, protected bnAlertsService: BnAlertsService,
    private web3Service: Web3Service, private ref: ChangeDetectorRef, private zone: NgZone, 
    private router: Router, private mapa: GoogleMapsService) { 

      let self = this;
      self.recuperaContaSelecionada();
      setInterval(function () {
        self.recuperaContaSelecionada(), 
        1000}); 

    }

  ngOnInit() {

    this.contadorLiberacao = 0;
    this.contadorResgate = 0;
    this.contadorTransferencia = 0;


    this.volumeLiberacao = 0;
    this.volumeResgate = 0;
    this.volumeTransferencia = 0;

    this.listaTransferencias = [];


    setTimeout(() => {
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


  routeToLiquidacaoResgate(solicitacaoResgateId) {
    this.router.navigate(['bndes/liquidar/' + solicitacaoResgateId]);

  }  

  atualizaGrafico() {
    if (this.pieChart != undefined && this.barChart != undefined) {
      if (this.pieChart.wrapper != undefined && this.barChart != undefined) {
        let pieDataTable = this.pieChart.wrapper.getDataTable();
        let barDataTable = this.barChart.wrapper.getDataTable();

        pieDataTable.setValue(0, 1, this.contadorLiberacao)
        pieDataTable.setValue(1, 1, this.contadorTransferencia)
        pieDataTable.setValue(2, 1, this.contadorResgate)

        barDataTable.setValue(0, 1, this.volumeLiberacao)
        barDataTable.setValue(1, 1, this.volumeTransferencia)
        barDataTable.setValue(2, 1, this.volumeResgate)

        this.pieChart.redraw();
        this.barChart.redraw();
      }
    }
  }

  registrarExibicaoEventos() {

    let self = this;

    this.blockchainNetworkPrefix = this.web3Service.getInfoBlockchainNetwork().blockchainNetworkPrefix;

    // EVENTOS LIBERAÇÃO
    this.registrarExibicaoEventosLiberacao()

    // EVENTOS TRANSFERÊNCIA
    this.registrarExibicaoEventosTransferencia()

    // EVENTOS RESGATE
    this.registrarExibicaoEventosResgate()

    console.log("antes de atualizar - contador liberacao " + self.contadorLiberacao);
    console.log("antes de atualizar - contador transferencia " + self.contadorTransferencia);
    console.log("antes de atualizar - contador resgate " + self.contadorResgate);

    console.log("antes de atualizar - volume liberacao " + self.volumeLiberacao);
    console.log("antes de atualizar - volume transferencia " + self.volumeTransferencia);
    console.log("antes de atualizar - volume resgate " + self.volumeResgate);

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

  
  registrarExibicaoEventosLiberacao() {
    let self = this

    this.web3Service.registraEventosLiberacao(function (error, event) {
      if (!error) {
        let liberacao: DashboardTransferencia;
        let eventoLiberacao = event

        self.pessoaJuridicaService.recuperaEmpresaPorCnpj(eventoLiberacao.args.cnpj).subscribe(
          data => {

            liberacao = {
              deRazaoSocial: self.razaoSocialBNDES,
              deCnpj: "BNDES",
              deConta: "-",
              paraRazaoSocial: "Erro: Não encontrado",
              paraCnpj: eventoLiberacao.args.cnpj,
              paraConta: eventoLiberacao.args.idFinancialSupportAgreement,
              valor: self.web3Service.converteInteiroParaDecimal(parseInt(eventoLiberacao.args.value)),
              tipo: "Liberação",
              hashID: eventoLiberacao.transactionHash,
              dataHora: null
            };

            if (data && data.dadosCadastrais) {
              liberacao.paraRazaoSocial = data.dadosCadastrais.razaoSocial;
            }

            // Colocar dentro da zona do Angular para ter a atualização de forma correta
            self.zone.run(() => {
              self.includeIfNotExists(liberacao);              
              self.estadoLista = "cheia"
            });

            self.contadorLiberacao++;
            self.volumeLiberacao += self.web3Service.converteInteiroParaDecimal(parseInt(eventoLiberacao.args.value));

            self.pieChartData.dataTable[1][1] = self.contadorLiberacao;
            self.barChartData.dataTable[1][1] = self.volumeLiberacao;

            self.atualizaGrafico();

            console.log("inseriu liberacao " + liberacao.hashID);
            console.log("contador liberacao " + self.contadorLiberacao);
            console.log("volume liberacao " + self.volumeLiberacao);

            self.web3Service.getBlockTimestamp(eventoLiberacao.blockHash,
              function (error, result) {
                if (!error) {
                  liberacao.dataHora = new Date(result.timestamp * 1000);
                  console.log("data hora:" + liberacao.dataHora);
                  self.ref.detectChanges();
                  //TODO: adicionar tratamento para o grafico de barras
                }
                else {
                  console.log("Erro ao recuperar data e hora do bloco");
                  console.error(error);
                }
              });

              self.isActive = new Array(self.listaTransferencias.length).fill(false)

              console.log("Chegou no final da função");
          },
          error => {
            console.log("Erro ao recuperar empresa por CNPJ do evento liberação")
          }
        )

      }
      else {
        console.log("Erro no registro de eventos de liberacao");
        console.log(error);
      }

    });
  }

  registrarExibicaoEventosTransferencia() {
    let self = this

    this.web3Service.registraEventosTransferencia(function (error, event) {
      if (!error) {
        let transferencia: DashboardTransferencia;
        let eventoTransferencia = event

        self.pessoaJuridicaService.recuperaEmpresaPorCnpj(eventoTransferencia.args.fromCnpj).subscribe(
          (data) => {

            let fromRazaoSocial = "Erro: Não encontrado";
            if (data && data.dadosCadastrais) {
              fromRazaoSocial = data.dadosCadastrais.razaoSocial;
            }

            let idContrato = eventoTransferencia.args.fromIdFinancialSupportAgreement;

            self.pessoaJuridicaService.recuperaEmpresaPorCnpj(eventoTransferencia.args.toCnpj).subscribe(
              data => {
                
                let toRazaoSocial = "Erro: Não encontrado";
                if (data && data.dadosCadastrais) {
                  toRazaoSocial = data.dadosCadastrais.razaoSocial;
                }

                transferencia = {
                  deRazaoSocial: fromRazaoSocial,
                  deCnpj: eventoTransferencia.args.fromCnpj,
                  deConta: idContrato,
                  paraRazaoSocial: toRazaoSocial,
                  paraCnpj: eventoTransferencia.args.toCnpj,
                  paraConta: "-",
                  valor: self.web3Service.converteInteiroParaDecimal(parseInt(eventoTransferencia.args.value)),
                  tipo: "Ordem de Pagamento",
                  hashID: eventoTransferencia.transactionHash,
                  dataHora: null
                };

                // Colocar dentro da zona do Angular para ter a atualização de forma correta
                self.zone.run(() => {
                  self.includeIfNotExists(transferencia);              
                  self.estadoLista = "cheia"
                })

                self.contadorTransferencia++;
                self.volumeTransferencia += self.web3Service.converteInteiroParaDecimal(parseInt(eventoTransferencia.args.value));

                self.pieChartData.dataTable[2][1] = self.contadorTransferencia;
                self.barChartData.dataTable[2][1] = self.volumeTransferencia;

                self.atualizaGrafico();

                console.log("inseriu transf " + transferencia.hashID);
                console.log("contador transf " + self.contadorTransferencia);
                console.log("volume transf " + self.volumeTransferencia);

                self.web3Service.getBlockTimestamp(eventoTransferencia.blockHash,
                  function (error, result) {
                    if (!error) {
                      transferencia.dataHora = new Date(result.timestamp * 1000);
                      self.ref.detectChanges();
                    }
                    else {
                      console.log("Erro ao recuperar data e hora do bloco");
                      console.error(error);
                    }
                  });

                  self.isActive = new Array(self.listaTransferencias.length).fill(false)
              },
              error => {
                console.log("Erro ao recuperar a empresa por cnpj do evento transferencia")
              })
          })
      }
      else {
        console.log("Erro no registro de eventos transferência");
        console.log(error);
      }

    });
  }

  registrarExibicaoEventosResgate() {
    let self = this

    this.web3Service.registraEventosResgate(function (error, event) {
      if (!error) {
        let resgate: DashboardTransferencia;
        let eventoResgate = event

        self.pessoaJuridicaService.recuperaEmpresaPorCnpj(eventoResgate.args.cnpj).subscribe(
          data => {

            resgate = {
              deRazaoSocial: "Erro: Não encontrado",
              deCnpj: eventoResgate.args.cnpj,
              deConta: "-",
              paraRazaoSocial: self.razaoSocialBNDES,
              paraCnpj: "BNDES",
              paraConta: "-",
              valor: self.web3Service.converteInteiroParaDecimal(parseInt(eventoResgate.args.value)),
              tipo: "Solicitação de Resgate",
              hashID: eventoResgate.transactionHash,
              dataHora: null
            };

            if (data && data.dadosCadastrais) {
              resgate.deRazaoSocial = data.dadosCadastrais.razaoSocial;
            }

            // Colocar dentro da zona do Angular para ter a atualização de forma correta
            self.zone.run(() => {
              self.includeIfNotExists(resgate); 
              self.estadoLista = "cheia"
            });

            self.contadorResgate++;
            self.volumeResgate += self.web3Service.converteInteiroParaDecimal(parseInt(eventoResgate.args.value));

            self.pieChartData.dataTable[3][1] = self.contadorResgate;
            self.barChartData.dataTable[3][1] = self.volumeResgate;

            self.atualizaGrafico();

            console.log("inseriu resg " + resgate.hashID);
            console.log("contador resg " + self.contadorResgate);
            console.log("volume resg " + self.volumeResgate);

            self.web3Service.getBlockTimestamp(eventoResgate.blockHash,
              function (error, result) {
                if (!error) {
                  resgate.dataHora = new Date(result.timestamp * 1000);
                  self.ref.detectChanges();
                }
                else {
                  console.log("Erro ao recuperar data e hora do bloco");
                  console.error(error);
                }
              });

              self.isActive = new Array(self.listaTransferencias.length).fill(false)
          })
      }
      else {
        console.log("Erro no registro de eventos de resgate");
        console.log(error);
      }

    });
  }

  includeIfNotExists(transacaoPJ) {
    let result = this.listaTransferencias.find(tr => tr.hashID == transacaoPJ.hashID);
    if (!result) this.listaTransferencias.push(transacaoPJ);        
 }  

}

/* Necessario rever
  selecionaTransacao(position: number, transferencia: DashboardTransferencia) {

    this.marcadores = []
    this.marcadoresLinha = []

    if (this.isActive[position]) {
      this.isActive[position] = false
      this.mapaEstaAtivo = false
    } else {
      scrollTo(0, 100000);

      this.isActive = new Array(this.listaTransferencias.length).fill(false)
      this.isActive[position] = true
      this.mapaEstaAtivo = true

      let cnpjOrigem = transferencia.deCnpj
      let cnpjDestino = transferencia.paraCnpj

      this.exibirTransferenciaNoMapa([transferencia.deCnpj, transferencia.paraCnpj])
    }

  }

  
  exibirTransferenciaNoMapa(listaCnpj: string[]) {

    let self = this

    for (var i = 0; i < listaCnpj.length; i++) {

      this.pessoaJuridicaService.recuperaEmpresaPorCnpj(listaCnpj[i]).subscribe(
        data => {
          console.log("EMPRESA RECUPERADA PELO CNPJ")

          let cidade = data ? data.dadosCadastrais.cidade : "Rio de janeiro"

          this.mapa.converteCidadeEmCoordenadas(cidade, (result) => {

            this.marcadores.push({
              lat: result[0],
              lng: result[1],
              draggable: true,
              info: data ? data.dadosCadastrais.razaoSocial : "Banco Nacional de Desenvolvimento Econômico e Social"
            })

          })

          setTimeout(() => {
            this.latitudeInicial = this.marcadores[0].lat
            this.longitudeInicial = this.marcadores[0].lng

            this.marcadoresLinha.push({
              latA: this.marcadores[0].lat,
              lngA: this.marcadores[0].lng,
              latB: this.marcadores[1].lat,
              lngB: this.marcadores[1].lng
            })

            this.ref.detectChanges()
          }, 500)

        },
        error => {
          console.log("Erro ao encontrar a empresa")
        }
      )
    }

  }
*/
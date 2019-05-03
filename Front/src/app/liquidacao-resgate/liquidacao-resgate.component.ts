import { Component, OnInit, NgZone } from '@angular/core'
import { ChangeDetectorRef } from '@angular/core'
import { Router } from '@angular/router';

import { FileSelectDirective, FileUploader } from 'ng2-file-upload'

import { Web3Service } from './../Web3Service'
import { PessoaJuridicaService } from '../pessoa-juridica.service';

import { BnAlertsService } from 'bndes-ux4'

import { LiquidacaoResgate } from './liquidacao-resgate'
import { UploadService } from '../shared/upload.service';
import { ConstantesService } from '../ConstantesService';

@Component({
  selector: 'app-liquidacao-resgate',
  templateUrl: './liquidacao-resgate.component.html',
  styleUrls: ['./liquidacao-resgate.component.css']
})
export class LiquidacaoResgateComponent implements OnInit {

  resgates: LiquidacaoResgate[] = [];

  estadoLista: string = "undefined";

  order: string = ''
  reverse: boolean = false;
  selectedAccount: any;

  isActive: boolean[] = []

  resgatesParaLiquidar: string[] = []

  constructor(private pessoaJuridicaService: PessoaJuridicaService,
    private bnAlertsService: BnAlertsService,
    private web3Service: Web3Service,
    private uploadService: UploadService,
    private ref: ChangeDetectorRef,
    private zone: NgZone, private router: Router) { }

  ngOnInit() {

    let self = this;
    setInterval(function () {
      self.recuperaContaSelecionada(), 1000});    


    setTimeout(() => {
      this.registrarExibicaoEventos()
    }, 500)


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
    let self = this
    let resgate: LiquidacaoResgate;


/*
    this.web3Service.getPastResgatesEvents().then(console.log);

    this.web3Service.registraEventosResgate(function (error, event) {
      if (!error) {        
          console.log("Encontrou algum dado")
          console.log(event)
          self.pessoaJuridicaService.recuperaEmpresaPorCnpj(event.args.cnpj).subscribe(
              data => {   
                console.log (data)           

                resgate = new LiquidacaoResgate()
                resgate.razaoSocial  = data.dadosCadastrais.razaoSocial

                resgate.hashID       = event.transactionHash
                resgate.cnpj         = event.args.cnpj
                resgate.valorResgate = self.web3Service.converteInteiroParaDecimal(parseInt(event.args.valor))

                console.log("resgate.razaoSocial"    + resgate.razaoSocial)           
                console.log("resgate.hashID: "       + resgate.hashID)
                console.log("resgate.cnpj: "         + resgate.cnpj)
                console.log("resgate.valorResgate: " + resgate.valorResgate)     
                
                self.resgates.push(resgate)
                self.estadoLista = "cheia"
                self.ref.detectChanges()

                console.log(self.resgates)
                self.isActive = new Array(self.resgates.length).fill(false)
              },
              error => {
                console.log ("Erro em self.pessoaJuridicaService.recuperaEmpresaPorCnpj(" + resgate.cnpj + ")")           
              }
            )

      } else {
        self.estadoLista = "vazia"
      }
    })
*/    
  }

  setOrder(value: string) {
    if (this.order === value) {
      this.reverse = !this.reverse
    }
    this.order = value
    this.ref.detectChanges()
  }

  customComparator(itemA, itemB) {
    return itemB - itemA
  }


  async liquidar(resgate) {
    
    console.log("Liquidando o resgate..");
    console.log(resgate);

    let bRS = await this.web3Service.isResponsibleForSettlementSync(this.selectedAccount);
    if (!bRS) {
      let s = "Conta não é do responsável pela liquidação";
      this.bnAlertsService.criarAlerta("error", "Erro", s, 5);
      return;
    }

    if (!resgate.hashComprovacao) {
      let s = "O hash da comprovação é um Campo Obrigatório";
      this.bnAlertsService.criarAlerta("error", "Erro", s, 2);
      return;
    }

    let self= this;


    this.web3Service.liquidaResgate(resgate.hashID, resgate.hashComprovacao, true,
      function (success) {
          console.log("success: " + success)
          self.router.navigate(['sociedade/dash-transf']);          
      },
      function (error) {
          console.log("error: " + error)
      })


  }

}

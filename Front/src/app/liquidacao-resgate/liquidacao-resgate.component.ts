import { Component, OnInit, NgZone } from '@angular/core'
import { ChangeDetectorRef } from '@angular/core'

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

  uploader: FileUploader = new FileUploader({ url: ConstantesService.serverUrl + "upload" });
  attachmentList: any = []

  filename: any

  resgates: LiquidacaoResgate[] = []
  estadoLista: string = "undefined"

  order: string = ''
  reverse: boolean = false

  checkTitleActive: boolean = false
  isActive: boolean[] = []

  resgatesParaLiquidar: string[] = []

  constructor(private pessoaJuridicaService: PessoaJuridicaService,
    private bnAlertsService: BnAlertsService,
    private web3Service: Web3Service,
    private uploadService: UploadService,
    private ref: ChangeDetectorRef,
    private zone: NgZone) { }

  ngOnInit() {
    setTimeout(() => {
      this.registrarExibicaoEventos()
    }, 500)

    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
  }
/*
  recuperaContaSelecionada() {
    return this.web3Service.recuperaContaSelecionada();
  }
*/
  uploadComprovante(position) {
    let self = this

    this.uploader.uploadAll()

    console.log(this.uploader)

    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      this.filename = JSON.parse(response).filename;

      self.uploadService.uploadFileLiquidacaoResgate(this.resgates[position], this.filename).subscribe(
        data => {
          console.log("Salvou o arquivo com sucesso!")

          self.resgates[position].comprovante.nome = this.filename
          self.resgates[position].comprovante.hash = data['comprovante'].hash;

          this.zone.run(() => {
            let msg = "O comprovante foi salvo com sucesso!";
            self.bnAlertsService.criarAlerta("info", "Sucesso", msg, 5)
          })

        },
        error => {
          this.zone.run(() => {
            let msg = "Erro ao salvar o comprovante";
            this.bnAlertsService.criarAlerta("error", "Erro", msg, 5)
            console.error(msg)
          })
        })
    }
  }

  baixarComprovante(resgate) {
    console.log(resgate.comprovante)

    this.uploadService.downloadFileLiquidacaoResgate(resgate.comprovante.nome).subscribe(
      data => {
        console.log("Baixou o arquivo com sucesso!")
        console.log(data);

        var url = window.URL.createObjectURL(data);
        window.open(url);
      },
      error => {
        let msg = "Erro ao baixar o arquivo.";
        this.bnAlertsService.criarAlerta("error", "Erro", msg, 5)
        console.error(msg)
      }
    )
  }

  registrarExibicaoEventos() {
    let self = this
    let resgate: LiquidacaoResgate

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
                
                resgate.contaBlockchain = ""

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

  check(position, hashID) {
    console.log("Check")
    if (this.isActive[position]) {
      this.checkTitleActive = false

      this.isActive[position] = false
      this.resgatesParaLiquidar.splice(this.resgatesParaLiquidar.indexOf(hashID), 1)
    } else {
      this.isActive[position] = true
      this.resgatesParaLiquidar.push(hashID)
    }

    this.ref.detectChanges()
  }

  checkAll() {
    console.log("CheckALL")
    if (!this.checkTitleActive) {
      this.isActive.fill(true)
      this.checkTitleActive = true
      this.resgatesParaLiquidar = this.resgates.map((resgate: LiquidacaoResgate) => resgate.hashID)
    } else {
      this.isActive.fill(false)
      this.checkTitleActive = false
      this.resgatesParaLiquidar = []
    }
    this.ref.detectChanges()
  }

  comprovanteLiquidacaoIsEmpty() {

    console.log("Testando comprovante em branco")

    for (let i = 0; i < this.resgates.length; i++) {
      for (let j = 0; j < this.resgatesParaLiquidar.length; j++) {
        console.log(this.resgates[i])
        console.log(this.resgatesParaLiquidar[j])
        if (this.resgates[i].hashID == this.resgatesParaLiquidar[j] && (this.resgates[i].comprovante.nome === "" || this.resgates[i].comprovante === undefined)) {
          return true
        }
      }
    }
    return false
  }

  liquidar() {
    console.log("Liquidando os resgates..")

    let self = this;
/*
    if (this.recuperaContaSelecionada() != this.web3Service.getAddressOwnerCacheble()) {
      this.zone.run(() => {
        let s = "A liberação deve ser executada selecionando a conta do BNDES no Metamask.";
        this.bnAlertsService.criarAlerta("error", "Erro", s, 5);
        console.log("this.recuperaContaSelecionada()=" + this.recuperaContaSelecionada());
        console.log("this.web3Service.getAddressOwnerCacheble()=" + this.web3Service.getAddressOwnerCacheble());
      })
    } else if (this.comprovanteLiquidacaoIsEmpty()) {
      this.zone.run(() => {
        let msg = "Os Resgates não podem ser liquidados sem um comprovante.";
        self.bnAlertsService.criarAlerta("error", "Erro", msg, 5);
      })
    } else {
*/
      for (var i = 0; i < self.resgatesParaLiquidar.length; i++) {
        let hashIdResgate = self.resgatesParaLiquidar[i]

        self.web3Service.liquidaResgate(hashIdResgate, self.resgates[i].comprovante.hash, function (result) {
          //result contem o hashID da Liquidacao e deve ser gravado
          self.pessoaJuridicaService.liquidarResgate(hashIdResgate, result).subscribe(
            data => {
              if (data) {
                console.log("Inseriu no bd");

                self.removerDaListaDeExibicao(hashIdResgate)
                self.removerDaListaDeSelecionados(hashIdResgate)

                let msg = "O resgate foi liquidado com sucesso";
                self.bnAlertsService.criarAlerta("info", "Sucesso", msg, 5)

                self.ref.detectChanges()

              } else {
                console.log("Nao inseriu no bd");

                self.registrarExibicaoEventos()
                self.resgatesParaLiquidar = []

                let msg = " resgates não foram liquidados.";
                self.bnAlertsService.criarAlerta("error", "Erro", msg, 5);

                self.ref.detectChanges()
              }
            },
            error => {
              console.log("Erro inserir no bd");
            })
        }, function (error) {
          console.log("Erro ao Liquidar o resgate");
        })
      }
  //  }
  }

  removerDaListaDeExibicao(hashID: string) {
    for (var i = 0; i < this.resgates.length; i++) {
      if (this.resgates[i].hashID === hashID) {
        this.resgates.splice(this.resgates.indexOf(this.resgates[i]), 1)
      }
    }
  }

  removerDaListaDeSelecionados(hashID) {
    this.resgatesParaLiquidar.splice(this.resgatesParaLiquidar.indexOf(hashID), 1)
    this.isActive.fill(false)
  }

}

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import WebSign from 'websign-client'

@Component({
  selector: 'app-assinador',
  templateUrl: './assinador.component.html',
  styleUrls: ['./assinador.component.css']
})
export class AssinadorComponent implements OnInit {

  @Input() msgDeclaracao: string
  @Output() declaracaoAssinada = new EventEmitter()

  private webSign

  possuiAssinador: boolean = false
  checkAssinador: boolean = false
  checkDeclaracaoAssinada: boolean = false

  constructor() { }

  ngOnInit() {
    var self = this

    this.webSign = new WebSign()
    this.webSign.on('service-unavailable', function (err) {
      console.log("Erro")
      self.possuiAssinador = false
    })
    this.webSign.on('service-available', function (err) {
      console.log("Conectado")
      self.possuiAssinador = true
    })
  }

  executarAssinador() {
    console.log("Chamando Assinador")

    this.webSign.sign(this.msgDeclaracao)

    this.webSign.on('signed-data', data => {
      console.log("data")
      console.log(data)

      this.declaracaoAssinada.emit(data)

      if (data != "") {
        this.checkDeclaracaoAssinada = true
      }

    })

    this.checkAssinador = true
  }

}

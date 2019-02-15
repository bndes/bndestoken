import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations'

@Component({
  selector: 'app-bloco-animado',
  templateUrl: './bloco-animado.component.html',
  styleUrls: ['./bloco-animado.component.css'],
  animations: [
    trigger('animacao-bloco', [
      state('normal', style({})),
      state('modificado', style({'border-radius': '10px 10px 0px 0px'})),
      transition('normal => modificado', animate('100ms 0s ease-in')),
      transition('modificado => normal', animate('100ms 0s ease-out'))
    ]),
    trigger('animacao-bloco-interno', [
      state('hidden', style({display: 'none'})),
      state('visible', style({display: 'block', 'border-top': '1px', 'margin-bottom': '10px'})),
      transition('hidden => visible', animate('100ms 0s ease-in')),
      transition('visible => hidden', animate('100ms 0s ease-out'))
    ])
  ]
})
export class BlocoAnimadoComponent implements OnInit, OnChanges {

  @Input() title: string
  @Input() checked: boolean = false

  animacaoBloco: string = "modificado"
  animacaoBlocoInterno: string = "visible"

  constructor() { }

  ngOnInit() {
  }

  click() {
    this.animacaoBlocoInterno = this.animacaoBlocoInterno === "hidden" ? "visible" : "hidden"
    this.animacaoBloco = this.animacaoBloco === "normal" ? "modificado" : "normal"
  }

  ngOnChanges(){
    if(this.checked) {
      this.animacaoBlocoInterno = "hidden"
      this.animacaoBloco = "normal"
    }
  }
}


import { Component, OnInit } from '@angular/core';

import { BnAlertsService } from 'bndes-ux4';
import { Web3Service } from './Web3Service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'BNDESToken';

  url = "assets/menu-itens.json"

  opcoesCabecalho = {
    exibeBusca: false,
    exibeVerTodasNotificacoes: true,
    ordemNotificacoesInversa: true,
    logLevelsNotificacoes: {
      'success': true,
      'info': true,
      'warning': true,
      'error': true
    }
  };

  constructor(private web3Service: Web3Service, protected bnAlertsService: BnAlertsService) {
    var path = window.location.pathname

    if (path.indexOf("/bndes") != -1) {
      console.log("Perfil BNDES")
      this.url = 'assets/menu-bndes.json';
    } else if (path.indexOf("/cliente") != -1) {
      console.log("Perfil Cliente")
      this.url = 'assets/menu-cliente.json';
    } else if (path.indexOf("/repassador") != -1) {
      console.log("Perfil Repassador")
      this.url = 'assets/menu-repassador.json';
    } else if (path.indexOf("/fornecedor") != -1) {
      console.log("Perfil Fornecedor")
      this.url = 'assets/menu-fornecedor.json';
    } else {
      console.log("Perfil Sociedade")
      this.url = 'assets/menu-sociedade.json';
    }

    console.info("bnAlertsService: ", bnAlertsService);
  }

    ngOnInit() {

        
    }

}

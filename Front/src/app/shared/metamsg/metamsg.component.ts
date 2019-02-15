import { Component, OnInit } from '@angular/core';
import { Web3Service } from '../../Web3Service';

@Component({
  selector: 'app-metamsg',
  templateUrl: './metamsg.component.html',
  styleUrls: ['./metamsg.component.css']
})
export class MetamsgComponent implements OnInit {

  constructor(private web3Service: Web3Service) { }

  ngOnInit() {
  }

  conexaoComBlockchainEstaOK() {
    return this.web3Service.conexaoComBlockchainEstaOK();
  }

}

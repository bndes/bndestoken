import { Component, OnInit } from '@angular/core';
import { Web3Service } from './../Web3Service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  blockchainNetworkAsString: string;
  contractAddr: string;

  constructor(private web3Service: Web3Service) { }

  ngOnInit() {
    let infoBlockchainNetwork = this.web3Service.getInfoBlockchainNetwork();
    this.blockchainNetworkAsString = infoBlockchainNetwork.blockchainNetworkAsString;
    this.contractAddr = infoBlockchainNetwork.contractAddr;
  }

}

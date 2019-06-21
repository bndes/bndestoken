import { Injectable  } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConstantesService } from './ConstantesService';
import { formattedError } from '@angular/compiler';

@Injectable()
export class Web3Service {

    private serverUrl: string;

    private addrContratoBNDESRegistry: string = '';
    private addrContratoBNDESToken: string = '';    
    private blockchainNetwork: string = '';
    private web3Instance: any;                  // Current instance of web3

    private bndesTokenSmartContract: any;
    private bndesRegistrySmartContract: any;

    // Application Binary Interface so we can use the question contract
    private ABIBndesToken;
    private ABIBndesRegistry;

    private vetorTxJaProcessadas : any[];

    private eventoBNDESToken: any;
    private eventoBNDESRegistry: any;
    private eventoCadastro: any;
    private eventoLiberacao: any;
    private eventoTransferencia: any;
    private eventoResgate: any;
    private eventoLiquidacaoResgate: any;

    private addressOwner: string;

    private decimais : number;

    constructor(private http: HttpClient, private constantes: ConstantesService) {
       
        this.vetorTxJaProcessadas = [];

        this.serverUrl = ConstantesService.serverUrl;
        console.log("Web3Service.ts :: Selecionou URL = " + this.serverUrl)

        this.http.post<Object>(this.serverUrl + 'constantesFront', {}).subscribe(
            data => {

                this.addrContratoBNDESRegistry = data["addrContratoBNDESRegistry"];
                this.addrContratoBNDESToken = data["addrContratoBNDESToken"];
                this.blockchainNetwork = data["blockchainNetwork"];
                this.ABIBndesToken = data['abiBNDESToken'];
                this.ABIBndesRegistry = data['abiBNDESRegistry'];

                console.log("abis");
                console.log(this.ABIBndesRegistry);

                this.intializeWeb3();
                this.inicializaQtdDecimais();

            },
            error => {
                console.log("**** Erro ao buscar constantes do front");
            });
            
    }


    public getInfoBlockchainNetwork(): any {

        let blockchainNetworkAsString = "Localhost";
        let blockchainNetworkPrefix = "";
        if (this.blockchainNetwork=="4") {
            blockchainNetworkAsString = "Rinkeby";
            blockchainNetworkPrefix = "rinkeby."
        }
        else if (this.blockchainNetwork=="1") {
            blockchainNetworkAsString = "Mainnet";
        }

        return {
            blockchainNetwork:this.blockchainNetwork,
            blockchainNetworkAsString:blockchainNetworkAsString,
            blockchainNetworkPrefix: blockchainNetworkPrefix,
            contractAddr: this.addrContratoBNDESToken 
        };
    }


    //fonte: https://www.xul.fr/javascript/callback-to-promise.php
    public getCurrentAccountSync() {
        let self = this;
        return new Promise(function(resolve, reject) {
            self.web3.eth.getAccounts(function(error, accounts) {
                resolve(accounts[0]);
            })
        })
    }


    private intializeWeb3(): void {

        if (typeof window['web3'] !== 'undefined') {
            this.web3 = new this.Web3(window['web3'].currentProvider);
            console.log("Conectado com noh");
    
        } else {
            console.log('Using HTTP node --- nao suportado');
            return; 
        }

        this.bndesTokenSmartContract = this.web3.eth.contract(this.ABIBndesToken).at(this.addrContratoBNDESToken);
        this.bndesRegistrySmartContract = this.web3.eth.contract(this.ABIBndesRegistry).at(this.addrContratoBNDESRegistry);

        console.log("INICIALIZOU O WEB3 - bndesTokenContract abaixo");
        console.log("BNDESToken=" + this.bndesTokenSmartContract);
        console.log("BNDESRegistry=" + this.bndesRegistrySmartContract);

        let self = this;

        this.getAddressOwner(function (addrOwner) {
            console.log("Owner Addr =" + addrOwner);
            self.addressOwner = addrOwner;
        }, function (error) {
            console.log("Erro ao buscar owner=" + error);
        });

}


    get web3(): any {
        if (!this.web3Instance) {
            this.intializeWeb3();
        }
        return this.web3Instance;
    }
    set web3(web3: any) {
        this.web3Instance = web3;
    }
/*    get currentAddr(): string {
        return this.contractAddr;
    }
    set currentAddr(contractAddr: string) {
        if (contractAddr.length === 42 || contractAddr.length === 40) {
            this.contractAddr = contractAddr;
        } else {
            console.log('Invalid address used');
        }
    }
*/    
    get Web3(): any {
        return window['Web3'];
    }

    getPastResgatesEvents() {
        this.bndesTokenSmartContract.getPastLogs('Resgate', { fromBlock: 0, toBlock: 'latest' });
    }

    registraEventosCadastro(callback) {
        this.eventoCadastro = this.bndesRegistrySmartContract.AccountRegistration({}, { fromBlock: 0, toBlock: 'latest' });
        this.eventoCadastro.watch(callback);
    }
    registraEventosTroca(callback) {
        this.eventoCadastro = this.bndesRegistrySmartContract.AccountChange({}, { fromBlock: 0, toBlock: 'latest' });
        this.eventoCadastro.watch(callback);
    }
    registraEventosValidacao(callback) {
        this.eventoCadastro = this.bndesRegistrySmartContract.AccountValidation({}, { fromBlock: 0, toBlock: 'latest' });
        this.eventoCadastro.watch(callback);
    }
    registraEventosInvalidacao(callback) {
        this.eventoCadastro = this.bndesRegistrySmartContract.AccountInvalidation({}, { fromBlock: 0, toBlock: 'latest' });
        this.eventoCadastro.watch(callback);
    }
    registraEventosLiberacao(callback) {
        this.eventoLiberacao = this.bndesTokenSmartContract.BNDESTokenDisbursement({}, { fromBlock: 0, toBlock: 'latest' });
        this.eventoLiberacao.watch(callback);
    }
    registraEventosTransferencia(callback) {
        this.eventoTransferencia = this.bndesTokenSmartContract.BNDESTokenTransfer({}, { fromBlock: 0, toBlock: 'latest' });
        this.eventoTransferencia.watch(callback);
    }
    registraEventosResgate(callback) {
        this.eventoResgate = this.bndesTokenSmartContract.BNDESTokenRedemption({}, { fromBlock: 0, toBlock: 'latest' });
        this.eventoResgate.watch(callback);
    }
    registraEventosLiquidacaoResgate(callback) {
        this.eventoLiquidacaoResgate = this.bndesTokenSmartContract.BNDESTokenRedemptionSettlement({}, { fromBlock: 0, toBlock: 'latest' });
        this.eventoLiquidacaoResgate.watch(callback);
    }

    registraWatcherEventosLocal(txHashProcurado, callback) {
        let self = this;
        console.info("Callback ", callback);
        const filtro = { fromBlock: 'latest', toBlock: 'pending' }; 
        
        this.eventoBNDESToken = this.bndesTokenSmartContract.allEvents( filtro );                 
        this.eventoBNDESToken.watch( function (error, result) {
            console.log("Watcher BNDESToken executando...")
            self.procuraTransacao(error, result, txHashProcurado, self, callback);
        });
        this.eventoBNDESRegistry = this.bndesRegistrySmartContract.allEvents( filtro );                 
        this.eventoBNDESRegistry.watch( function (error, result) {
            console.log("Watcher BNDESRegistry executando...")
            self.procuraTransacao(error, result, txHashProcurado, self, callback);
        });
     
        console.log("registrou o watcher de eventos");
    }

    procuraTransacao(error, result, txHashProcurado, self, callback) {
        console.log( "Entrou no procuraTransacao" );
        console.log( "txHashProcurado: " + txHashProcurado );
        console.log( "result.transactionHash: " + result.transactionHash );
        self.web3.eth.getTransactionReceipt(txHashProcurado,  function (error, result) {
            if ( !error ) {
                let status = result.status
                let STATUS_MINED = 0x1
                console.log("Achou o recibo da transacao... " + status)     
                if ( status == STATUS_MINED && !self.vetorTxJaProcessadas.includes(txHashProcurado)) {
                    self.vetorTxJaProcessadas.push(txHashProcurado);
                    callback(error, result);        
                } else {
                    console.log('"Status da tx pendente ou jah processado"')
                }
            }
            else {
              console.log('Nao eh o evento de confirmacao procurado')
            } 
        });     
    }


    async cadastra(cnpj: number, idSubcredito: number, salic: number, hashdeclaracao: string,
        fSuccess: any, fError: any) {

        let contaBlockchain = await this.getCurrentAccountSync();    

        console.log("Web3Service - Cadastra")
        console.log("CNPJ: " + cnpj + ", Contrato: " + idSubcredito + ",salic: "+ salic + 
            ", hashdeclaracao: " + hashdeclaracao
            )

        this.bndesTokenSmartContract.registryLegalEntity(cnpj, idSubcredito, salic, 
            hashdeclaracao, 
            { from: contaBlockchain, gas: 500000 },
            (error, result) => {
                if (error) fError(error);
                else fSuccess(result);
            });
    }


    getVersao(fSuccess: any, fError: any): number {
        console.log("vai recuperar a versao. " );
        let self = this;
        return this.bndesTokenSmartContract.getVersion(
            (error, versao) => {
                if (error) fError(error);
                else fSuccess(   parseInt ( versao )  );
            });
    }


    getTotalSupply(fSuccess: any, fError: any): number {
        console.log("vai recuperar o totalsupply. " );
        let self = this;
        return this.bndesTokenSmartContract.getTotalSupply(
            (error, totalSupply) => {
                if (error) fError(error);
                else fSuccess( self.converteInteiroParaDecimal(  parseInt ( totalSupply ) ) );
            });
    }

    getBalanceOf(address: string, fSuccess: any, fError: any): number {
        console.log("vai recuperar o balanceOf de " + address);
        let self = this;
        return this.bndesTokenSmartContract.balanceOf(address,
            (error, valorSaldoCNPJ) => {
                if (error) fError(error);
                else fSuccess( self.converteInteiroParaDecimal( parseInt ( valorSaldoCNPJ ) ) );
            });

    }

    getCNPJ(addr: string, fSuccess: any, fError: any): number {
        return this.bndesRegistrySmartContract.getCNPJ(addr,
            (error, result) => {
                if (error) fError(error);
                else fSuccess(result);
            });
    }

    isChangeAccountEnabled(addr: string, fSuccess: any, fError: any): number {
        return this.bndesRegistrySmartContract.isChangeAccountEnabled(addr,
            (error, result) => {
                if (error) fError(error);
                else fSuccess(result);
            });
    }    

    isChangeAccountEnabledSync(addr: string) {
        let self = this;

        return new Promise (function(resolve) {
            self.isChangeAccountEnabled(addr, function(result) {
                resolve(result);
            }, function(reject) {
                console.log("ERRO isChangeAccountEnabledSync");
                reject(false);
            });
        })
    }


    getPJInfo(addr: string, fSuccess: any, fError: any): number {
        let self = this;
        return this.bndesRegistrySmartContract.getLegalEntityInfo(addr,
            (error, result) => {
                if (error) fError(error);
                else {
                    let pjInfo = self.montaPJInfo(result);
                    fSuccess(pjInfo);
                }
            });
    }

    getPJInfoByCnpj(cnpj:string, idSubcredito: number, fSuccess: any, fError: any): number {
 
        let self = this;
        return this.bndesRegistrySmartContract.getLegalEntityInfoByCNPJ(cnpj, idSubcredito,
            (error, result) => {
                if (error) fError(error);
                else {
                    let pjInfo = self.montaPJInfo(result);
                    fSuccess(pjInfo);
                }
            });
    }

    getContaBlockchain(cnpj:string, idSubcredito: number, fSuccess: any, fError: any): string {
        return this.bndesRegistrySmartContract.getBlockchainAccount(cnpj, idSubcredito,
            (error, result) => {
                if (error) fError(error);
                else fSuccess(result);
            });
    }

    getAddressOwner(fSuccess: any, fError: any): number {
        return this.bndesRegistrySmartContract.owner(
            (error, result) => {
                if (error) fError(error);
                else fSuccess(result);
            });
    }

    inicializaQtdDecimais() {
        let self = this;
        this.bndesTokenSmartContract.decimals(
            (error, result) => {
                if (error) { 
                    console.log( "Decimais error: " +  error);  
                    self.decimais = -1 ;
                } 
                else {
                    console.log ( "Decimais result: " +  result );
                    console.log ( "Decimais .c[0]: " +  result.c[0] );
                    self.decimais = result.c[0] ;
                }
                    
            }); 
    }

    converteDecimalParaInteiro( _x : number ): number {
        return ( _x * ( 10 ** this.decimais ) ) ;
    }

    converteInteiroParaDecimal( _x: number ): number {    
        return ( _x / ( 10 ** this.decimais ) ) ;
    }

    async transfer(target: string, transferAmount: number, fSuccess: any, fError: any) {

        let contaSelecionada = await this.getCurrentAccountSync();    
        
        console.log("conta selecionada=" + contaSelecionada);
        console.log("Web3Service - Transfer");
        console.log('Target=' + target);
        console.log('TransferAmount(before)=' + transferAmount);
        transferAmount = this.converteDecimalParaInteiro(transferAmount);     
        console.log('TransferAmount(after)=' + transferAmount);

        this.bndesTokenSmartContract.transfer(target, transferAmount, { from: contaSelecionada, gas: 500000 },
            (error, result) => {
                if (error) fError(error);
                else fSuccess(result);
            });

    }

    liberacao(target: string, transferAmount: number, fSuccess: any, fError: any): void {
        console.log("Web3Service - Liberacao")

        this.transfer(target, transferAmount, fSuccess, fError);
    }

    async resgata(transferAmount: number, fSuccess: any, fError: any) {

        let contaSelecionada = await this.getCurrentAccountSync();    
        
        console.log("conta selecionada=" + contaSelecionada);
        console.log("Web3Service - Redeem");
        transferAmount = this.converteDecimalParaInteiro(transferAmount);     

        this.bndesTokenSmartContract.redeem(transferAmount, { from: contaSelecionada, gas: 500000 },
            (error, result) => {
                if (error) fError(error);
                else fSuccess(result);
            });
    }

    liquidaResgate(hashResgate: any, hashComprovante: any, isOk: boolean, fSuccess: any, fError: any) {
        console.log("Web3Service - liquidaResgate")
        console.log("HashResgate - " + hashResgate)
        console.log("HashComprovante - " + hashComprovante)
        console.log("isOk - " + isOk)

        this.bndesTokenSmartContract.notifyRedemptionSettlement(hashResgate, hashComprovante, 
            (error, result) => {
                if (error) fError(error);
                else fSuccess(result);
            });
    }

    async trocaAssociacaoDeConta(cnpj: number, idSubcredito: number, salic: number, hashdeclaracao: string,
        fSuccess: any, fError: any) {

        console.log("Web3Service - Troca Associacao")
        console.log("CNPJ: " + cnpj + ", Contrato: " + idSubcredito + ", cnpj: " + cnpj)
        console.log("salic= " + salic);
        console.log("hash= " + hashdeclaracao);

        let contaBlockchain = await this.getCurrentAccountSync();    

        this.bndesTokenSmartContract.changeAccountLegalEntity(cnpj, idSubcredito, salic, hashdeclaracao, 
            { from: contaBlockchain, gas: 500000 },
            (error, result) => {
                if (error) fError(error);
                else fSuccess(result);
            });
    }

    getBlockTimestamp(blockHash: number, fResult: any) {

        this.web3.eth.getBlock(blockHash, fResult);

    }


    isCliente(address: string, fSuccess: any, fError: any): boolean {
        return this.bndesRegistrySmartContract.isClient(address,
            (error, result) => {
                if (error) fError(error);
                else fSuccess(result);
            });
    }
  
    isClienteSync(address: string) {
        let self = this;

        return new Promise (function(resolve) {
            self.isCliente(address, function(result) {
                resolve(result);
            }, function(reject) {
                console.log("ERRO IS CLIENTE SYNC");
                reject(false);
            });
        })
    }
        


    isFornecedor(address: string, fSuccess: any, fError: any): boolean {
        return this.bndesRegistrySmartContract.isSupplier(address,
            (error, result) => {
                if (error) fError(error);
                else fSuccess(result);
            });
    }


    isFornecedorSync(address: string) {
        let self = this;

        return new Promise (function(resolve) {
            self.isFornecedor(address, function(result) {
                resolve(result);
            }, function(reject) {
                console.log("ERRO IS FORNECEDOR SYNC");
                reject(false);
            });
        })
    }
        
    isResponsibleForSettlement(address: string, fSuccess: any, fError: any): boolean {
        return this.bndesRegistrySmartContract.isResponsibleForSettlement(address,
            (error, result) => {
                if (error) fError(error);
                else fSuccess(result);
            });
    }

    isResponsibleForSettlementSync(address: string) {
        let self = this;

        return new Promise (function(resolve) {
            self.isResponsibleForSettlement(address, function(result) {
                resolve(result);
            }, function(reject) {
                console.log("ERRO IS responsible for Settlement  SYNC");
                reject(false);
            });
        })
    }

    isResponsibleForRegistryValidation(address: string, fSuccess: any, fError: any): boolean {

        return this.bndesRegistrySmartContract.isResponsibleForRegistryValidation(address,
            (error, result) => {
                if (error) fError(error);
                else fSuccess(result);
            });
    }

    isResponsibleForRegistryValidationSync(address: string) {
        let self = this;

        return new Promise (function(resolve) {
            self.isResponsibleForRegistryValidation(address, function(result) {
                resolve(result);
            }, function(reject) {
                console.log("ERRO isResponsibleForRegistryValidation  SYNC");
                reject(false);
            });
        })
    }    


    isResponsibleForDisbursement(address: string, fSuccess: any, fError: any): boolean {
        return this.bndesRegistrySmartContract.isResponsibleForDisbursement(address,
            (error, result) => {
                if (error) fError(error);
                else fSuccess(result);
            });
    }

    isResponsibleForDisbursementSync(address: string) {
        let self = this;

        return new Promise (function(resolve) {
            self.isResponsibleForDisbursement(address, function(result) {
                resolve(result);
            }, function(reject) {
                console.log("ERRO isResponsibleForDisbursement  SYNC");
                reject(false);
            });
        })
    }       

    

    accountIsActive(address: string, fSuccess: any, fError: any): boolean {
        return this.bndesRegistrySmartContract.isValidatedAccount(address, 
        (error, result) => {
            if(error) fError(error);
            else fSuccess(result);
        });
    }

    async isSelectedAccountOwner() {
        let contaSelecionada = await this.getCurrentAccountSync();    
        return contaSelecionada == this.addressOwner;
    }

    isContaDisponivel(address: string, fSuccess: any, fError: any): boolean {
        return this.bndesRegistrySmartContract.isAvailableAccount(address, 
            (error, result) => {
                if(error) fError(error);
                else fSuccess(result);
            });
    }

    public isContaDisponivelSync(address: string) {
        
        let self = this;

        return new Promise (function(resolve) {
            self.isContaDisponivel(address, function(result) {
                resolve(result);
            }, function(reject) {
                console.log("ERRO IS CONTA DISPONIVEL SYNC");
                reject(false);
            });
        })
    }


    isContaAguardandoValidacao(address: string, fSuccess: any, fError: any): boolean {
        return this.bndesRegistrySmartContract.isWaitingValidationAccount(address, 
            (error, result) => {
                if(error) fError(error);
                else fSuccess(result);
            });
    }

    isContaValidada(address: string, fSuccess: any, fError: any): boolean {
        return this.bndesRegistrySmartContract.isValidatedAccount(address, 
            (error, result) => {
                if(error) fError(error);
                else fSuccess(result);
            });
    }

    public isContaValidadaSync(address: string) {
        
        let self = this;

        return new Promise (function(resolve) {
            self.isContaValidada(address, function(result) {
                resolve(result);
            }, function(reject) {
                console.log("ERRO IS CONTA VALIDADA SYNC");
                reject(false);
            });
        })
    }
     

    async validarCadastro(address: string, hashTentativa: string, fSuccess: any, fError: any) {
        
        let contaBlockchain = await this.getCurrentAccountSync();    

        this.bndesRegistrySmartContract.validateRegistryLegalEntity(address, hashTentativa, 
            { from: contaBlockchain, gas: 500000 },
            (error, result) => {
                if(error) { fError(error); return false; }
                else { fSuccess(result); return true; }
            });
    }

    async invalidarCadastro(address: string, fSuccess: any, fError: any) {

        let contaBlockchain = await this.getCurrentAccountSync();    

        this.bndesRegistrySmartContract.invalidateRegistryLegalEntity(address, 
            { from: contaBlockchain, gas: 500000 },
            (error, result) => {
                if(error) { fError(error); return false; }
                else { fSuccess(result); return true; }
            });
        return false;
    }

    

    getEstadoContaAsString(address: string, fSuccess: any, fError: any): string {
        let self = this;
        return this.bndesRegistrySmartContract.getAccountState(address, 
        (error, result) => {
            if(error) fError(error);
            else {
                let str = self.getEstadoContaAsStringByCodigo (result);
                fSuccess(str);
            }   
        });
    }



    //Métodos de tradução back-front

    montaPJInfo(result): any {
        let pjInfo: any;

        console.log(result);
        pjInfo  = {};
        pjInfo.cnpj = result[0].c[0];
        pjInfo.idSubcredito = result[1].c[0];
        pjInfo.salic = result[2].c[0];
        pjInfo.hashDeclaracao = result[3];
        pjInfo.status = result[4].c[0];
        pjInfo.address = result[5];

        pjInfo.statusAsString = this.getEstadoContaAsStringByCodigo(pjInfo.status);

        if (pjInfo.status == 2) {
            pjInfo.isValidada =  true;
        }
        else {
            pjInfo.isValidada = false;
        }


        if (pjInfo.status == 0) {
            pjInfo.isAssociavel =  true;
        }
        else {
            pjInfo.isAssociavel = false;
        }


        if (pjInfo.status == 1 || pjInfo.status == 2 || pjInfo.status == 3 || pjInfo.status == 4) {
            pjInfo.isTrocavel =  true;
        }
        else {
            pjInfo.isTrocavel = false;
        }


        return pjInfo;
    }


    getEstadoContaAsStringByCodigo(result): string {
        if (result==100) {
            return "Conta Reservada";
        }
        else if (result==0) {
            return "Disponível";
        }
        else if (result==1) {
            return "Aguardando validação do Cadastro";
        }                
        else if (result==2) {
            return "Validada";
        }    
        else if (result==3) {
            return "Conta invalidada pelo Validador";
        }    
        else if (result==4) {
            return "Conta invalidada por Troca de Conta";
        }                                                       
        else {
            return "N/A";
        }        
    }

}
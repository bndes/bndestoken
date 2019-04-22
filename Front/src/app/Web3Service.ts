import { Injectable, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ConstantesService } from './ConstantesService';
import { formattedError } from '@angular/compiler';

@Injectable()
export class Web3Service {

    private serverUrl: string;

    private contractAddr: string = '';
    private web3Instance: any;                  // Current instance of web3

    private bndesTokenContract: any;

    // Application Binary Interface so we can use the question contract
    private ABI;

    private vetorTxJaProcessadas : any[];

    private eventoGenerico: any;
    private eventoCadastro: any;
    private eventoLiberacao: any;
    private eventoTransferencia: any;
    private eventoRepasse: any;
    private eventoResgate: any;
    private eventoLiquidacaoResgate: any;
    private eventoLog: any[];

    private addressOwner: string;

    private decimais : number;

    constructor(private http: HttpClient, private constantes: ConstantesService) {
       
        this.eventoLog = [ {length: 6} ];
        this.vetorTxJaProcessadas = [];

        this.serverUrl = ConstantesService.serverUrl;
        console.log("Web3Service.ts :: Selecionou URL = " + this.serverUrl)

        this.http.post<Object>(this.serverUrl + 'constantesFront', {}).subscribe(
            data => {

                this.contractAddr = data["addrContrato"];

                // Seta a ABI de acordo com o json do contrato
                this.http.get(this.serverUrl + 'abi').subscribe(
                    data => {
                        this.ABI = data['abi'];
                        this.intializeWeb3();
                        this.inicializaQtdDecimais();
                    },
                    error => {
                        console.log("Erro ao buscar ABI do contrato")
                    }
                );
            },
            error => {
                console.log("**** Erro ao buscar constantes do front");
            });
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

        this.bndesTokenContract = this.web3.eth.contract(this.ABI).at(this.contractAddr);

        console.log("INICIALIZOU O WEB3 - bndesTokenContract abaixo");
        console.log(this.bndesTokenContract);

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
    get currentAddr(): string {
        return this.contractAddr;
    }
    set currentAddr(contractAddr: string) {
        if (contractAddr.length === 42 || contractAddr.length === 40) {
            this.contractAddr = contractAddr;
        } else {
            console.log('Invalid address used');
        }
    }
    get Web3(): any {
        return window['Web3'];
    }

    registraEventosCadastro(callback) {
        this.eventoCadastro = this.bndesTokenContract.CadastroConta({}, { fromBlock: 0, toBlock: 'latest' });
        this.eventoCadastro.watch(callback);
    }
    registraEventosTroca(callback) {
        this.eventoCadastro = this.bndesTokenContract.TrocaConta({}, { fromBlock: 0, toBlock: 'latest' });
        this.eventoCadastro.watch(callback);
    }
    registraEventosLiberacao(callback) {
        this.intializeWeb3(); //forca inicializa
        this.eventoLiberacao = this.bndesTokenContract.Liberacao({}, { fromBlock: 0, toBlock: 'latest' });
        this.eventoLiberacao.watch(callback);
    }
    registraEventosTransferencia(callback) {
        this.eventoTransferencia = this.bndesTokenContract.Transferencia({}, { fromBlock: 0, toBlock: 'latest' });
        this.eventoTransferencia.watch(callback);
    }
    registraEventosRepasse(callback) {
        this.eventoRepasse = this.bndesTokenContract.Repasse({}, { fromBlock: 0, toBlock: 'latest' });
        this.eventoRepasse.watch(callback);
    }
    registraEventosResgate(callback) {
        this.eventoResgate = this.bndesTokenContract.Resgate({}, { fromBlock: 0, toBlock: 'latest' });
        this.eventoResgate.watch(callback);
    }
    registraEventosLiquidacaoResgate(callback) {
        this.eventoLiquidacaoResgate = this.bndesTokenContract.LiquidacaoResgate({}, { fromBlock: 0, toBlock: 'latest' });
        this.eventoLiquidacaoResgate.watch(callback);
    }

    registraEventosLog(callback) {
        this.eventoLog[0] = this.bndesTokenContract.LogUint({}, { fromBlock: 0, toBlock: 'latest' });
        this.eventoLog[1] = this.bndesTokenContract.LogInt({}, { fromBlock: 0, toBlock: 'latest' });
        this.eventoLog[2] = this.bndesTokenContract.LogBytes({}, { fromBlock: 0, toBlock: 'latest' });
        this.eventoLog[3] = this.bndesTokenContract.LogBytes32({}, { fromBlock: 0, toBlock: 'latest' });
        this.eventoLog[4] = this.bndesTokenContract.LogAddress({}, { fromBlock: 0, toBlock: 'latest' });
        this.eventoLog[5] = this.bndesTokenContract.LogBool({}, { fromBlock: 0, toBlock: 'latest' });
        
        this.eventoLog[0].watch(callback);
        this.eventoLog[1].watch(callback);
        this.eventoLog[2].watch(callback);
        this.eventoLog[3].watch(callback);
        this.eventoLog[4].watch(callback);
        this.eventoLog[5].watch(callback);
    }

    registraWatcherEventosLocal(txHashProcurado, callback) {
        this.intializeWeb3(); //forca inicializa
        let self = this;
        console.info("Callback ", callback);
        const filtro = { fromBlock: 'latest', toBlock: 'pending' }; 
        
        this.eventoGenerico = this.bndesTokenContract.allEvents( filtro );                 
        this.eventoGenerico.watch( function (error, result) {
            console.log("Watcher executando...")
            self.procuraTransacao(error, result, txHashProcurado, self, callback);
        });      
        
        console.log("registrou o watcher de eventos");
    }

    procuraTransacao(error, result, txHashProcurado, self, callback) {
        console.log( "Entrou no procuraTransacao" );
        console.log( "txHashProcurado: " + txHashProcurado );
        console.log( "result.transactionHash: " + result.transactionHash );
        let meuErro;
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
        console.log("CNPJ: " + cnpj + ", Subcredito: " + idSubcredito + ",salic: "+ salic + 
            ", hashdeclaracao: " + hashdeclaracao
            )

        this.bndesTokenContract.cadastra(cnpj, idSubcredito, salic, 
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
        return this.bndesTokenContract.getVersao(
            (error, versao) => {
                if (error) fError(error);
                else fSuccess(   parseInt ( versao )  );
            });
    }


    getTotalSupply(fSuccess: any, fError: any): number {
        console.log("vai recuperar o totalsupply. " );
        let self = this;
        return this.bndesTokenContract.getTotalSupply(
            (error, totalSupply) => {
                if (error) fError(error);
                else fSuccess( self.converteInteiroParaDecimal(  parseInt ( totalSupply ) ) );
            });
    }

    getBalanceOf(address: string, fSuccess: any, fError: any): number {
        console.log("vai recuperar o balanceOf de " + address);
        let self = this;
        return this.bndesTokenContract.balanceOf(address,
            (error, valorSaldoCNPJ) => {
                if (error) fError(error);
                else fSuccess( self.converteInteiroParaDecimal( parseInt ( valorSaldoCNPJ ) ) );
            });

    }

    getCNPJ(addr: string, fSuccess: any, fError: any): number {
        return this.bndesTokenContract.getCNPJ(addr,
            (error, result) => {
                if (error) fError(error);
                else fSuccess(result);
            });
    }

    getPJInfo(addr: string, fSuccess: any, fError: any): number {
        return this.bndesTokenContract.getPJInfo(addr,
            (error, result) => {
                if (error) fError(error);
                else {
                    let pjInfo = {cnpj: String, idSubcredito: String, salic: String, hashDeclaracao: String};
                    pjInfo.cnpj = result[0].c[0];
                    pjInfo.idSubcredito = result[1].c[0];
                    pjInfo.salic = result[2].c[0];
                    pjInfo.hashDeclaracao = result[3];

                    fSuccess(pjInfo);
                }
            });
    }

    getContaBlockchain(cnpj:string, idSubcredito: number, fSuccess: any, fError: any): string {
        return this.bndesTokenContract.getContaBlockchain(cnpj, idSubcredito,
            (error, result) => {
                if (error) fError(error);
                else fSuccess(result);
            });
    }

    getAddressOwner(fSuccess: any, fError: any): number {
        return this.bndesTokenContract.owner(
            (error, result) => {
                if (error) fError(error);
                else fSuccess(result);
            });
    }

    getAddressOwnerCacheble() {
        return this.addressOwner;
    }

    inicializaQtdDecimais() {
        let self = this;
        this.bndesTokenContract.decimals(
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

        this.bndesTokenContract.transfer(target, transferAmount, { from: contaSelecionada, gas: 500000 },
            (error, result) => {
                if (error) fError(error);
                else fSuccess(result);
            });

    }

    liberacao(target: string, transferAmount: number, fSuccess: any, fError: any): void {
        console.log("Web3Service - Liberacao")

        this.transfer(target, transferAmount, fSuccess, fError);
    }

    // aguardaLiberacao(cnpj: string, subcredito: number, valor: number)
    // {
    //     this.intializeWeb3(); //forca inicializa        
    //     var evento = this.bndesTokenContract.Liberacao({cnpj: cnpj, sucredito: subcredito, valor: valor}, 
    //         { fromBlock: 'pending', toBlock: 'latest' });

    //     evento.watch(function (erro, result) {
    //         evento.stopWatching();
    //         if (!erro) return true;
    //         else return erro;
    //     });
            
    //     Liberacao(pjsInfo[_to].cnpj, pjsInfo[_to].idSubcredito, _value);                    
    
    // }

    resgata(transferAmount: number, fSuccess: any, fError: any): void {

        console.log("Web3Service - Resgata " + transferAmount);
        let self = this;

        this.getAddressOwner(
            function (addrOwner) {
                self.transfer(addrOwner, transferAmount, fSuccess, fError);
                console.log("owner abaixo - dentro do resgata");
                console.log(addrOwner);
            },
            function (error) {
                console.log("erro na recuperacao do owner dentro do metodo resgata");
                console.log(error);
            }
        );

    }

    liquidaResgate(hashResgate: any, hashComprovante: any, fSuccess: any, fError: any) {
        console.log("Web3Service - liquidaResgate")
        console.log("HashResgate - " + hashResgate)
        console.log("HashComprovante - " + hashComprovante)

        this.bndesTokenContract.notificaLiquidacaoResgate(hashResgate, hashComprovante,
            (error, result) => {
                if (error) fError(error);
                else fSuccess(result);
            });
    }

    cancelarAssociacaoDeConta(cnpj: number, subcredito: number, cnpjOrigemRepasse: number, fSuccess: any, fError: any) {
        console.log("Web3Service - Cancelar Associacao")
        console.log("CNPJ: " + cnpj + ", Subcredito: " + subcredito + ", cnpjOrigemRepasse: " + cnpjOrigemRepasse)

        this.bndesTokenContract.troca(cnpj, subcredito, { gas: 500000 },
            (error, result) => {
                if (error) fError(error);
                else fSuccess(result);
            });
    }

    async setBalanceOf(address: string, valor: number, fSuccess: any, fError: any) 
    {
        let contaSelecionada = await this.getCurrentAccountSync();    
        
        valor = this.converteDecimalParaInteiro(valor);
        this.bndesTokenContract.setBalanceOf(address, valor, { from: contaSelecionada, gas: 500000 },
            (error, result) => {
                if (error) fError(error);
                else fSuccess(result);
            }
        );                
    }
    

    conexaoComBlockchainEstaOK() {
        
        if ( this.web3 === undefined )
           return false;
        else
            return true;             
      }


    getBlockTimestamp(blockHash: number, fResult: any) {

        this.web3.eth.getBlock(blockHash, fResult);

    }

    isFornecedor(address: string, fSuccess: any, fError: any): boolean {
        return this.bndesTokenContract.isFornecedor(address,
            (error, result) => {
                if (error) fError(error);
                else fSuccess(result);
            });
    }

    accountIsActive(address: string, fSuccess: any, fError: any): boolean {
        return this.bndesTokenContract.isContaValidada(address, 
        (error, result) => {
            if(error) fError(error);
            else fSuccess(result);
        });
    }

    getEstadoContaAsString(address: string, fSuccess: any, fError: any): string {
        return this.bndesTokenContract.getEstadoContaAsString(address, 
        (error, result) => {
            if(error) fError(error);
            else fSuccess(result);
        });
    }

    isContaDisponivel(address: string, fSuccess: any, fError: any): boolean {
        return this.bndesTokenContract.isContaDisponivel(address, 
            (error, result) => {
                if(error) fError(error);
                else fSuccess(result);
            });
    }

    isContaAguardandoValidacao(address: string, fSuccess: any, fError: any): boolean {
        return this.bndesTokenContract.isContaAguardandoValidacao(address, 
            (error, result) => {
                if(error) fError(error);
                else fSuccess(result);
            });
    }

    isContaValidada(address: string, fSuccess: any, fError: any): boolean {
        return this.bndesTokenContract.isContaValidada(address, 
            (error, result) => {
                if(error) fError(error);
                else fSuccess(result);
            });
    }

     

    async validarCadastro(address: string, hashTentativa: string, fSuccess: any, fError: any) {
        
        let contaBlockchain = await this.getCurrentAccountSync();    

        this.bndesTokenContract.validarCadastro(address, hashTentativa, 
            { from: contaBlockchain, gas: 500000 },
            (error, result) => {
                if(error) { fError(error); return false; }
                else { fSuccess(result); return true; }
            });
    }

    async invalidarCadastro(address: string, fSuccess: any, fError: any) {

        let contaBlockchain = await this.getCurrentAccountSync();    

        this.bndesTokenContract.invalidarCadastro(address, 
            { from: contaBlockchain, gas: 500000 },
            (error, result) => {
                if(error) { fError(error); return false; }
                else { fSuccess(result); return true; }
            });
        return false;
    }
}

export class RegistroSaldoContas {
    conta: string;
    status: string;
    saldo: number;
    dadosBancarios: {
        banco: string;
        agencia: string;
        contaCorrente: string;
    }    
}
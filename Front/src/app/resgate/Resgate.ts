export class Resgate {
  contaBlockchainOrigem: string;
  cnpjOrigem: string;
  razaoSocialOrigem: string;
  saldoOrigem: number;
  bancoOrigem: string;
  agenciaOrigem: string;
  contaCorrenteOrigem: string;
  valor: number;
  ehFornecedor: boolean;
  contaBlockchainBNDES: string;
  isLiquidado: boolean;
  hashID: string;
  hashIDliquidacao: string;
  comprovante: {
    nome: string,
    hash: string
  }
}

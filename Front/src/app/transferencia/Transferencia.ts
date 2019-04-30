export class Transferencia {
  contaBlockchainOrigem: string;
  subcredito: string;
  saldoOrigem: number;

  papelEmpresaDestino: string;
  cnpjDestino: string;
  contaBlockchainDestino: string;
  razaoSocialDestino: string;
  msgEmpresaDestino: string;

  valorTransferencia: number;
  hashOperacao: string;

//  numeroSubcredito: number;
  dataHora: Date;
}

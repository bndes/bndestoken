export class Liberacao {
  contaBlockchainBNDES: string;
  cnpj: string;
  cnpjWithMask: string;  
  subcreditos: Subcredito[];
  numeroSubcreditoSelecionado: number;
  razaoSocial: string;
  valor: number;
  saldoCNPJ: number;
  contaBlockchainCNPJ: string;
  hashID: string;
}

export class Subcredito {
  numero: number;
}
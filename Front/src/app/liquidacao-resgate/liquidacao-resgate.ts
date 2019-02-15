export class LiquidacaoResgate {
  id: string
  cnpj: string;
  razaoSocial: string;
  banco: number;
  agencia: number;
  contaCorrente: number;
  valorResgate: number;
  contaBlockchain: string;
  dataHora: Date;
  hashID: string;
  isLiquidado: boolean;
  comprovante: {
    nome: string,
    hash: string
  };
}

export class PessoaJuridica {
  id: number;
  razaoSocial: string;
  cnpj: string;
  idSubcredito: string;
  salic: string;
  dadosBancarios: {
    banco: number;
    agencia: number;
    contaCorrente: string;
  }
  contaBlockchain: string;
  hashDeclaracao: string;
  status: string;
}

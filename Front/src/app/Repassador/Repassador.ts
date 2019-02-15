export class Repassador {
  id: number;
  cnpj: string;
  dadosCadastrais: {
    cidade: string;
    razaoSocial: string;
    CNAE: string;
  };
  subcreditos: [{
    numero: string;
    nome: string;
    contaBlockchain: string;
    isActive: Boolean;
    papel: String;
  }]
}

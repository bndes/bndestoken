export class Cliente {
  id: number;
  cnpj: string;
  dadosCadastrais: {
    cidade: string;
    razaoSocial: string;
    CNAE: string;
  };
  subcreditos: [{
    numero: number;
    nome: string;
    contaBlockchain: string,
    isActive: Boolean,
		papel: String
  }] 
}

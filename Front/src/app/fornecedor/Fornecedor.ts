export class Fornecedor {
  id: number;
  cnpj: string;
  dadosCadastrais: {
    cidade: string;
    razaoSocial: string;
    CNAE: string;
    email: string;
    telefone: string;
  };
  contasFornecedor: [{
    numero: number;
    nome: string;      
    contaBlockchain: string;
    isActive: boolean;  
  }]
}
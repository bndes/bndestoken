export class Fornecedor {
  id: number;
  cnpj: string;
  cnpjWithMask: string;  
  dadosCadastrais: {
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
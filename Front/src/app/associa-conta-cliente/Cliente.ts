export class Cliente {
  id: number;
  cnpj: string;
  cnpjWithMask: string;  
  dadosCadastrais: {
    razaoSocial: string;
    CNAE: string;
  };
  subcreditos: Subcredito[] 
}

export class Subcredito {
    numero: number;
    nome: string;
    contaBlockchain: string;
    isActive: Boolean;
		papel: String;  
}

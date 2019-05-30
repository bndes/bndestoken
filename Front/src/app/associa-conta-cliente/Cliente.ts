export class Cliente {
  cnpj: string;
  cnpjWithMask: string;  
  dadosCadastrais: {
    razaoSocial: string;
  };
  subcreditos: Subcredito[] 
}

export class Subcredito {
    numero: number;
}

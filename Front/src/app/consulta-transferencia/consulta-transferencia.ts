import { Transferencia } from "../transferencia/Transferencia";

export class ConsultaTransferencia {
  contaBlockchain: string;
  cnpj: string;
  razaoSocial: string;
  subcreditos: string[];

  listaTransferencias: Transferencia[];
}

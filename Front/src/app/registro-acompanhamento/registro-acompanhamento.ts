import { Transferencia } from "../transferencia/Transferencia";

export class RegistroAcompanhamento{
  contaBlockchain: string;
  cnpj: string;
  razaoSocial: string;
  subcreditos: string[];

  listaTransferencias: Transferencia[];
}

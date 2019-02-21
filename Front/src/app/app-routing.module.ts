import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';

/* BNDES */
import { LiberacaoComponent } from './liberacao/liberacao.component';
import { LiquidacaoResgateComponent } from './liquidacao-resgate/liquidacao-resgate.component';
import { BalanceManutencaoComponent } from './balance-manutencao/balance-manutencao.component';
import { ValidacaoCadastroComponent } from './validacao-cadastro/validacao-cadastro.component';

/* Cliente */
import { AssociaContaClienteComponent } from './associa-conta-cliente/associa-conta-cliente.component';
import { RecuperaAcessoClienteComponent } from './recupera-acesso-cliente/recupera-acesso-cliente.component';
import { TransferenciaComponent } from './transferencia/transferencia.component';
import { RegistroAcompanhamentoComponent } from './registro-acompanhamento/registro-acompanhamento.component';

/* Fornecedor */
import { ResgateComponent } from './resgate/resgate.component';
import { AssociaContaFornecedorComponent } from './associa-conta-fornecedor/associa-conta-fornecedor.component';
import { RecuperaAcessoFornecedorComponent } from './recupera-acesso-fornecedor/recupera-acesso-fornecedor.component';

/* Sociedade */
import { DashboardIdEmpresaComponent } from './dashboard-id-empresa/dashboard-id-empresa.component';
import { DashboardTransferenciasComponent } from './dashboard-transferencias/dashboard-transferencias.component';
import { DashboardResgatesLiquidacoesComponent } from './dashboard-resgates-liquidacoes/dashboard-resgates-liquidacoes.component';

import { RegistroSaldoContasComponent } from './registro-saldo-contas/registro-saldo-contas.component'

const routes: Routes = [
  { path: 'bndes/home', component: HomeComponent },
  { path: 'cliente/home', component: HomeComponent },
  { path: 'fornecedor/home', component: HomeComponent },
  { path: 'sociedade/home', component: HomeComponent },
  { path: 'bndes/liberacao', component: LiberacaoComponent },
  { path: 'bndes/val-cadastro', component: ValidacaoCadastroComponent},
  { path: 'bndes/liquidar', component: LiquidacaoResgateComponent},
  { path: 'bndes/balanco', component: BalanceManutencaoComponent},
  { path: 'cliente/transf', component: TransferenciaComponent },
  { path: 'cliente/associa-conta-cliente', component: AssociaContaClienteComponent },
  { path: 'cliente/registro-acompanhamento', component: RegistroAcompanhamentoComponent},
  { path: 'cliente/recupera-acesso-cliente', component: RecuperaAcessoClienteComponent},
  { path: 'cliente/registro-saldo-contas', component: RegistroSaldoContasComponent},
  { path: 'fornecedor/associa-conta-fornecedor', component: AssociaContaFornecedorComponent},
  { path: 'fornecedor/resgate', component: ResgateComponent },
  { path: 'fornecedor/recupera-acesso-fornecedor', component: RecuperaAcessoFornecedorComponent},
  { path: 'fornecedor/registro-saldo-contas', component: RegistroSaldoContasComponent},
  { path: 'sociedade/dash-empresas', component: DashboardIdEmpresaComponent },
  { path: 'sociedade/dash-transf', component: DashboardTransferenciasComponent },
  { path: 'sociedade/dash-resgates', component: DashboardResgatesLiquidacoesComponent},
  { path: '', redirectTo: '/sociedade/home', pathMatch: 'full' },
];


@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}

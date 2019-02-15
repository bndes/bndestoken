import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './/app-routing.module';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { BndesUx4 } from 'bndes-ux4';
import { Ng2GoogleChartsModule } from 'ng2-google-charts';
import { AgmCoreModule } from '@agm/core';

import { OrderModule, OrderPipe } from 'ngx-order-pipe';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgxPaginationModule } from 'ngx-pagination'
import { CurrencyMaskModule } from "ng2-currency-mask";
import { CurrencyMaskConfig, CURRENCY_MASK_CONFIG } from "ng2-currency-mask/src/currency-mask.config";
import { TextMaskModule } from 'angular2-text-mask';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { BlocoAnimadoComponent } from './shared/bloco-animado/bloco-animado.component';

/* BNDES */
import { LiberacaoComponent } from './liberacao/liberacao.component';
import { LiquidacaoResgateComponent } from './liquidacao-resgate/liquidacao-resgate.component';

/* Cliente */
import { AssociaContaClienteComponent } from './associa-conta-cliente/associa-conta-cliente.component';
import { RecuperaAcessoClienteComponent } from './recupera-acesso-cliente/recupera-acesso-cliente.component';

/* Cliente e Repassador */
import { TransferenciaComponent } from './transferencia/transferencia.component';
import { RegistroAcompanhamentoComponent } from './registro-acompanhamento/registro-acompanhamento.component';

/* Repassador */
import { AssociaContaRepassadorComponent } from './associa-conta-repassador/associa-conta-repassador.component';
import { RecuperaAcessoRepassadorComponent } from './recupera-acesso-repassador/recupera-acesso-repassador.component';

/* Fornecedor */
import { ResgateComponent } from './resgate/resgate.component';
import { AssociaContaFornecedorComponent } from './associa-conta-fornecedor/associa-conta-fornecedor.component';
import { RecuperaAcessoFornecedorComponent } from './recupera-acesso-fornecedor/recupera-acesso-fornecedor.component';

/* Sociedade */
import { DashboardIdEmpresaComponent } from './dashboard-id-empresa/dashboard-id-empresa.component';
import { DashboardTransferenciasComponent } from './dashboard-transferencias/dashboard-transferencias.component';
import { DashboardResgatesLiquidacoesComponent } from './dashboard-resgates-liquidacoes/dashboard-resgates-liquidacoes.component';

/* Services */
import { Web3Service } from './Web3Service';
import { PessoaJuridicaService } from './pessoa-juridica.service';
import { ConstantesService } from './ConstantesService';
import { GoogleMapsService } from './shared/google-maps.service';
import { UploadService } from './shared/upload.service';

import { BalanceManutencaoComponent } from './balance-manutencao/balance-manutencao.component';

import { RegistroSaldoContasComponent } from './registro-saldo-contas/registro-saldo-contas.component';
import { MetamsgComponent } from './shared/metamsg/metamsg.component';
import { AssinadorComponent } from './shared/assinador/assinador.component';
import { InputValidationComponent } from './shared/input-validation/input-validation.component';

import { Utils } from './shared/utils';
import { CnpjPipe } from './pipes/cnpj.pipe'
import { registerLocaleData } from '@angular/common';
import localePT from '@angular/common/locales/pt';
import { ExtratoContaComponent } from './registro-saldo-contas/extrato-conta/extrato-conta.component';

import { FileUploadModule } from 'ng2-file-upload';
import { ValidacaoCadastroComponent } from './validacao-cadastro/validacao-cadastro.component'



registerLocaleData(localePT);



const bndesUxConfig = {
  baseUrl: 'coin_spa'
};

export const optionsMaskCurrencyBND: CurrencyMaskConfig = {
  align: "left",
  allowNegative: true,
  decimal: ",",
  precision: 2,
  prefix: "BND ",
  suffix: "",
  thousands: "."
};



@NgModule({
  declarations: [
    AppComponent,
    LiberacaoComponent,
    DashboardIdEmpresaComponent,
    DashboardTransferenciasComponent,
    DashboardResgatesLiquidacoesComponent,
    HomeComponent,
    LiquidacaoResgateComponent,
    TransferenciaComponent,
    AssociaContaClienteComponent,
    RecuperaAcessoClienteComponent,
    RegistroAcompanhamentoComponent,
    ResgateComponent,
    HomeComponent,
    AssociaContaFornecedorComponent,
    RecuperaAcessoFornecedorComponent,
    BlocoAnimadoComponent,
    AssociaContaRepassadorComponent,
    RecuperaAcessoRepassadorComponent,
    BalanceManutencaoComponent,
    RegistroSaldoContasComponent,
    MetamsgComponent,
    AssinadorComponent,
    InputValidationComponent,
    CnpjPipe,
    ExtratoContaComponent,
    ValidacaoCadastroComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    BndesUx4.forRoot(bndesUxConfig),
    Ng2GoogleChartsModule,
    Ng2SearchPipeModule,
    OrderModule,
    NgxPaginationModule,
    CurrencyMaskModule,
    TextMaskModule,
    FileUploadModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyDd4uKzd3YK-8dxfGjGlgpzMASpAd-Ngtg'
    }),
    NgbModule.forRoot()
  ],
  providers: [PessoaJuridicaService, Web3Service, ConstantesService, GoogleMapsService, UploadService,
    { provide: CURRENCY_MASK_CONFIG, useValue: optionsMaskCurrencyBND }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

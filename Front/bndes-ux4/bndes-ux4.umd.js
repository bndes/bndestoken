(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/common'), require('@angular/router'), require('@angular/forms'), require('@ng-bootstrap/ng-bootstrap'), require('rxjs/Subject'), require('@angular/http'), require('rxjs/add/operator/catch'), require('rxjs/add/operator/map'), require('rxjs/add/operator/toPromise'), require('rxjs/add/observable/fromPromise')) :
	typeof define === 'function' && define.amd ? define(['exports', '@angular/core', '@angular/common', '@angular/router', '@angular/forms', '@ng-bootstrap/ng-bootstrap', 'rxjs/Subject', '@angular/http', 'rxjs/add/operator/catch', 'rxjs/add/operator/map', 'rxjs/add/operator/toPromise', 'rxjs/add/observable/fromPromise'], factory) :
	(factory((global['bndes-ux4'] = {}),global.core,global.common,global.router,global.forms,global.ngBootstrap,global.Subject,global.http));
}(this, (function (exports,core,common,router,forms,ngBootstrap,Subject,http) { 'use strict';

var BnAlertsService = (function () {
    function BnAlertsService() {
        this.novoAlerta = new Subject.Subject();
        this.novoAlerta$ = this.novoAlerta.asObservable();
        this.id_ultimo_alerta = 0;
    }
    BnAlertsService.prototype.criarAlerta = function (type, title, message, timeout) {
        this.id_ultimo_alerta += 1;
        var alerta = {
            id: this.id_ultimo_alerta,
            type: type,
            title: title,
            message: message,
            closed: false,
            timeout: timeout,
            removed: false
        };
        this.novoAlerta.next(alerta);
        console.log("criou alerta");
    };
    return BnAlertsService;
}());
BnAlertsService.decorators = [
    { type: core.Injectable },
];
/** @nocollapse */
BnAlertsService.ctorParameters = function () { return []; };

var BnAlertsComponent = (function () {
    function BnAlertsComponent(bnAlertsService) {
        var _this = this;
        this.bnAlertsService = bnAlertsService;
        this.alerts = [];
        bnAlertsService.novoAlerta$.subscribe(function (alerta) {
            console.log("interceptou alerta");
            console.log(alerta);
            if (alerta.timeout) {
                setTimeout(function () { return (alerta.closed = true); }, alerta.timeout * 1000);
                setTimeout(function () { return (_this.removerAlerta(alerta)); }, alerta.timeout * 1000 + 500);
            }
            _this.alerts.push(alerta);
            console.log(_this.alerts);
        });
    }
    BnAlertsComponent.prototype.closeAlert = function (alert) {
        var index = this.alerts.indexOf(alert);
        this.alerts.splice(index, 1);
    };
    BnAlertsComponent.prototype.reset = function () {
        this.alerts = this.backup.map(function (alert) { return Object.assign({}, alert); });
    };
    BnAlertsComponent.prototype.ngOnInit = function () {
    };
    BnAlertsComponent.prototype.removerAlerta = function (alerta) {
        this.alerts.splice(this.alerts.indexOf(alerta), 1);
    };
    return BnAlertsComponent;
}());
BnAlertsComponent.decorators = [
    { type: core.Component, args: [{
                selector: 'app-bn-alerts',
                template: "<!--<div class=\"box-alerta-flutuante alerta-warning\"> <div *ngFor=\"let alert of alerts\" class=\"alerta-flutuante fade\" [class.out]=\"alert.closed\"> <ngb-alert [type]=\"alert.type\" (close)=\"closeAlert(alert)\" *ngIf=\"!alert.removed\">{{ alert.message }}</ngb-alert> </div> </div> --> <div id=\"toast-container\" class=\"toast-top-right\" aria-live=\"polite\" role=\"alert\" > <div class=\"toast toast-{{alert.type}} fade\" style=\"\" *ngFor=\"let alert of alerts\" [class.out]=\"alert.closed\"> <button type=\"button\" class=\"toast-close-button\" role=\"button\" (click)=\"removerAlerta(alert)\">×</button> <div class=\"toast-title\">{{ alert.title }}</div> <div class=\"toast-message\">{{ alert.message }}</div> </div> </div> ",
                styles: [".fade { opacity: 1; -webkit-transition: opacity 0.15s linear; -moz-transition: opacity 0.15s linear; -o-transition: opacity 0.15s linear; transition: opacity 0.15s linear; } .out { opacity: 0; } .toast-title { font-weight: bold; } .toast-message { -ms-word-wrap: break-word; word-wrap: break-word; } .toast-message a, .toast-message label { color: #ffffff; } .toast-message a:hover { color: #cccccc; text-decoration: none; } .toast-close-button { position: relative; right: -0.3em; top: -0.3em; float: right; font-size: 20px; font-weight: bold; color: #ffffff; -webkit-text-shadow: 0 1px 0 #ffffff; text-shadow: 0 1px 0 #ffffff; opacity: 0.8; -ms-filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=80); filter: alpha(opacity=80); } .toast-close-button:hover, .toast-close-button:focus { color: #000000; text-decoration: none; cursor: pointer; opacity: 0.4; -ms-filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=40); filter: alpha(opacity=40); } /*Additional properties for button version iOS requires the button element instead of an anchor tag. If you want the anchor version, it requires `href=\"#\"`.*/ button.toast-close-button { padding: 0; cursor: pointer; background: transparent; border: 0; -webkit-appearance: none; } .toast-top-center { top: 0; right: 0; width: 100%; } .toast-bottom-center { bottom: 0; right: 0; width: 100%; } .toast-top-full-width { top: 0; right: 0; width: 100%; } .toast-bottom-full-width { bottom: 0; right: 0; width: 100%; } .toast-top-left { top: 12px; left: 12px; } .toast-top-right { top: 12px; right: 12px; } .toast-bottom-right { right: 12px; bottom: 12px; } .toast-bottom-left { bottom: 12px; left: 12px; } #toast-container { position: fixed; z-index: 999999; /*overrides*/ } #toast-container * { -moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box; } #toast-container > div { position: relative; overflow: hidden; margin: 0 0 6px; padding: 15px 15px 15px 50px; width: 300px; -moz-border-radius: 3px 3px 3px 3px; -webkit-border-radius: 3px 3px 3px 3px; border-radius: 3px 3px 3px 3px; background-position: 15px center; background-repeat: no-repeat; -moz-box-shadow: 0 0 12px #999999; -webkit-box-shadow: 0 0 12px #999999; box-shadow: 0 0 12px #999999; color: #ffffff; opacity: 0.8; -ms-filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=80); filter: alpha(opacity=80); } #toast-container > :hover { -moz-box-shadow: 0 0 12px #000000; -webkit-box-shadow: 0 0 12px #000000; box-shadow: 0 0 12px #000000; opacity: 1; -ms-filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=100); filter: alpha(opacity=100); cursor: pointer; } #toast-container > .toast-info { background-image: url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAGwSURBVEhLtZa9SgNBEMc9sUxxRcoUKSzSWIhXpFMhhYWFhaBg4yPYiWCXZxBLERsLRS3EQkEfwCKdjWJAwSKCgoKCcudv4O5YLrt7EzgXhiU3/4+b2ckmwVjJSpKkQ6wAi4gwhT+z3wRBcEz0yjSseUTrcRyfsHsXmD0AmbHOC9Ii8VImnuXBPglHpQ5wwSVM7sNnTG7Za4JwDdCjxyAiH3nyA2mtaTJufiDZ5dCaqlItILh1NHatfN5skvjx9Z38m69CgzuXmZgVrPIGE763Jx9qKsRozWYw6xOHdER+nn2KkO+Bb+UV5CBN6WC6QtBgbRVozrahAbmm6HtUsgtPC19tFdxXZYBOfkbmFJ1VaHA1VAHjd0pp70oTZzvR+EVrx2Ygfdsq6eu55BHYR8hlcki+n+kERUFG8BrA0BwjeAv2M8WLQBtcy+SD6fNsmnB3AlBLrgTtVW1c2QN4bVWLATaIS60J2Du5y1TiJgjSBvFVZgTmwCU+dAZFoPxGEEs8nyHC9Bwe2GvEJv2WXZb0vjdyFT4Cxk3e/kIqlOGoVLwwPevpYHT+00T+hWwXDf4AJAOUqWcDhbwAAAAASUVORK5CYII=\") !important; } #toast-container > .toast-error { background-image: url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAHOSURBVEhLrZa/SgNBEMZzh0WKCClSCKaIYOED+AAKeQQLG8HWztLCImBrYadgIdY+gIKNYkBFSwu7CAoqCgkkoGBI/E28PdbLZmeDLgzZzcx83/zZ2SSXC1j9fr+I1Hq93g2yxH4iwM1vkoBWAdxCmpzTxfkN2RcyZNaHFIkSo10+8kgxkXIURV5HGxTmFuc75B2RfQkpxHG8aAgaAFa0tAHqYFfQ7Iwe2yhODk8+J4C7yAoRTWI3w/4klGRgR4lO7Rpn9+gvMyWp+uxFh8+H+ARlgN1nJuJuQAYvNkEnwGFck18Er4q3egEc/oO+mhLdKgRyhdNFiacC0rlOCbhNVz4H9FnAYgDBvU3QIioZlJFLJtsoHYRDfiZoUyIxqCtRpVlANq0EU4dApjrtgezPFad5S19Wgjkc0hNVnuF4HjVA6C7QrSIbylB+oZe3aHgBsqlNqKYH48jXyJKMuAbiyVJ8KzaB3eRc0pg9VwQ4niFryI68qiOi3AbjwdsfnAtk0bCjTLJKr6mrD9g8iq/S/B81hguOMlQTnVyG40wAcjnmgsCNESDrjme7wfftP4P7SP4N3CJZdvzoNyGq2c/HWOXJGsvVg+RA/k2MC/wN6I2YA2Pt8GkAAAAASUVORK5CYII=\") !important; } #toast-container > .toast-success { background-image: url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAADsSURBVEhLY2AYBfQMgf///3P8+/evAIgvA/FsIF+BavYDDWMBGroaSMMBiE8VC7AZDrIFaMFnii3AZTjUgsUUWUDA8OdAH6iQbQEhw4HyGsPEcKBXBIC4ARhex4G4BsjmweU1soIFaGg/WtoFZRIZdEvIMhxkCCjXIVsATV6gFGACs4Rsw0EGgIIH3QJYJgHSARQZDrWAB+jawzgs+Q2UO49D7jnRSRGoEFRILcdmEMWGI0cm0JJ2QpYA1RDvcmzJEWhABhD/pqrL0S0CWuABKgnRki9lLseS7g2AlqwHWQSKH4oKLrILpRGhEQCw2LiRUIa4lwAAAABJRU5ErkJggg==\") !important; } #toast-container > .toast-warning { background-image: url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAGYSURBVEhL5ZSvTsNQFMbXZGICMYGYmJhAQIJAICYQPAACiSDB8AiICQQJT4CqQEwgJvYASAQCiZiYmJhAIBATCARJy+9rTsldd8sKu1M0+dLb057v6/lbq/2rK0mS/TRNj9cWNAKPYIJII7gIxCcQ51cvqID+GIEX8ASG4B1bK5gIZFeQfoJdEXOfgX4QAQg7kH2A65yQ87lyxb27sggkAzAuFhbbg1K2kgCkB1bVwyIR9m2L7PRPIhDUIXgGtyKw575yz3lTNs6X4JXnjV+LKM/m3MydnTbtOKIjtz6VhCBq4vSm3ncdrD2lk0VgUXSVKjVDJXJzijW1RQdsU7F77He8u68koNZTz8Oz5yGa6J3H3lZ0xYgXBK2QymlWWA+RWnYhskLBv2vmE+hBMCtbA7KX5drWyRT/2JsqZ2IvfB9Y4bWDNMFbJRFmC9E74SoS0CqulwjkC0+5bpcV1CZ8NMej4pjy0U+doDQsGyo1hzVJttIjhQ7GnBtRFN1UarUlH8F3xict+HY07rEzoUGPlWcjRFRr4/gChZgc3ZL2d8oAAAAASUVORK5CYII=\") !important; } #toast-container.toast-top-center > div, #toast-container.toast-bottom-center > div { width: 300px; margin: auto; } #toast-container.toast-top-full-width > div, #toast-container.toast-bottom-full-width > div { width: 96%; margin: auto; } .toast { background-color: #030303; } .toast-success { background-color: #51a351; } .toast-error { background-color: #bd362f; } .toast-info { background-color: #2f96b4; } .toast-warning { background-color: #f89406; } .toast-progress { position: absolute; left: 0; bottom: 0; height: 4px; background-color: #000000; opacity: 0.4; -ms-filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=40); filter: alpha(opacity=40); } /*Responsive Design*/ @media all and (max-width: 240px) { #toast-container > div { padding: 8px 8px 8px 50px; width: 11em; } #toast-container .toast-close-button { right: -0.2em; top: -0.2em; } } @media all and (min-width: 241px) and (max-width: 480px) { #toast-container > div { padding: 8px 8px 8px 50px; width: 18em; } #toast-container .toast-close-button { right: -0.2em; top: -0.2em; } } @media all and (min-width: 481px) and (max-width: 768px) { #toast-container > div { padding: 15px 15px 15px 50px; width: 25em; } } "]
            },] },
];
/** @nocollapse */
BnAlertsComponent.ctorParameters = function () { return [
    { type: BnAlertsService, },
]; };

var ServiceDefault = (function () {
    function ServiceDefault(bndesUxConfig, http$$1, router$$1, bnAlertsService /*,protected bnSegurancaService: BnAuthenticationService*/) {
        this.bndesUxConfig = bndesUxConfig;
        this.http = http$$1;
        this.router = router$$1;
        this.bnAlertsService = bnAlertsService; /*,protected bnSegurancaService: BnAuthenticationService*/
        //this.bnAlertsService.criarAlerta(10,"danger","oioioioi",false,5);
        console.log(bndesUxConfig);
    }
    ServiceDefault.prototype.getServiceGenerico = function (urlService, retornarRespostaCompleta) {
        var _this = this;
        var urlCompleta = this.obterUrl() + urlService;
        console.log("Chamando serviço: " + urlCompleta);
        return this.http.get(urlCompleta)
            .toPromise()
            .then(function (response) { return _this.tratarRetornoServico(response, urlCompleta, retornarRespostaCompleta, false); })
            .catch(function (error) { return _this.handleError(error); });
    };
    ServiceDefault.prototype.getServiceGenericoSemRetorno = function (urlService, retornarRespostaCompleta) {
        var _this = this;
        var urlCompleta = this.obterUrl() + urlService;
        console.log("Chamando serviço: " + urlCompleta);
        return this.http.get(urlCompleta)
            .toPromise()
            .then(function (response) { return _this.tratarRetornoServico(response, urlCompleta, retornarRespostaCompleta, true); })
            .catch(function (error) { return _this.handleError(error); });
    };
    ServiceDefault.prototype.tratarRetornoServico = function (resposta, urlCompleta, retornarRespostaCompleta, ignorarResposta) {
        console.log("Resposta do serviço: " + urlCompleta);
        var entity;
        if (ignorarResposta) {
            console.log("Ignorando resposta do serviço");
            return null;
        }
        if (retornarRespostaCompleta)
            entity = resposta.json();
        else
            entity = resposta.json().entity;
        console.log(entity);
        return entity;
    };
    ServiceDefault.prototype.handleError = function (error) {
        console.error('An error occurred', error);
        switch (error.status) {
            case 0:
                this.bnAlertsService.criarAlerta("error", "Erro no Serviço", "Serviço indisponível", 5);
                break;
            case 401:
                this.bnAlertsService.criarAlerta("error", "Falha de Segurança", "Usuário não autenticado", 5);
                this.router.navigate(['login']);
                break;
            case 403:
                this.bnAlertsService.criarAlerta("error", "Falha de Segurança", "Acesso não permitido", 5);
                this.router.navigate(['login']);
                break;
            default:
                this.bnAlertsService.criarAlerta("error", "Erro no Serviço", "Erro: " + error.status + " - " + error.statusText, 5);
                break;
        }
        return Promise.reject(error.message || error);
    };
    ServiceDefault.prototype.obterUrl = function () {
        if (this.bndesUxConfig)
            return this.bndesUxConfig.baseUrl;
        else
            return "";
    };
    ServiceDefault.prototype.postServiceGenerico = function (urlService, urlFull, parametros, header) {
        var _this = this;
        var urlCompleta;
        if (!urlFull)
            urlCompleta = this.obterUrl() + urlService;
        else
            urlCompleta = urlService;
        return this.http.post(urlCompleta, parametros, header).toPromise().then(function (response) {
            return _this.tratarRetornoServico(response, urlCompleta, false, true); //Força o retorno do response para o serviço que o chamou. Se não for feito, o requisitante não receberá nada para tratar
        }).catch(function (error) {
            return _this.handleError(error);
        });
    };
    ServiceDefault.prototype.headers = function (parametros) {
        var headerParams = parametros;
        var headers = new http.Headers(headerParams);
        var opcoes = new http.RequestOptions({ headers: headers });
        return opcoes;
    };
    return ServiceDefault;
}());
ServiceDefault.decorators = [
    { type: core.Injectable },
];
/** @nocollapse */
ServiceDefault.ctorParameters = function () { return [
    { type: undefined, decorators: [{ type: core.Inject, args: ['bndesUxConfig',] },] },
    { type: http.Http, },
    { type: router.Router, },
    { type: BnAlertsService, },
]; };

var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
//import { AuthenticationGuard } from '../../bn-seguranca/authentication.guard';
var BnLoginService = (function (_super) {
    __extends(BnLoginService, _super);
    function BnLoginService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.novoLoginUsuario = new Subject.Subject();
        _this.novoLoginUsuario$ = _this.novoLoginUsuario.asObservable();
        //private loginUrl: string= 'http://web.dsv.bndes.net/n04/rest/public/a03/user/auth';
        //private loginUrl: string= '/public/a03/user/auth';
        _this.loginUrl = '/j_security_check';
        _this.cabecalho = { 'content-type': 'application/x-www-form-urlencoded' };
        return _this;
    }
    /*  constructor(protected http: Http, protected router: Router, private emitSv: EmissaoEventosService, private autorizacao: AutorizarGuard) {
      }*/
    /*
    constructor(protected http: Http, protected bnAlertsService: BnAlertsService, protected guard:AuthenticationGuard) {
      super(http,bnAlertsService,guard);
      }
    */
    BnLoginService.prototype.login = function (cnpj, userName, senha, modal) {
        var _this = this;
        var parametros = new URLSearchParams(); //Preenche os parametros url para a chamada do serviço genérico
        parametros.set('j_cnpj', '');
        parametros.set('j_username', userName);
        parametros.set('j_password', senha);
        return this.postServiceGenerico(this.loginUrl, false, parametros.toString(), this.headers(this.cabecalho)).then(function (resposta) {
            var userLogado = {
                cnpj: cnpj,
                login: userName
            };
            _this.userAutorizado(userLogado);
            _this.novoLoginUsuario.next(userLogado);
            console.log("criou evento de login do usuario");
        }).catch(function (erro) {
            console.log("erro no login do usuario");
            return Promise.reject(erro.message || erro); //Força o retorno do erro para o modal de login. Se não for feito, o modal irá fechar sem a autenticação
        });
    };
    BnLoginService.prototype.userAutorizado = function (data) {
        this.userLogado = data;
        console.log("Usuario Logou");
        console.log(data);
        //this.emitSv.criarEvento(resposta);
        //this.router.navigate(['home']);
        //carrega os dados e autorizações do usuario
    };
    BnLoginService.prototype.getUserInfo = function () {
        var _this = this;
        return this.getServiceGenerico('/rest/a03/user/info', true).then(function (resposta) {
            if (resposta.usuarioValido) {
                _this.userAutorizado(resposta);
                return resposta;
            }
            else {
                throw new Error('Usuario nao logado');
            }
        });
    };
    BnLoginService.prototype.logout = function () {
        return this.getServiceGenericoSemRetorno('/ibm_security_logout', true).then(function (resposta) {
        });
    };
    BnLoginService.prototype.getUser = function () {
        var _this = this;
        if (this.userLogado)
            return Promise.resolve(this.userLogado);
        else
            return this.getUserInfo().then(function (resposta) {
                console.log("Usuario ja logado no Backend");
                _this.novoLoginUsuario.next(resposta);
                return resposta;
            }).catch(function (erro) {
                console.log('SEM USUARIO AUTENTICADO - Abrir tela de login', erro);
            });
    };
    return BnLoginService;
}(ServiceDefault));
BnLoginService.decorators = [
    { type: core.Injectable },
];
/** @nocollapse */
BnLoginService.ctorParameters = function () { return []; };

var BnBoxUsuarioTopoComponent = (function () {
    function BnBoxUsuarioTopoComponent(loginSv, router$$1, bnAlertsService) {
        var _this = this;
        this.loginSv = loginSv;
        this.router = router$$1;
        this.bnAlertsService = bnAlertsService;
        this.usuario = null;
        loginSv.novoLoginUsuario$.subscribe(function (usuario) {
            console.log("box usuario interceptou alerta de login do usuario");
            console.log(usuario);
            _this.usuario = usuario;
        });
    }
    BnBoxUsuarioTopoComponent.prototype.ngOnInit = function () {
    };
    BnBoxUsuarioTopoComponent.prototype.logout = function () {
        var _this = this;
        console.log('clicou em logout');
        this.loginSv.logout().then(function (resposta) {
            _this.bnAlertsService.criarAlerta("info", "Logout", "Usuário realizou logout", 2);
            location.reload();
        });
    };
    return BnBoxUsuarioTopoComponent;
}());
BnBoxUsuarioTopoComponent.decorators = [
    { type: core.Component, args: [{
                selector: 'app-bn-box-usuario-topo',
                template: "   <div> <a [routerLink]=\"[]\"><i class=\"fa fa-user fa-fw hidden-xs\"></i>{{usuario?.login}}</a> <a id=\"link.logout\" href=\"javascript:void(0);\" (click)=\"logout()\" title=\"Desconectar\"> <i class=\"fa fa-sign-out fa-fw\"></i><span class=\"hidden-xs\">Sair</span> </a> </div>",
                styles: [""]
            },] },
];
/** @nocollapse */
BnBoxUsuarioTopoComponent.ctorParameters = function () { return [
    { type: BnLoginService, },
    { type: router.Router, },
    { type: BnAlertsService, },
]; };

var BnCabecalhoComponent = (function () {
    function BnCabecalhoComponent(bnAlertsService, modalService) {
        var _this = this;
        this.bnAlertsService = bnAlertsService;
        this.modalService = modalService;
        // opcoes de customizacao do componente
        this.options = {
            exibeBusca: true,
            exibeVerTodasNotificacoes: true,
            ordemNotificacoesInversa: false,
            logLevelsNotificacoes: {
                'success': true,
                'info': true,
                'warning': true,
                'error': true
            }
        }; // defaults para nao mudar o comportamento padrao
        bnAlertsService.novoAlerta$.subscribe(function (alerta) {
            _this.notificacoesErrosAssincronos.addNotificacao(alerta);
        });
    }
    BnCabecalhoComponent.prototype.open = function (content) {
        var _this = this;
        this.modalService.open(content, { windowClass: 'modal-dialog' }).result.then(function (result) {
            _this.closeResult = "Closed with: " + result;
        }, function (reason) {
            _this.closeResult = "Dismissed " + _this.getDismissReason(reason);
        });
    };
    BnCabecalhoComponent.prototype.getDismissReason = function (reason) {
        if (reason === ngBootstrap.ModalDismissReasons.ESC) {
            return 'by pressing ESC';
        }
        else if (reason === ngBootstrap.ModalDismissReasons.BACKDROP_CLICK) {
            return 'by clicking on a backdrop';
        }
        else {
            return "with: " + reason;
        }
    };
    BnCabecalhoComponent.prototype.ngOnInit = function () {
        this.opcoesNotificacoes = {
            exibeVerTodas: this.options.exibeVerTodasNotificacoes,
            reverse: this.options.ordemNotificacoesInversa,
            logLevels: {
                'success': this.options.logLevelsNotificacoes['success'],
                'info': this.options.logLevelsNotificacoes['info'],
                'warning': this.options.logLevelsNotificacoes['warning'],
                'error': this.options.logLevelsNotificacoes['error']
            }
        };
    };
    return BnCabecalhoComponent;
}());
BnCabecalhoComponent.decorators = [
    { type: core.Component, args: [{
                selector: 'app-bn-cabecalho',
                template: "<nav class=\"navbar navbar-expand-md navbar-light navbar-bndes-brand\"> <a class=\"navbar-brand pl-2\" [routerLink]=\"['']\"> <h1 id=\"nomeEmpresa\" class=\"plc-topo-empresa\" style=\"float:left;display: inline\"></h1> <h2 id=\"tituloPagina\" class=\"plc-topo-titulo\" style=\"float:left;display: inline\" [innerHtml]=\"nomeSistema\"></h2> </a> <app-bn-notificacoes #logErrosAssincronos [tituloNotificacoes]=\"'Log de Mensagens'\" class=\"mobile-adap\" [options]=\"opcoesNotificacoes\"></app-bn-notificacoes> <div class=\"row box-usuario-titulo mobile-adap\"> <app-bn-busca-box-superior *ngIf=\"options.exibeBusca\"></app-bn-busca-box-superior> <app-bn-box-usuario-topo></app-bn-box-usuario-topo> </div> <button class=\"navbar-toggler mobile-btn\" type=\"button\" data-toggle=\"collapse\" data-target=\"#navbarSupportedContent\" aria-controls=\"navbarSupportedContent\" aria-expanded=\"false\" aria-label=\"Toggle navigation\"> <span class=\"navbar-toggler-icon\"></span> </button> </nav> <hr class=\"separador\">",
                styles: ["@media only screen and (max-width: 991px) { .box-usuario-titulo{ display: none; } .mobile-adap{ display: none; } .navbar-bndes-brand{ background: #008e47; } h1.plc-topo-empresa { background: url('data:image/png;base64,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') no-repeat 0 0 ; width: 125px ; height: 40px ; margin: 0px 20px 0px 0 ; } h2.plc-topo-titulo { font-size: 19px; /*color: #DAFEE6;*/ color: #fafafa; } } @media only screen and (min-width: 992px) { /*.bndes-menu{ background: #008e47 url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAA8CAIAAACivN7sAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNS4xIFdpbmRvd3MiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QzMyODE0OTlDOTRGMTFFMkJEMjBBQTIxMTdGQTE0MzQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QzMyODE0OUFDOTRGMTFFMkJEMjBBQTIxMTdGQTE0MzQiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpDMzI4MTQ5N0M5NEYxMUUyQkQyMEFBMjExN0ZBMTQzNCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpDMzI4MTQ5OEM5NEYxMUUyQkQyMEFBMjExN0ZBMTQzNCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PnL+y1AAAAKsSURBVHjazJlZktswDEQhiCK9zVcOkVROMV9TlRvkerniWN4kW0wDpJaZE7SLxSKf/UG30AAkNT/+/W1OSTaf3D+oiDanmM8PfFUG1mxEcczmrVCxX7xFNhLsrKCn5P8glS0V0RoBvi9nZyM665lc4bRRmIW0+z+/5BRX/8RW+oGKqFQHrQqzEUU81queZYlQKqLfHSTCRrTkyPzpDvp8zCmTiOCINadjUTM7GdG6XxWObESX2KwKLzmThmiNzf6x7TKoSPDTzgpbFc9fNCcgs6PPg9NhozAL0erwY7SceYzF51Sk3X/8/OKg2OZ+oCJa9Vxr4sBGSo2Om5oY2cjcdR/N55jXvpeGaJ4yxnS+yz5iLlsqonaXdXEHSTYHXR5sJJiD3OFV4UNkI+p0UxMRAWTEHX3YdLmHxEZCLpqe/OyYF4lpyFqj5fi9SpIQlanoGbGwOIDCZETd4Zv7GuRMMuKONj1zGVYlyYi6nl0+j67wiDUbmWs0aD82x26TM1mI4lYQY+oHOUTMZUtFcKEny+l7KDxhtmxERkK+jObwReE9KvdARdTpuOZMnJiMeI02PQev2YMpTEaCpZ/iIFO4K1sqArs0GKbwzhX2LRVB0snTZZBdhwVmrNlIsAyJCHjNDkodG1GLzeu43rdeRzYyO9p97p7v2EjIk5925xTfTfP5aYh1OjawT53NZctE2vj+W25P2XnLE9TWrVIRtdhM7dJCYs1GtMFVvz5x518G1mzEu+7kFF0ufpE6NhJkKk8ag+WkXSfT8uyRhWjteixCO8x5eeVPQ6yNMFVN4Uaqwlwk5Bv0DGsXlOiINhF6vtYu6PZiI/aa0p7T30a7r8Y/iC0bQY1u/P2+xaZd+6VK0pD6ZEzuT4nB5sVUNMSfjN1fUhIkGh+sych/AQYAf8K+s/uXWv8AAAAASUVORK5CYII=) repeat-x 0 0 !important; background-position: left bottom!important; }*/ .navbar-bndes-brand{ /*background-color: #fafafa;*/ padding-right: 15px!important; } h1.plc-topo-empresa { background: url('data:image/png;base64,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') no-repeat 0 0 ; width: 125px ; height: 40px ; margin: 0px 20px 0px 0 ; } h2.plc-topo-titulo { font-size: 19px; /*color: #DAFEE6;*/ color: #14B060; } .separador{ display: none; } } .navbar-expand-md .navbar-collapse { width: auto; } .navbar-bndes-brand{ padding: 0; padding-top: .5rem!important; } .navbar-brand{ padding-bottom: .0rem; } /*h1.plc-topo-empresa { background: url(../../../../assets/img/bndes-logo.png) no-repeat 0 0 ; width: 125px ; height: 40px ; margin: 0px 20px 0px 0 ; }*/ /*h1.plc-topo-empresa-branco { background: url(../../../../assets/img/bndes-logo-b.png) no-repeat 0 0 ; width: 125px ; height: 40px ; margin: 0px 20px 0px 0 ; }*/ h2.plc-topo-titulo, h3.plc-topo-subtitulo { line-height: 25px !important; font-size: 19px; /*text-shadow: 1px 1px 0 rgba(0,0,0,0.3) !important;*/ /*padding: 0 15px 0 0!important;*/ /*padding-top: 0px !important; margin: 0px 0px 0px 0 !important;*/ } /*h2.plc-topo-titulo { font-size: 19px; /*color: #DAFEE6; color: #14B060; }*/ .mobile-btn{ background: #008e47; border-color: transparent; margin-bottom: 8px; margin-right: 5px; } .separador{ margin-top: 1px; margin-bottom: 0; } .navbar-toggler-icon{ color: #fafafa; } .box-usuario-titulo{ margin-left: auto; margin-right: 2px; height: 26px; }"]
            },] },
];
/** @nocollapse */
BnCabecalhoComponent.ctorParameters = function () { return [
    { type: BnAlertsService, },
    { type: ngBootstrap.NgbModal, },
]; };
BnCabecalhoComponent.propDecorators = {
    'nomeSistema': [{ type: core.Input },],
    'options': [{ type: core.Input },],
    'notificacoesErrosAssincronos': [{ type: core.ViewChild, args: ['logErrosAssincronos',] },],
};

var BnContextMenuComponent = (function () {
    function BnContextMenuComponent() {
        this.onClick = new core.EventEmitter();
    }
    BnContextMenuComponent.prototype.ngOnInit = function () {
    };
    BnContextMenuComponent.prototype.click = function (itemMenu) {
        this.onClick.emit(itemMenu);
    };
    return BnContextMenuComponent;
}());
BnContextMenuComponent.decorators = [
    { type: core.Component, args: [{
                selector: 'app-bn-context-menu',
                template: "<span> <div class=\"btn-group\"> <button type=\"button\" class=\"btn btn-success dropdown-toggle dropdown-toggle-clean\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\"> <i class=\"fa fa-ellipsis-v\"></i> <!--i class=\"fa fa-caret-down\"></i--> </button> <ul class=\"dropdown-menu\"  style=\"position: absolute;margin-left: 0em; \"> <li *ngFor=\"let itemMenu of opcoesMenu\"> <a [routerLink]=\"[]\" *ngIf=\"(itemMenu!='-');else itemNormal\" (click)=\"click(itemMenu)\" [routerLink]=\"['javascript:void(0);']\">{{itemMenu}}</a> </li> </ul> </div> </span> <ng-template #itemNormal><li role=\"separator\" class=\"divider\"></li></ng-template>",
                styles: [".dropdown-toggle-clean::after{ display: none; } .dropdown-toggle-clean{ border-color: transparent; background-color: transparent; margin-left: 5px; } .dropdown-toggle-clean:hover{ background-color: none; } .dropdown-menu{ text-shadow: none !important; /*color:#55606a;*/ padding: 15px; /*font-size: small;*/ clear: both; padding: 3px 20px; white-space: nowrap; border-radius: .1rem; margin: 0 0 0; box-shadow: 0 6px 12px rgba(0,0,0,.175); } .dropdown-menu .divider { height: 1px; margin: 9px 0; overflow: hidden; background-color: #e5e5e5; }"]
            },] },
];
/** @nocollapse */
BnContextMenuComponent.ctorParameters = function () { return []; };
BnContextMenuComponent.propDecorators = {
    'opcoesMenu': [{ type: core.Input },],
    'onClick': [{ type: core.Output, args: ['onClick',] },],
};

var BnLoadingComponent = (function () {
    function BnLoadingComponent() {
    }
    BnLoadingComponent.prototype.ngOnInit = function () {
    };
    return BnLoadingComponent;
}());
BnLoadingComponent.decorators = [
    { type: core.Component, args: [{
                selector: 'app-bn-loading',
                template: "<i class=\"fa fa-spinner fa-spin\"></i> <ng-content></ng-content>	 ",
                styles: [""]
            },] },
];
/** @nocollapse */
BnLoadingComponent.ctorParameters = function () { return []; };

var BuscaMenuService = (function () {
    function BuscaMenuService(http$$1) {
        this.http = http$$1;
        this.menuItens = [];
    }
    BuscaMenuService.prototype.getItems = function (url) {
        var _this = this;
        this.http.get(url).subscribe(function (res) {
            return (_a = _this.menuItens).push.apply(_a, res.json());
            var _a;
        });
        return this.menuItens;
    };
    return BuscaMenuService;
}());
BuscaMenuService.decorators = [
    { type: core.Injectable },
];
/** @nocollapse */
BuscaMenuService.ctorParameters = function () { return [
    { type: http.Http, },
]; };

var $$1;
var MenuPrincipalComponent = (function () {
    function MenuPrincipalComponent(buscaSv, loginSv, bnAlertsService, router$$1) {
        this.buscaSv = buscaSv;
        this.loginSv = loginSv;
        this.bnAlertsService = bnAlertsService;
        this.router = router$$1;
        this.menuItens = [];
        this.menuUrl = 'assets/menu-itens.json';
        this.exibeBusca = true;
        /*loginSv.novoLoginUsuario$.subscribe(resposta => {
            console.log("menu principal interceptou alerta de login do usuario");
            console.log(resposta);
            this.usuario = resposta;
          });*/
    }
    MenuPrincipalComponent.prototype.ngOnInit = function () {
        this.menuItens = this.buscaSv.getItems(this.menuUrl);
    };
    MenuPrincipalComponent.prototype.logout = function () {
        var _this = this;
        console.log('clicou em logout');
        this.loginSv.logout().then(function (resposta) {
            _this.bnAlertsService.criarAlerta("info", "Logout", "Usuário realizou logout", 2);
            location.reload();
        });
    };
    MenuPrincipalComponent.prototype.executarBusca = function () {
        console.log(this.txtBusca);
        console.log("Executar busca '" + this.txtBusca + "'...");
        this.router.navigate(['busca'], { queryParams: { txtBusca: this.txtBusca } });
        this.fecharMenu();
    };
    MenuPrincipalComponent.prototype.fecharMenu = function () {
        console.log("Fechando menu");
        try {
            $$1('.navbar-collapse').collapse('hide');
        }
        catch (e) {
            console.log(e);
        }
    };
    //A função HostListener abaixo ela detecta a rolagem da tela e fixa o menu conforme a condição
    MenuPrincipalComponent.prototype.onWindowScroll = function () {
        var header = document.getElementById("menuPrincipal");
        var logo = document.getElementById("nomeEmpresaMenuFixo");
        if ((window.pageYOffset > 60) && (window.innerWidth > 992)) {
            header.classList.add("menu-fixo-topo");
            logo.style.display = "inherit";
            header.style.top = pageYOffset + "px";
        }
        else {
            header.style.top = "0px";
            header.classList.remove("menu-fixo-topo");
            logo.style.display = "none";
        }
    };
    return MenuPrincipalComponent;
}());
MenuPrincipalComponent.decorators = [
    { type: core.Component, args: [{
                selector: 'app-bn-menu-principal',
                template: "<nav class=\"navbar navbar-expand-md bndes-menu\" id=\"menuPrincipal\"> <div class=\"collapse navbar-collapse\" id=\"navbarSupportedContent\"> <ul class=\"navbar-nav mr-auto nav-item dropdown\"> <li class=\"nav-item\"> <h1 id=\"nomeEmpresaMenuFixo\" class=\"plc-topo-empresa-branco logo-menu-fixo\"></h1> </li> <li class=\"nav-item\" *ngFor=\"let menu of menuItens\"> <!-- ITENS SEM SUBMENU --> <a *ngIf=\"menu.topo && !menu.subitem\" class=\"nav-link item-mobile\" [routerLink]=\"[menu.url]\" (click)=\"fecharMenu()\">{{menu.titulo}}</a> <!-- ITENS COM SUBMENU --> <div *ngIf=\"menu.topo && menu.subitem\" class=\"dropdown\"> <a class=\"nav-link dropdown-toggle item-mobile\" href=\"\" data-toggle=\"dropdown\">{{menu.titulo}}</a> <ul class=\"dropdown-menu ul-mobile\" > <li *ngFor=\"let submenu of menu.subitem\" class=\"nav-item-mobile\" [routerLink]=\"[submenu.url]\" (click)=\"fecharMenu()\"> <a class=\"submenu\" [routerLink]=\"[submenu.url]\">{{submenu.titulo}}</a> <div *ngIf=\"submenu.separador\" class=\"dropdown-divider\"></div> </li> </ul> </div> </li> <li class=\"nav-item\"> <div class=\"nowrap box-usuario-menu\"> <a [routerLink]=\"\" class=\"box-usuario-menu-link\"><i class=\"fa fa-user fa-fw hidden-xs\"></i>{{usuario?.login}}</a> <a [routerLink]=\"\" title=\"Desconectar\"  class=\"box-usuario-menu-link\" (click)=\"logout()\"> <i class=\"fa fa-sign-out fa-fw\"></i><span class=\"hidden-xs\">Sair</span> </a> </div> </li> <li role=\"separator\" class=\"divider\"></li> <li class=\"nav-item\" *ngIf=\"exibeBusca\"> <form class=\"navbar-form navbar-right busca-mobile\" role=\"search\"> <div class=\"input-group\"> <input type=\"text\" class=\"form-control\" name=\"search\" id=\"search\" placeholder=\"Pesquisa\" [(ngModel)]=\"txtBusca\" name=\"txtBusca\"> <button class=\"input-group-addon btn btn-primary btn-busca\" (click)=\"executarBusca()\"><i class=\"fa fa-search\"></i></button> </div> </form> </li> </ul> <!-- <form class=\"form-inline my-2 my-lg-0\"> <input class=\"form-control mr-sm-2\" type=\"text\" placeholder=\"Search\"> <button class=\"btn btn-outline-success my-2 my-sm-0\" type=\"submit\">Search</button> </form> --> </div> </nav>",
                styles: [" @media only screen and (max-width: 991px) { .bndes-menu{ background:#008e47!important; padding: 0!important; } .busca-mobile{ margin: 15px; } .item-mobile{ padding-left: 15px; color: aliceblue; } .submenu{ color: aliceblue; } .ul-mobile{ background: #5fb245; margin-bottom: 10px; padding: 0; } .a{ color: aliceblue; } } @media only screen and (min-width: 992px) { /*.bndes-menu{ background: #008e47 url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAA8CAIAAACivN7sAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNS4xIFdpbmRvd3MiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QzMyODE0OTlDOTRGMTFFMkJEMjBBQTIxMTdGQTE0MzQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QzMyODE0OUFDOTRGMTFFMkJEMjBBQTIxMTdGQTE0MzQiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpDMzI4MTQ5N0M5NEYxMUUyQkQyMEFBMjExN0ZBMTQzNCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpDMzI4MTQ5OEM5NEYxMUUyQkQyMEFBMjExN0ZBMTQzNCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PnL+y1AAAAKsSURBVHjazJlZktswDEQhiCK9zVcOkVROMV9TlRvkerniWN4kW0wDpJaZE7SLxSKf/UG30AAkNT/+/W1OSTaf3D+oiDanmM8PfFUG1mxEcczmrVCxX7xFNhLsrKCn5P8glS0V0RoBvi9nZyM665lc4bRRmIW0+z+/5BRX/8RW+oGKqFQHrQqzEUU81queZYlQKqLfHSTCRrTkyPzpDvp8zCmTiOCINadjUTM7GdG6XxWObESX2KwKLzmThmiNzf6x7TKoSPDTzgpbFc9fNCcgs6PPg9NhozAL0erwY7SceYzF51Sk3X/8/OKg2OZ+oCJa9Vxr4sBGSo2Om5oY2cjcdR/N55jXvpeGaJ4yxnS+yz5iLlsqonaXdXEHSTYHXR5sJJiD3OFV4UNkI+p0UxMRAWTEHX3YdLmHxEZCLpqe/OyYF4lpyFqj5fi9SpIQlanoGbGwOIDCZETd4Zv7GuRMMuKONj1zGVYlyYi6nl0+j67wiDUbmWs0aD82x26TM1mI4lYQY+oHOUTMZUtFcKEny+l7KDxhtmxERkK+jObwReE9KvdARdTpuOZMnJiMeI02PQev2YMpTEaCpZ/iIFO4K1sqArs0GKbwzhX2LRVB0snTZZBdhwVmrNlIsAyJCHjNDkodG1GLzeu43rdeRzYyO9p97p7v2EjIk5925xTfTfP5aYh1OjawT53NZctE2vj+W25P2XnLE9TWrVIRtdhM7dJCYs1GtMFVvz5x518G1mzEu+7kFF0ufpE6NhJkKk8ag+WkXSfT8uyRhWjteixCO8x5eeVPQ6yNMFVN4Uaqwlwk5Bv0DGsXlOiINhF6vtYu6PZiI/aa0p7T30a7r8Y/iC0bQY1u/P2+xaZd+6VK0pD6ZEzuT4nB5sVUNMSfjN1fUhIkGh+sych/AQYAf8K+s/uXWv8AAAAASUVORK5CYII=) repeat-x 0 0 !important; background-position: left bottom!important; }*/ .bndes-menu{ /*background: #00b75c !important; background-position: left bottom!important; background: -webkit-linear-gradient(red, #016b36 )!important; background: -o-linear-gradient(red, #016b36 )!important; background: -moz-linear-gradient(red, #016b36 )!important; background: linear-gradient(#00b75c, #016b36 )!important;*/ background: #008e47 !important; } .box-usuario-menu{ display: none; } .menu-fixo-topo{ position: absolute; width: 100%; z-index:1000; } .busca-mobile{ display: none; } .divider{ display: none; } } .bndes-menu{ /*text-shadow: .1rem .1rem .1rem rgba(0,0,0,0.3) !important;*/ color:#ffffff; font-size: 14px; } .bndes-menu .nav-link{ color:aliceblue; padding-top: 10px!important; padding-bottom: 10px!important; } .bndes-menu .nav-link:hover{ background: #008e99; color:#ffffff; } h1.plc-topo-empresa { background: url('data:image/png;base64,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') no-repeat 0 0 ; width: 125px ; height: 40px ; margin: 0px 20px 0px 0 ; } h1.plc-topo-empresa-branco { background: url('data:image/png;base64,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') no-repeat 0 0 ; width: 125px ; height: 40px ; margin: 0px 20px 0px 0 ; } .logo-menu-fixo{ display: none; margin: 10px 5px 0px 0!important; background-size: 98.4px 18.4px!important; width: 100px!important; height: 20px!important; } .dropdown-menu{ text-shadow: none !important; padding-bottom: 8px; padding-top: 8px; padding-left: 0; padding-right: 0; /*color:#55606a;*/ /*padding: 15px;*/ /*font-size: small;*/ clear: both; /*padding: 3px 20px;*/ white-space: nowrap; border-radius: .1rem; margin: 0 0 0; box-shadow: 0 6px 12px rgba(0,0,0,.175); } .dropdown-menu .divider { height: 1px; margin-top: 5px; margin-bottom: 5px; overflow: hidden; background-color: #e5e5e5; } .box-usuario-menu-link{ color:#ffffff!important; } .box-usuario-menu{ float: right; margin-top: 15px; margin-bottom: 5px; margin-right: 15px; } .form-control{ float: left; } .btn-busca{ float: right; justify-content: center; } .divider{ height: 1px; width: 100%; margin: 3px 0; overflow: hidden; background-color: #e5e5e5; margin-top: 10px; } .input-group-addon{ width: 60px; align-items: center; } .li{ margin-top: 5px; } .submenu{ padding-left: 25px; } .navbar-expand-md .navbar-collapse { width: auto; } .navbar{ padding: .05rem 1rem 0rem; box-shadow: 1px 1px 1px #888888; }"],
                providers: [BuscaMenuService]
            },] },
];
/** @nocollapse */
MenuPrincipalComponent.ctorParameters = function () { return [
    { type: BuscaMenuService, },
    { type: BnLoginService, },
    { type: BnAlertsService, },
    { type: router.Router, },
]; };
MenuPrincipalComponent.propDecorators = {
    'menuUrl': [{ type: core.Input },],
    'exibeBusca': [{ type: core.Input },],
    'onWindowScroll': [{ type: core.HostListener, args: ["window:scroll", [],] },],
};

var BnMenuPrincipalModule = (function () {
    function BnMenuPrincipalModule() {
    }
    return BnMenuPrincipalModule;
}());
BnMenuPrincipalModule.decorators = [
    { type: core.NgModule, args: [{
                imports: [
                    common.CommonModule,
                    router.RouterModule,
                    forms.FormsModule,
                    forms.ReactiveFormsModule,
                    http.HttpModule
                ],
                declarations: [
                    MenuPrincipalComponent
                ],
                providers: [
                    BuscaMenuService
                ],
                exports: [
                    MenuPrincipalComponent
                ]
            },] },
];
/** @nocollapse */
BnMenuPrincipalModule.ctorParameters = function () { return []; };

var BnNotificacoesComponent = (function () {
    function BnNotificacoesComponent() {
        this.icone = "fa-tasks"; //fa-tasks, fa-envelope-o, fa-bell-o
        this.tituloNotificacoes = "Notificações";
        this.tipo = "important"; // success, important, warning
        this.cor = "red"; //green, red, yellow
        // opcoes de customizacao do componente
        // se usar, precisa preencher tudo
        this.options = {
            exibeVerTodas: true,
            reverse: false,
            logLevels: {
                'success': true,
                'info': true,
                'warning': true,
                'error': true
            }
        }; // defaults para nao mudar o comportamento padrao
        this.notificacoes = [];
        this.novasNotificacoes = 0;
    }
    BnNotificacoesComponent.prototype.ngOnInit = function () {
    };
    BnNotificacoesComponent.prototype.addNotificacao = function (notificacao) {
        if (this.options.logLevels[notificacao.type]) {
            notificacao.dateTime = Date.now();
            if (this.options.reverse) {
                this.notificacoes.unshift(notificacao);
            }
            else {
                this.notificacoes.push(notificacao);
            }
            this.novasNotificacoes += 1;
        }
    };
    return BnNotificacoesComponent;
}());
BnNotificacoesComponent.decorators = [
    { type: core.Component, args: [{
                selector: 'app-bn-notificacoes',
                template: "<div class=\"nav notify-row\" id=\"top_menu\"> <!--  notification start --> <ul class=\"nav top-menu\"> <li class=\"dropdown\"> <a data-toggle=\"dropdown\" class=\"dropdown-toggle dropdown-notificacao\" [routerLink]=\"[]\" aria-expanded=\"false\" (click)=\"novasNotificacoes=0;\" [class.sem-notificacoes-novas]=\"novasNotificacoes==0\" [class.com-notificacoes-novas]=\"novasNotificacoes>0\"> <i class=\"fa {{icone}}\"></i> <span class=\"badge bg-{{tipo}}\" *ngIf=\"novasNotificacoes>0\">{{novasNotificacoes}}</span> </a> <ul class=\"dropdown-menu extended tasks-bar\"> <div class=\"notify-arrow notify-arrow-{{cor}}\"></div> <li> <p class=\"{{cor}}\">{{tituloNotificacoes}}</p> </li> <li *ngFor=\"let notificacao of notificacoes\" class=\"dropdown-notificacao-item\"> <a [routerLink]=\"[]\"> <span [ngSwitch]=\"notificacao.type\"> <span *ngSwitchCase=\"'success'\"> <i class=\"fa fa-check-circle\"></i> </span> <span *ngSwitchCase=\"'info'\"> <i class=\"fa fa-info-circle\"></i> </span> <span *ngSwitchCase=\"'warning'\"> <i class=\"fa fa-exclamation-triangle\"></i> </span> <span *ngSwitchCase=\"'error'\"> <i class=\"fa fa-bug\"></i> </span> </span> <span class=\"subject\"> <span class=\"from\">{{notificacao.title}}</span> <span class=\"time\">{{notificacao.dateTime| date: 'HH:mm:ss'}}</span> </span><br> <span class=\"message\"> {{notificacao.message}} </span> </a> </li> <li class=\"external\" *ngIf=\"options.exibeVerTodas\"> <a [routerLink]=\"[]\">Ver todas as notificações</a> </li> </ul> </li> <!-- <li class=\"dropdown\"> <a data-toggle=\"dropdown\" class=\"dropdown-toggle dropdown-notificacao\" href=\"#\" aria-expanded=\"false\"> <i class=\"fa fa-tasks\"></i> <span class=\"badge bg-success\">5</span> </a> <ul class=\"dropdown-menu extended tasks-bar\"> <div class=\"notify-arrow notify-arrow-green\"></div> <li> <p class=\"green\">Tarefas Pendentes</p> </li> <li> <a href=\"#\"> <div class=\"task-info\"> <div class=\"desc\">Dashboard v1.3</div> <div class=\"percent\">40%</div> </div> <div class=\"progress progress-striped\"> <div class=\"progress-bar progress-bar-success\" role=\"progressbar\" aria-valuenow=\"40\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 40%\"> <span class=\"sr-only\">40% Complete (success)</span> </div> </div> </a> </li> <li> <a href=\"#\"> <div class=\"task-info\"> <div class=\"desc\">Database Update</div> <div class=\"percent\">60%</div> </div> <div class=\"progress progress-striped\"> <div class=\"progress-bar progress-bar-warning\" role=\"progressbar\" aria-valuenow=\"60\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 60%\"> <span class=\"sr-only\">60% Complete (warning)</span> </div> </div> </a> </li> <li> <a href=\"#\"> <div class=\"task-info\"> <div class=\"desc\">Iphone Development</div> <div class=\"percent\">87%</div> </div> <div class=\"progress progress-striped\"> <div class=\"progress-bar progress-bar-info\" role=\"progressbar\" aria-valuenow=\"20\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 87%\"> <span class=\"sr-only\">87% Complete</span> </div> </div> </a> </li> <li> <a href=\"#\"> <div class=\"task-info\"> <div class=\"desc\">Mobile App</div> <div class=\"percent\">33%</div> </div> <div class=\"progress progress-striped\"> <div class=\"progress-bar progress-bar-danger\" role=\"progressbar\" aria-valuenow=\"80\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 33%\"> <span class=\"sr-only\">33% Complete (danger)</span> </div> </div> </a> </li> <li> <a href=\"#\"> <div class=\"task-info\"> <div class=\"desc\">Dashboard v1.3</div> <div class=\"percent\">45%</div> </div> <div class=\"progress progress-striped active\"> <div class=\"progress-bar\" role=\"progressbar\" aria-valuenow=\"45\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 45%\"> <span class=\"sr-only\">45% Complete</span> </div> </div> </a> </li> <li class=\"external\"> <a href=\"#\">Ver todas as tarefas</a> </li> </ul> </li> <li id=\"header_inbox_bar\" class=\"dropdown\"> <a data-toggle=\"dropdown\" class=\"dropdown-toggle dropdown-notificacao\" href=\"#\" aria-expanded=\"false\"> <i class=\"fa fa-envelope-o\"></i> <span class=\"badge bg-important\">1</span> </a> <ul class=\"dropdown-menu extended inbox\"> <div class=\"notify-arrow notify-arrow-red\"></div> <li> <p class=\"red\">Você tem 1 mensagem</p> </li> <li> <a href=\"#\"> <span class=\"message\"> Hello, this is an example msg. </span> </a> </li> <li> <a href=\"#\">See all messages</a> </li> </ul> </li> <li id=\"header_notification_bar\" class=\"dropdown\"> <a data-toggle=\"dropdown\" class=\"dropdown-toggle dropdown-notificacao\" href=\"#\" aria-expanded=\"false\"> <i class=\"fa fa-bell-o\"></i> <span class=\"badge bg-warning\">7</span> </a> <ul class=\"dropdown-menu extended notification\"> <div class=\"notify-arrow notify-arrow-yellow\"></div> <li> <p class=\"yellow\">Você tem 7 notificações</p> </li> <li> <a href=\"#\"> <span class=\"label label-danger\"><i class=\"fa fa-bolt\"></i></span> Server #3 overloaded. <span class=\"small italic\">34 mins</span> </a> </li> <li> <a href=\"#\"> <span class=\"label label-warning\"><i class=\"fa fa-bell\"></i></span> Server #10 not respoding. <span class=\"small italic\">1 Hours</span> </a> </li> <li> <a href=\"#\"> <span class=\"label label-danger\"><i class=\"fa fa-bolt\"></i></span> Database overloaded 24%. <span class=\"small italic\">4 hrs</span> </a> </li> <li> <a href=\"#\"> <span class=\"label label-success\"><i class=\"fa fa-plus\"></i></span> New user registered. <span class=\"small italic\">Just now</span> </a> </li> <li> <a href=\"#\"> <span class=\"label label-info\"><i class=\"fa fa-bullhorn\"></i></span> Application error. <span class=\"small italic\">10 mins</span> </a> </li> <li> <a href=\"#\">See all notifications</a> </li> </ul> </li> --> </ul> </div>",
                styles: [".notify-row .badge { position: absolute; right: 5px; top: -10px; z-index: 100; list-style-type: none; } ul.top-menu > li > a:hover, ul.top-menu > li > a:focus { border: 1px solid #f0f0f8 !important; background-color: #fff!important; border-color: #f0f0f8 !important; text-decoration: none; border-radius: 4px; -webkit-border-radius: 4px; color: #2E2E2E !important; } .fa { display: inline-block; font-family: FontAwesome; font-style: normal; font-weight: normal; line-height: 1; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; } ul.top-menu > li > a { color: #666666; font-size: 16px; border-radius: 4px; -webkit-border-radius: 4px; border: 1px solid #f0f0f8 !important; padding: 2px 6px; margin-right: 15px; } .dropdown-menu::before, .dropdown-menu::after { border: none !important; content: none !important; } .dropdown-notificacao::after { content: none; } .dropdown-notificacao-item{ white-space: normal; } .notify-arrow-yellow { border-color: transparent transparent #FCB322; border-bottom-color: #FCB322 !important; border-top-color: #FCB322 !important; } .notify-arrow-red { border-color: transparent transparent #ff6c60; border-bottom-color: #ff6c60 !important; border-top-color: #ff6c60 !important; } .notify-arrow-green { border-color: transparent transparent #a9d86e; border-bottom-color: #a9d86e !important; border-top-color: #a9d86e !important; } .notify-arrow { border-style: solid; border-width: 0 9px 9px; height: 0; margin-top: 0; opacity: 0; position: absolute; left: 7px; top: -18px; transition: all 0.25s ease 0s; width: 0; z-index: 10; margin-top: 10px; opacity: 1; } .dropdown-menu.extended li a { padding: 15px 10px !important; width: 100%; display: inline-block; } .dropdown-menu.extended li a { border-bottom: 1px solid #EBEBEB !important; font-size: 12px; list-style: none; } .dropdown-menu.extended li p.red { background-color: #ff6c60; color: #fff; } .dropdown-menu.extended li p { background-color: #F1F2F7; color: #666666; margin: 0; padding: 10px; border-radius: 4px 4px 0px 0px; -webkit-border-radius: 4px 4px 0px 0px; } .dropdown-menu.extended li p.green { background-color: #a9d86e; color: #fff; } .dropdown-menu.extended li p.red { background-color: #ff6c60; color: #fff; } @media screen and (-webkit-min-device-pixel-ratio: 0){ .dropdown-menu.extended { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.176) !important; } } .dropdown-menu.extended { max-width: 300px !important; min-width: 160px !important; top: 42px; width: 235px !important; padding: 0; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.176) !important; border: none !important; border-radius: 4px; -webkit-border-radius: 4px; } .dropdown-menu.extended li p.yellow { background-color: #fcb322; color: #fff; } .dropdown-menu.extended .progress { margin-bottom: 0 !important; height: 10px; } .progress { box-shadow: none; background: #f0f2f7; } .badge.bg-important { background: #ff6c60; } .sem-notificacoes-novas{ color: #f0f0f8 !important; } .com-notificacoes-novas{ color: #666666 !important; } .dropdown-menu.inbox li a .subject .time { font-size: 11px; font-style: italic; font-weight: bold; position: absolute!important; right: 5px; } .dropdown-menu.inbox li a .subject { display: block; } .dropdown-menu.inbox li a .message { display: block !important; font-size: 11px; } .badge{ color: #f0f0f8 !important; }"]
            },] },
];
/** @nocollapse */
BnNotificacoesComponent.ctorParameters = function () { return []; };
BnNotificacoesComponent.propDecorators = {
    'icone': [{ type: core.Input },],
    'tituloNotificacoes': [{ type: core.Input },],
    'tipo': [{ type: core.Input },],
    'cor': [{ type: core.Input },],
    'options': [{ type: core.Input },],
};

var BnSlidingWindowComponent = (function () {
    function BnSlidingWindowComponent() {
        this.lado = "esquerdo";
        this.titulo = "Sem Titulo";
    }
    BnSlidingWindowComponent.prototype.ngAfterViewInit = function () {
        this.modal = $('#myModal');
    };
    BnSlidingWindowComponent.prototype.ngOnInit = function () {
    };
    BnSlidingWindowComponent.prototype.abrirPopup = function () {
        this.modal.modal('show');
    };
    return BnSlidingWindowComponent;
}());
BnSlidingWindowComponent.decorators = [
    { type: core.Component, args: [{
                selector: 'app-bn-sliding-window',
                template: "<div class=\"modal fade\" [class.left]=\"lado=='esquerdo'\"  [class.right]=\"lado=='direito'\" id=\"myModal\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\"> <div class=\"modal-dialog\" role=\"document\"> <div class=\"modal-content\"> <div class=\"modal-header\"> <button type=\"button\" class=\"close fechar-esquerda\" data-dismiss=\"modal\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button> <h4 class=\"modal-title\" id=\"myModalLabel\">{{titulo}}</h4> </div> <div class=\"modal-body\"> <p> <ng-content></ng-content> </p> </div> </div> </div> </div> ",
                styles: [" /******************************* * MODAL AS LEFT/RIGHT SIDEBAR * Add \"left\" or \"right\" in modal parent div, after class=\"modal\". * Get free snippets on bootpen.com *******************************/ .modal.left .modal-dialog, .modal.right .modal-dialog { position: fixed; margin: auto; width: 320px; height: 100%; -webkit-transform: translate3d(0%, 0, 0); -ms-transform: translate3d(0%, 0, 0); -o-transform: translate3d(0%, 0, 0); transform: translate3d(0%, 0, 0); } .modal.left .modal-content, .modal.right .modal-content { height: 100%; overflow-y: auto; } .modal.left .modal-body, .modal.right .modal-body { padding: 15px 15px 80px; } /*Left*/ .modal.left.fade .modal-dialog{ left: -320px; -webkit-transition: opacity 0.3s linear, left 0.3s ease-out; -moz-transition: opacity 0.3s linear, left 0.3s ease-out; -o-transition: opacity 0.3s linear, left 0.3s ease-out; transition: opacity 0.3s linear, left 0.3s ease-out; } .modal.left.fade.show .modal-dialog{ left: 0; } /*Right*/ .modal.right.fade .modal-dialog { right: -320px; -webkit-transition: opacity 0.3s linear, right 0.3s ease-out; -moz-transition: opacity 0.3s linear, right 0.3s ease-out; -o-transition: opacity 0.3s linear, right 0.3s ease-out; transition: opacity 0.3s linear, right 0.3s ease-out; } .modal.right.fade.show .modal-dialog { right: 0; } /* ----- MODAL STYLE ----- */ .modal-content { border-radius: 0; border: none; } .modal-header { border-bottom-color: #EEEEEE; background-color: #FAFAFA; justify-content: left; align-items: center; } /* ----- v CAN BE DELETED v ----- */ body { background-color: #78909C; } .demo { padding-top: 60px; padding-bottom: 110px; } .btn-demo { margin: 15px; padding: 10px 15px; border-radius: 0; font-size: 16px; background-color: #FFFFFF; } .btn-demo:focus { outline: 0; } .demo-footer { position: fixed; bottom: 0; width: 100%; padding: 15px; background-color: #212121; text-align: center; } .demo-footer > a { text-decoration: none; font-weight: bold; font-size: 16px; color: #fff; } .fechar-esquerda{ margin: -15px -10px -15px 0; padding-left: 0; }"]
            },] },
];
/** @nocollapse */
BnSlidingWindowComponent.ctorParameters = function () { return []; };
BnSlidingWindowComponent.propDecorators = {
    'lado': [{ type: core.Input },],
    'titulo': [{ type: core.Input },],
};

var BnBuscaBoxSuperiorComponent = (function () {
    function BnBuscaBoxSuperiorComponent(router$$1) {
        this.router = router$$1;
    }
    BnBuscaBoxSuperiorComponent.prototype.ngOnInit = function () {
    };
    BnBuscaBoxSuperiorComponent.prototype.executarBusca = function () {
        console.log("Executar busca '" + this.txtBusca + "'...");
        this.router.navigate(['/busca'], { queryParams: { txtBusca: this.txtBusca } });
    };
    return BnBuscaBoxSuperiorComponent;
}());
BnBuscaBoxSuperiorComponent.decorators = [
    { type: core.Component, args: [{
                selector: 'app-bn-busca-box-superior',
                template: "<div class=\"search-form\" on-mouseover=\"busca.focus();\"> <div class=\"form-group has-feedback\"> <label for=\"Pesquisa\" class=\"sr-only\">Pesquisa</label> <input #busca type=\"text\" class=\"form-control\" name=\"search\" id=\"search\" placeholder=\"Pesquisa\" (keyup.enter)=\"executarBusca()\" [(ngModel)]=\"txtBusca\"> <span class=\"fa fa-search  form-control-feedback\" ></span> </div> </div>",
                styles: [".search-form .form-group { float: right !important; transition: all 0.35s, border-radius 0s; width: 32px; height: 29px; } .search-form .form-group input.form-control { padding-right: 20px; padding-bottom: 6px; height: 28px; border: 0 none; background: transparent; box-shadow: none; display:block; } .search-form .form-group input.form-control::-webkit-input-placeholder { display: none; } .search-form .form-group input.form-control:-moz-placeholder { /* Firefox 18- */ display: none; } .search-form .form-group input.form-control::-moz-placeholder { /* Firefox 19+ */ display: none; } .search-form .form-group input.form-control:-ms-input-placeholder { display: none; } .search-form .form-group:hover, .search-form .form-group.hover { width: 100%; border-radius: 4px 25px 25px 4px; background-color: #fff; box-shadow: 0 1px 1px rgba(0, 0, 0, 0.075) inset; border-radius: 25px; border: 1px solid #ccc; } .search-form .form-group span.form-control-feedback { position: absolute; top: 3px; /*right: -2px;*/ z-index: 2; display: block; width: 34px; height: 34px; line-height: 34px; text-align: center; color: #3596e0; left: initial; font-size: 14px; padding-top: 10px; } .form-group:hover .form-control-feedback { visibility:  hidden; } .navbar-toggler-right{ float: right; margin: 0; }"]
            },] },
];
/** @nocollapse */
BnBuscaBoxSuperiorComponent.ctorParameters = function () { return [
    { type: router.Router, },
]; };

var BnAuthenticationService = (function () {
    //state: RouterStateSnapshot;
    function BnAuthenticationService(router$$1, loginSv) {
        //this.state = router.routerState.snapshot;
        this.router = router$$1;
        this.loginSv = loginSv;
    }
    BnAuthenticationService.prototype.validaLogin = function (state) {
        var _this = this;
        return this.loginSv.getUser().then(function (retorno) {
            if (retorno)
                return true;
            else
                _this.router.navigate(['login'], { queryParams: { returnUrl: state.url } });
        });
    };
    return BnAuthenticationService;
}());
BnAuthenticationService.decorators = [
    { type: core.Injectable },
];
/** @nocollapse */
BnAuthenticationService.ctorParameters = function () { return [
    { type: router.Router, },
    { type: BnLoginService, },
]; };

var AuthenticationGuard = (function () {
    /*private user: UserLogado;*/
    function AuthenticationGuard(segurancaService) {
        this.segurancaService = segurancaService;
    }
    AuthenticationGuard.prototype.canActivate = function (next, state) {
        console.log("URL do CanActivate: " + state.url);
        return this.segurancaService.validaLogin(state);
    };
    return AuthenticationGuard;
}());
AuthenticationGuard.decorators = [
    { type: core.Injectable },
];
/** @nocollapse */
AuthenticationGuard.ctorParameters = function () { return [
    { type: BnAuthenticationService, },
]; };

//Início do componente do modal de login(já aberto)
var BnTelaLogin = (function () {
    function BnTelaLogin(modalAtivo, route, router$$1, loginSv) {
        this.modalAtivo = modalAtivo;
        this.route = route;
        this.router = router$$1;
        this.loginSv = loginSv;
        this.carregando = false;
    }
    BnTelaLogin.prototype.ngOnInit = function () {
        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        console.log(this.returnUrl);
    };
    BnTelaLogin.prototype.executaLogin = function (event) {
        var _this = this;
        //event.preventDefault();
        this.carregando = true;
        this.loginSv.login(this.log_cnpj, this.log_userName, this.log_senha, this.modalAtivo).then(function () {
            /*this.router.navigate(['home']);*/
            _this.router.navigateByUrl(_this.returnUrl);
            _this.fecharModal();
        }).catch(function (erro) {
            console.log('Erro ao Logar');
            _this.carregando = false;
        });
    };
    BnTelaLogin.prototype.fecharModal = function () {
        this.modalAtivo.close();
    };
    return BnTelaLogin;
}());
BnTelaLogin.decorators = [
    { type: core.Component, args: [{
                selector: 'bn-tela-login',
                template: "<div class=\"modal-body\"> <form (submit)=\"executaLogin($event)\"> <!--img ng-if=\"loginCtrl.possuiLogo()\" ng-src=\"{{loginCtrl.exibirLogo()}}\" class=\"img-responsive img-bndes\" alt=\"\"/--> <div class=\"row form-group\"> <!--div class=\"margin-bottom-xs col-xs-offset-3 col-xs-6\"--> <div class=\"margin-bottom-xs text-center\"> <h5>Informe os dados de acesso:</h5> </div> </div> <!-- CNPJ --> <div class=\"row form-group\" *ngIf=\"solicitarCnpj\"> <div class=\"input-group margin-bottom-xs col-xs-offset-3 col-xs-6\"> <span class=\"input-group-addon\"><label for=\"txt.CNPJ\"><i class=\"fa fa-building fa-fw\"></i></label></span> <input type=\"text\" name=\"log_cnpj\" id=\"txt.CNPJ\" class=\"form-control margin-bottom\" placeholder=\"CNPJ\" [(ngModel)]=\"log_cnpj\" maxlength=\"18\" aria-required=\"true\"> </div> </div> <!-- USUARIO --> <div class=\"row form-group\"> <div class=\"input-group margin-bottom-xs col-xs-offset-3 col-xs-6\"> <span class=\"input-group-addon\"><label for=\"txt.userName\"><i class=\"fa fa-user fa-fw\"></i></label></span> <input type=\"text\" name=\"log_userName\" id=\"txt.userName\" class=\"form-control margin-bottom\" placeholder=\"Usuário\" [(ngModel)]=\"log_userName\" maxlength=\"20\" aria-required=\"true\"> </div> </div> <!-- SENHA --> <div class=\"row form-group\"> <div class=\"input-group margin-bottom-xs col-xs-offset-3 col-xs-6\"> <span class=\"input-group-addon\"><label for=\"txt.senha\"><i class=\"fa fa-key fa-fw\"></i></label></span> <input type=\"password\" name=\"log_senha\" id=\"txt.senha\" class=\"form-control margin-bottom\" placeholder=\"Senha\" [(ngModel)]=\"log_senha\" maxlength=\"20\" aria-required=\"true\"> </div> </div> <!--BOTÃO --> <div class=\"row form-group\"> <div class=\"input-group margin-bottom-xs col-xs-offset-3 col-xs-6\"> <button class=\"btn btn-lg btn-primary btn-block\" type=\"submit\" aria-disabled=\"false\" [disabled]=\"carregando\"> <i class=\"fa fa-sign-in fa-fw\"></i>Acessar <app-bn-loading [hidden]=\"!carregando\"></app-bn-loading> </button> </div> </div> <!--LINK DO SITE DO BNDES--> <div class=\"row\"> <div class=\"form-link margin-bottom-xs col-xs-offset-3 col-xs-6\"><a target=\"_blank\" href=\"http://www.bndes.gov.br\">www.bndes.gov.br</a></div> <!-- comentado enquanto nao tiver pra onde apontar... <div class=\"form-link margin-bottom-xs col-xs-offset-3 col-xs-6\"><a target=\"_blank\" href=\"#\">Esqueci minha senha</a></div> <div class=\"form-link margin-bottom-xs col-xs-offset-3 col-xs-6\"><a target=\"_blank\" href=\"#\">Não tenho cadastro</a></div> --> </div> </form> </div>",
                styles: [".img-bndes { padding: 0px 20px; } .form-link { text-align: center; font-size: smaller; } .form-link a { color: #005782; } .row { justify-content: center; } .btn-primary { color: #fff; background-color: #337ab7; border-color: #2e6da4; } "],
            },] },
];
/** @nocollapse */
BnTelaLogin.ctorParameters = function () { return [
    { type: ngBootstrap.NgbActiveModal, },
    { type: router.ActivatedRoute, },
    { type: router.Router, },
    { type: BnLoginService, },
]; };
//Fim do modal de login
//Início do componente do abridor do modal de login(ele é chamado para criar o modal de login)
var BnTelaLoginComponent = (function () {
    function BnTelaLoginComponent(modalSv, route) {
        this.modalSv = modalSv;
        this.route = route;
        this.abrirModal();
    }
    BnTelaLoginComponent.prototype.abrirModal = function () {
        var modal = this.modalSv.open(BnTelaLogin, { backdrop: "static", keyboard: false, size: "sm", windowClass: 'login-modal' });
        console.log(this.route.snapshot.data[0]['solicitarCnpj']);
        modal.componentInstance.solicitarCnpj = this.route.snapshot.data[0]['solicitarCnpj'];
    };
    return BnTelaLoginComponent;
}());
BnTelaLoginComponent.decorators = [
    { type: core.Component, args: [{
                template: '',
                encapsulation: core.ViewEncapsulation.None,
                styles: ["\n    .login-modal .modal-dialog  {\n        max-width: 400px;\n    }\n\n    .login-modal .modal-body{\n        margin-top: 20px;\n        margin-bottom: 20px;\n        margin-left: 50px;\n        margin-right: 50px;\n    }\n\n    .login-modal .modal-content{\n        align-items: center\n    }\n  "]
            },] },
];
/** @nocollapse */
BnTelaLoginComponent.ctorParameters = function () { return [
    { type: ngBootstrap.NgbModal, },
    { type: router.ActivatedRoute, },
]; };

//export * from './bn-regulamento-menu-esquerdo/bn-regulamento-menu-esquerdo.component';
var BndesUx4 = (function () {
    function BndesUx4() {
    }
    BndesUx4.forRoot = function (bndesUxConfig) {
        return {
            ngModule: BndesUx4,
            providers: [
                BnAlertsService,
                AuthenticationGuard,
                BnAuthenticationService,
                ServiceDefault,
                BnLoginService,
                { provide: 'bndesUxConfig', useValue: bndesUxConfig }
            ]
        };
    };
    return BndesUx4;
}());
BndesUx4.decorators = [
    { type: core.NgModule, args: [{
                imports: [
                    common.CommonModule,
                    ngBootstrap.NgbModule.forRoot(),
                    router.RouterModule,
                    forms.FormsModule,
                    forms.ReactiveFormsModule,
                    BnMenuPrincipalModule
                ],
                declarations: [
                    BnAlertsComponent,
                    BnBoxUsuarioTopoComponent,
                    BnCabecalhoComponent,
                    BnContextMenuComponent,
                    BnLoadingComponent,
                    BnNotificacoesComponent,
                    BnSlidingWindowComponent,
                    BnBuscaBoxSuperiorComponent,
                    BnTelaLogin,
                    BnTelaLoginComponent,
                ],
                entryComponents: [
                    BnTelaLogin
                ],
                exports: [
                    BnAlertsComponent,
                    BnBoxUsuarioTopoComponent,
                    BnCabecalhoComponent,
                    BnContextMenuComponent,
                    BnLoadingComponent,
                    BnMenuPrincipalModule,
                    BnNotificacoesComponent,
                    BnSlidingWindowComponent,
                    BnBuscaBoxSuperiorComponent,
                    BnTelaLogin,
                    BnTelaLoginComponent,
                ]
            },] },
];
/** @nocollapse */
BndesUx4.ctorParameters = function () { return []; };

exports.BndesUx4 = BndesUx4;
exports.BnAlertsService = BnAlertsService;
exports.BnAlertsComponent = BnAlertsComponent;
exports.BnBoxUsuarioTopoComponent = BnBoxUsuarioTopoComponent;
exports.BnCabecalhoComponent = BnCabecalhoComponent;
exports.BnContextMenuComponent = BnContextMenuComponent;
exports.BnLoadingComponent = BnLoadingComponent;
exports.BnMenuPrincipalModule = BnMenuPrincipalModule;
exports.BnNotificacoesComponent = BnNotificacoesComponent;
exports.BnBuscaBoxSuperiorComponent = BnBuscaBoxSuperiorComponent;
exports.AuthenticationGuard = AuthenticationGuard;
exports.BnAuthenticationService = BnAuthenticationService;
exports.ServiceDefault = ServiceDefault;
exports.BnLoginService = BnLoginService;
exports.BnTelaLogin = BnTelaLogin;
exports.BnTelaLoginComponent = BnTelaLoginComponent;

Object.defineProperty(exports, '__esModule', { value: true });

})));

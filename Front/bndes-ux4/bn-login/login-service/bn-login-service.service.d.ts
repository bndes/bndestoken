import { ServiceDefault } from '../../service-default.service';
import { UserLogado } from '../user-logado';
import { Observable } from 'rxjs/Observable';
export declare class BnLoginService extends ServiceDefault {
    private novoLoginUsuario;
    novoLoginUsuario$: Observable<UserLogado>;
    private loginUrl;
    private cabecalho;
    private userLogado;
    login(cnpj: string, userName: string, senha: string, modal: any): Promise<void>;
    userAutorizado(data: any): void;
    getUserInfo(): Promise<any>;
    logout(): Promise<any>;
    getUser(): Promise<any>;
}

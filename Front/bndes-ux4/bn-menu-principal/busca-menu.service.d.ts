import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
export declare class BuscaMenuService {
    private http;
    menuItens: any[];
    constructor(http: Http);
    getItems(url: string): any[];
}

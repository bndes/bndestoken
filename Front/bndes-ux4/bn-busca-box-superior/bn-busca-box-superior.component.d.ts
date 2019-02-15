import { OnInit } from '@angular/core';
import { Router } from '@angular/router';
export declare class BnBuscaBoxSuperiorComponent implements OnInit {
    protected router: Router;
    txtBusca: string;
    constructor(router: Router);
    ngOnInit(): void;
    executarBusca(): void;
}

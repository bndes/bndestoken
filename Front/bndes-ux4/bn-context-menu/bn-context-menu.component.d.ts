import { OnInit, EventEmitter } from '@angular/core';
export declare class BnContextMenuComponent implements OnInit {
    opcoesMenu: String[];
    onClick: EventEmitter<{}>;
    constructor();
    ngOnInit(): void;
    click(itemMenu: any): void;
}

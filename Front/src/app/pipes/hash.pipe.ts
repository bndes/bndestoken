import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: 'hashMask' })
export class HashPipe implements PipeTransform {

    transform(value: string) {  

        if (value) {
            value = value.toString();
            let limit = 10;
            if (value.length>limit) {
                return value.substr(0,limit) + "..."
            }
            else {
                return value;
            }
        }
        return "-";
    }
}
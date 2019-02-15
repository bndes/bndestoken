import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: 'cnpjMask' })
export class CnpjPipe implements PipeTransform {

    transform(value: string) {  

        if (value) {
            value = value.toString();

            if(value === "BNDES"){
                return value
            }

            if(value.length < 14) {
                value = ("00000000000000" + value).slice(-14)
            }

            if (value.length === 14) {
                return value.substring(0, 2)
                    .concat(".")
                    .concat(value.substring(2, 5))
                    .concat(".")
                    .concat(value.substring(5, 8))
                    .concat("/")
                    .concat(value.substring(8, 12)
                    .concat("-").concat(value.substring(12, 15))
                    )
            } 
        }
        return value;
    }
}
export class Utils {

    static completarCnpjComZero(cnpj){
        return ("00000000000000" + cnpj).slice(-14)
     }
}
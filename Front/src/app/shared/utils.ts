export class Utils {

    static getMaskCnpj() {
      return [/\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/];
    }

    static removeSpecialCharacters(str) {
      //TODO: Today it is used only to CNPJ. If necessary, expand to remove other characters
      return str.replace(/-/g, '').replace(/\./g, '').replace('/', '').replace(/_/g, '')
    }  

    static isValidSalic(text) {
      if (!text) return false;
      let isNum = /^\d+$/.test(text);
      let textAsString = new String(text);
      if (isNum && textAsString.length && textAsString.length==6) {
        return true;
      }
      return false;
    }

    static isValidHash(text) {
      if (!text) return false;
      let isHash = /^[\da-f]+$/.test(text);
      if (isHash && text.length && text.length==64) {
        return true;
      }
      return false;
    }
    
    static completarCnpjComZero(cnpj){
        return ("00000000000000" + cnpj).slice(-14)
     }

     static criarAlertasAvisoConfirmacao(txHash, web3Service, bnAlertsService, warningMsg, confirmationMsg, zoneUpdate) {        
          bnAlertsService.criarAlerta("info", "Aviso", warningMsg, 5);
          console.log(warningMsg);

          web3Service.registraWatcherEventosLocal(txHash, function (error, result) {
            if (!error) {              
              bnAlertsService.criarAlerta("info", "Confirmação", confirmationMsg, 5);
              console.log(confirmationMsg);

              zoneUpdate.run(() => {});
            }
            else {
              console.log(error);
            }
          });
     }

     static criarAlertaErro( bnAlertsService, errorMsg, error) {
         bnAlertsService.criarAlerta("error", "Erro", errorMsg, 5);
         console.log(errorMsg);
         console.log(error);
     }

     static criarAlertaAcaoUsuario( bnAlertsService, userMsg ) {
        bnAlertsService.criarAlerta("info", "", userMsg, 5);
        console.log(userMsg);
     }
      
}
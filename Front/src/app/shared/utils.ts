export class Utils {

    static getMaskCnpj() {
      return [/\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/];
    }

    static removeSpecialCharacters(str) {
      //TODO: Today it is used only to CNPJ. If necessary, expand to remove other characters
      return str.replace(/-/g, '').replace(/\./g, '').replace('/', '').replace(/_/g, '')
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
export class Utils {

    static completarCnpjComZero(cnpj){
        return ("00000000000000" + cnpj).slice(-14)
     }

     static criarAlertasAvisoConfirmacao(txHash, web3Service, bnAlertsService, warningMsg, confirmationMsg, zoneUpdate) {        
          bnAlertsService.criarAlerta("info", "Aviso", warningMsg, 5);
          console.log(warningMsg);

//          self.transferencia.hashOperacao = txHash;
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

     static criarAlertaErro( bnAlertsService, errorMsg, error, mudaStatusHabilitacaoForm ) {
         bnAlertsService.criarAlerta("error", "Erro", errorMsg, 5);
         console.log(errorMsg);
         console.log(error);
         mudaStatusHabilitacaoForm(true);
     }

     static criarAlertaAcaoUsuario( bnAlertsService, userMsg, mudaStatusHabilitacaoForm ) {
        bnAlertsService.criarAlerta("info", "", userMsg, 5);
        console.log(userMsg);
        mudaStatusHabilitacaoForm(false);
     }
      
}
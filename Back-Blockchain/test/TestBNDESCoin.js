var BNDESToken = artifacts.require("./BNDESToken.sol");
var expectThrow = require('./helper.js');
var coin;
var cnpj1 = 2222;
var cnpj2 = 3333;
var subcredito1 = 12345670001;
var subcredito2 = 12345670002;
var subcreditoFornecedor = 0;
var cnpjOrigemVazio = 0;
var isNotRepassador = false;

contract('BNDESToken', function (accounts) {

  var bndesAddr = accounts[0];
  var emp1Addr = accounts[1];
  var emp2Addr = accounts[2];
  var emp3Addr = accounts[3];

  it("should create the contract with the correct owner", function () {
    return BNDESToken.deployed(
    ).then(function (instance) {
      coin = instance;
      return coin.getOwner.call();
    }).then(function (owner) {
      assert.equal(owner, bndesAddr, "Owner não é igual ao utilizado");
    })
  });

  it("should register the first company on the blockchain", function () {
    var cnpj;
    return coin.cadastra(cnpj1, subcredito1, cnpjOrigemVazio, isNotRepassador, { from: emp1Addr }).then(function () {
      return coin.getCNPJ.call(emp1Addr);
    }).then(function (cnpj) {
      assert.equal(cnpj1, cnpj.toNumber(), "CNPJ recuperado não foi o cadastrado");
    });
  });


  it("should register the second company on the blockchain", function () {
    return coin.cadastra(cnpj2, subcreditoFornecedor, cnpjOrigemVazio, isNotRepassador, { from: emp2Addr }).then(function () {
      return coin.getCNPJ.call(emp2Addr);
    }).then(function (cnpj) {
      assert.equal(cnpj2, cnpj.toNumber(), "CNPJ recuperado não foi o cadastrado");
    })
  });

  it("should disburse from BNDES to client", function () {
    return coin.transfer(emp1Addr, 10, {from: bndesAddr}
    ).then(function () {
      return coin.getBalanceOf.call(emp1Addr);
    }).then(function (balance) {
      assert.equal(balance.toNumber(), 10, "Transferência não foi executada");
    })
  });

  it("should transfer between clients", function () {
    return coin.transfer(emp2Addr, 7, { from: emp1Addr }
    ).then(function () {
      return coin.getBalanceOf.call(emp1Addr);
    }).then(function (balance1) {
      assert.equal(balance1.toNumber(), 3, "Recursos não saíram da conta do cliente (ou saiu a quantidade errada)");
      return coin.getBalanceOf.call(emp2Addr);
    }).then(function (balance2) {
      assert.equal(balance2.toNumber(), 7, "Recursos não foram para a conta do fornecedor em quantidade correta");
    })
  });

  it("should redeem the money by the second client", function () {
    return coin.transfer(bndesAddr, 7, {from: emp2Addr}
    ).then(function () {
      return coin.getBalanceOf.call(emp2Addr);
    }).then(function (balance) {
      assert.equal(balance.toNumber(), 0, "Saldo da empresa deveria ser zero após o resgate");
      return coin.getTotalSupply.call();
    }).then(function (totalSupply) {
      assert.equal(totalSupply.toNumber(), 3, "Suprimento total não está com valor correto");
    })
  });

  it("should settle the redemption of the second client", function () {
    var hashId = 0x12345;
    return coin.notificaLiquidacaoResgate(hashId, {from: bndesAddr}
    ).then(function () {
      assert.equal(0, 0, "Erro que não deveria haver");
    })
  });

  /*
  it("should NOT change the blockchain address of the first client to his current address " + emp1Addr, function () {    
    return coin.troca(cnpj1, subcredito1, {from: emp1Addr}
    ).then(function () {
      //assert.equal(0, 0, "Deveria lancar erro!");
      assert(false, 'Expected throw not received');
    })    
  });
  */

  it('should NOT change the blockchain address of the first client to his current address', async () => {
    // note there is no await keyword for tx as in my previous comment
    let tx = coin.troca(cnpj1, subcredito1, {from: emp1Addr});
    await expectThrow(tx);
    tx = null;
  });

  it("should change the blockchain address of the first client to " + emp3Addr, function () {    
    return coin.troca(cnpj1, subcredito1, {from: emp3Addr}
    ).then(function () {
      assert.equal(0, 0, "Erro que não deveria haver");
    })
  });

  it('should NOT change the blockchain address of the first client to his new current address', async () => {
    // note there is no await keyword for tx as in my previous comment
    let tx = coin.troca(cnpj1, subcredito1, {from: emp3Addr});
    await expectThrow(tx);
    tx = null;
  });

  it('should NOT change the blockchain address of the 2nd client to the 1st client address', async () => {
    // note there is no await keyword for tx as in my previous comment
    let tx = coin.troca(cnpj2, subcredito2, {from: emp3Addr});
    await expectThrow(tx);
    tx = null;
  });

  it("should change back the blockchain address of the first client to " + emp1Addr, function () {    
    return coin.troca(cnpj1, subcredito1, {from: emp1Addr}
    ).then(function () {
      assert.equal(0, 0, "Erro que não deveria haver");
    })
  });

});




var owned = artifacts.require("./owned.sol");
var TokenERC20 = artifacts.require("./TokenERC20.sol");
var BNDESCoin = artifacts.require("./BNDESCoin.sol");

module.exports = function(deployer) {

	deployer.deploy(TokenERC20, 1000000, "BNDESToken", "BND");
	deployer.deploy(owned);
	deployer.link(TokenERC20, BNDESCoin);
	deployer.link(owned, BNDESCoin);
	deployer.deploy(BNDESCoin);
};

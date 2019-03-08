var owned = artifacts.require("./owned.sol");
var ERC20 = artifacts.require("./ERC20.sol");
var BNDESToken = artifacts.require("./BNDESToken.sol");

module.exports = function(deployer) {

	deployer.deploy(ERC20, 1000000, "BNDESToken", "BND");
	deployer.deploy(owned);
	deployer.link(ERC20, BNDESToken);
	deployer.link(owned, BNDESToken);
	deployer.deploy(BNDESToken);
};

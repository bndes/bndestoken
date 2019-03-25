var BNDESToken = artifacts.require("./BNDESToken.sol");

module.exports = function(deployer) {

	deployer.deploy(BNDESToken);
};

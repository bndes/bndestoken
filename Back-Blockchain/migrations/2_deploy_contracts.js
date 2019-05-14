var BNDESRegistry = artifacts.require("./BNDESRegistry.sol");
var BNDESToken = artifacts.require("./BNDESToken.sol");


module.exports = function(deployer) {
	
	deployer.deploy(BNDESRegistry).then( ()=> deployer.deploy(BNDESToken) );
};

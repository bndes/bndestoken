var BNDESRegistry = artifacts.require("./BNDESRegistry.sol");
var BNDESToken = artifacts.require("./BNDESToken.sol");

module.exports = async (deployer) => {
	await deployer.deploy(BNDESRegistry)
    await deployer.deploy(BNDESToken, BNDESRegistry.address ) 
	BNDESRegistryInstance = await BNDESRegistry.deployed();
	BNDESTokenInstance = await BNDESToken.deployed();
	await BNDESRegistryInstance.setTokenAddress(BNDESTokenInstance.address);	
	
};

var Storage = artifacts.require("./Storage.sol");
var LegalEntityInfo = artifacts.require("./LegalEntityInfo.sol");
var BNDESRegistryUpgrade = artifacts.require("./BNDESRegistryUpgrade.sol");

module.exports = async (deployer) => {
	
	await deployer.deploy(Storage);
	await deployer.deploy(LegalEntityInfo);
	await deployer.deploy(BNDESRegistryUpgrade);

};

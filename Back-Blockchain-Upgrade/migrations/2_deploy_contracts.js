var HelloWorld = artifacts.require("./HelloWorld.sol");
//var Storage = artifacts.require("./appGovernanceUpgrade/Storage.sol");
//var LegalEntityInfo = artifacts.require("./LegalEntityInfo.sol");
//var BNDESRegistry = artifacts.require("./BNDESRegistry.sol");
var Governance = artifacts.require("./appGovernanceUpgrade/Governance.sol");
var PreUpgrader = artifacts.require("./appUpgraders/PreUpgrader.sol");

module.exports = async (deployer) => {

	await deployer.deploy(HelloWorld);
	await deployer.deploy(Governance, "0xff1465539F3F22Df5bc197312AB28B04E3815624", []);
	await deployer.deploy(PreUpgrader, "0xff1465539F3F22Df5bc197312AB28B04E3815624", "0xff1465539F3F22Df5bc197312AB28B04E3815624", []);	
//	await deployer.deploy(Storage);
//	await deployer.deploy(LegalEntityInfo);
//	await deployer.deploy(BNDESRegistryUpgrade);

};

var HelloWorld = artifacts.require("./HelloWorld.sol");
//var Storage = artifacts.require("./appGovernanceUpgrade/Storage.sol");
//var LegalEntityInfo = artifacts.require("./LegalEntityInfo.sol");
//var BNDESRegistry = artifacts.require("./BNDESRegistry.sol");
var Governance = artifacts.require("./appGovernanceUpgrade/Governance.sol");
var PreUpgrader1 = artifacts.require("./appUpgraders/PreUpgrader1.sol");
var PreUpgrader2 = artifacts.require("./appUpgraders/PreUpgrader2.sol");

module.exports = async (deployer) => {

//	await deployer.deploy(HelloWorld);
//	await deployer.deploy(Governance, "0xff1465539F3F22Df5bc197312AB28B04E3815624", []);
	await deployer.deploy(PreUpgrader1, "0xff1465539F3F22Df5bc197312AB28B04E3815624", "0x0D39D8C023FE3891d8B2065CB550A7ec1489343d", []);
	await deployer.deploy(PreUpgrader2, PreUpgrader1.address);
//	await deployer.deploy(Storage);
//	await deployer.deploy(LegalEntityInfo);
//	await deployer.deploy(BNDESRegistryUpgrade);

};

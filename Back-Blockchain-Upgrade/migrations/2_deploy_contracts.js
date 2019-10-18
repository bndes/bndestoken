var HelloWorld = artifacts.require("./HelloWorld.sol");
//var Storage = artifacts.require("./appGovernanceUpgrade/Storage.sol");
//var LegalEntityInfo = artifacts.require("./LegalEntityInfo.sol");
//var BNDESRegistry = artifacts.require("./BNDESRegistry.sol");
var Governance = artifacts.require("./appGovernanceUpgrade/Governance.sol");
var UpgraderInfo = artifacts.require("./appGovernanceUpgrade/UpgraderInfo.sol");

var PreUpgrader1 = artifacts.require("./appUpgraders/PreUpgrader1.sol");
var PreUpgrader2 = artifacts.require("./appUpgraders/PreUpgrader2.sol");


module.exports = async (deployer) => {

//	await deployer.deploy(HelloWorld);
//	await deployer.deploy(PreUpgrader1, "0x193089e87a67858cbc1471d235d9dbe75dee767a", "0x0D39D8C023FE3891d8B2065CB550A7ec1489343d", []);
//	await deployer.deploy(PreUpgrader2, PreUpgrader1.address);
//	await deployer.deploy(Storage);
//	await deployer.deploy(LegalEntityInfo);
//	await deployer.deploy(BNDESRegistryUpgrade);

};

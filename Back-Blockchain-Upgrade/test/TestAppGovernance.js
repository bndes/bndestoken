var Governance = artifacts.require("./appGovernanceUpgrade/Governance.sol");
var UpgraderInfo = artifacts.require("./appGovernanceUpgrade/UpgraderInfo.sol");
var Resolver = artifacts.require("./appGovernanceUpgrade/Resolver.sol");

var PreUprgader1 = artifacts.require("./appUpgraders/PreUpgrader1.sol");
var PreUprgader2 = artifacts.require("./appUpgraders/PreUpgrader2.sol");
var PreUpgrader3 = artifacts.require("./appUpgraders/PreUpgrader3.sol");


var expectThrow = require('./helper.js');


contract('GovernanceInAction', async accounts => {

    const nullAddr = "0x0000000000000000000000000000000000000000";

    let bndesAddr = accounts[0];
    let governanceAddr;
    let governanceInstance;
    let upgraderInfo;

    let preUpgrader1;
    let preUpgrader2;
    let preUpgrader3;

  let governanceMembersId = [];

 
  it("should create the PreUpgrader contract with Governance - async", async () => {
    preUpgrader1 = await PreUprgader1.new(bndesAddr,bndesAddr,governanceMembersId);
    governanceAddr = await preUpgrader1.governanceAddr();
    assert.notEqual(governanceAddr, bndesAddr, "Endereços deveriam ser diferentes");
    assert.notEqual(governanceAddr, "0x0", "Endereços não deveria ser zero");
  });

  it("should have owner of UpgraderInfo the same the address of Governance - async", async () => {

    governanceInstance = await Governance.at(governanceAddr);
    assert.equal(governanceInstance.address, governanceAddr, "Endereços de governança não são iguais"); 

    let upgraderInfoAddr = await governanceInstance.upgraderInfoAddr();
    upgraderInfo = await UpgraderInfo.at(upgraderInfoAddr);
    assert.equal(upgraderInfo.address, upgraderInfoAddr, "Endereços de upgraderInfo não são iguais"); 

    let a = await upgraderInfo.owner();
    assert.equal(governanceAddr, a, "Endereços deveriam ser iguais");

  });


  it("should have admin of UpgraderInfo the same the address of Governance - async", async () => {

    let adminAddr = await upgraderInfo.adminAddr();    
    assert.equal(adminAddr, bndesAddr, "Endereços de admin não são iguais"); 
  });

  it("should create the change preUpgrader2 -- async", async () => {

    let hashChangeMotivation = web3.utils.asciiToHex('justification preUpgrader2');
    preUpgrader2 = await PreUprgader2.new(preUpgrader1.address);    
    let upgraderContractAddr = preUpgrader2.address;

    let resolverAddr = await preUpgrader2.resolverAddr();
    assert.equal(resolverAddr, nullAddr, "Resolver deve ser null");

    await governanceInstance.createNewChange(hashChangeMotivation, upgraderContractAddr, 0);

    let resultGetChange  = await governanceInstance.getChange(0);

//    console.log(resultGetChange);     
    assert.equal(resultGetChange['1'], upgraderContractAddr, "Upgraders deveriam ser iguais");
    assert.equal(resultGetChange['2'], nullAddr, "Decision address deveriam ser iguais");
    assert.equal(resultGetChange['3'], 1, "Estado deveria ser APPROVED");

  });


  it("should execute the change preUpgrader2 -- async", async () => {

    await governanceInstance.executeChange(0);
    let resultGetChange  = await governanceInstance.getChange(0);
    let resolverAddr = await preUpgrader2.resolverAddr();
     
    assert.equal(resultGetChange['3'], 4, "Estado deveria ser FINALIZED");
    assert.notEqual(resolverAddr, nullAddr, "Resolver deveria ser um endereço válido");
    
  });


  it("should create the change PreUpgrader3 -- async", async () => {

    preUpgrader3 = await PreUpgrader3.new(preUpgrader2.address);

    let hashChangeMotivation = web3.utils.asciiToHex('justification upgrader1');
    let upgraderContractAddr = preUpgrader3.address;
    let bndesRegistryAddr = await preUpgrader3.bndesRegistryAddr();
    assert.equal(bndesRegistryAddr, nullAddr, "bndesRegistryAddr deve ser null");

    await governanceInstance.createNewChange(hashChangeMotivation, upgraderContractAddr, 0);
    let resultGetChange  = await governanceInstance.getChange(1);

    assert.equal(resultGetChange['1'], upgraderContractAddr, "Upgraders deveriam ser iguais");
    assert.equal(resultGetChange['2'], nullAddr, "Decision address deveriam ser iguais");
    assert.equal(resultGetChange['3'], 1, "Estado deveria ser APPROVED");
  });

  it("should execute the change PreUpgrader3 -- async", async () => {

    await governanceInstance.executeChange(1);

    let resultGetChange  = await governanceInstance.getChange(1);
    let bndesRegistryAddr = await preUpgrader3.bndesRegistryAddr();
     
    assert.equal(resultGetChange['3'], 4, "Estado deveria ser FINALIZED");
    assert.notEqual(bndesRegistryAddr, nullAddr, "bndesRegistryAddr deveria ser um endereço válido");
    
  });

  it("should have the correct address of BNDESRegistry in Resolver -- async", async () => {

    let bndesRegistryAddr = await preUpgrader3.bndesRegistryAddr();
    let resolverAddr = await preUpgrader2.resolverAddr();
    let resolver = await Resolver.at(resolverAddr);
    let bndesRegistryAddrByResolver = await resolver.getAddr("BNDESRegistry");
    assert.equal(bndesRegistryAddr, bndesRegistryAddrByResolver, "Endereço do BNDESRegistry recuperado do resolver não é o correto");
    
  });


});




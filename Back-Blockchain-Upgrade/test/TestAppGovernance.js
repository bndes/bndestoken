var Governance = artifacts.require("./appGovernanceUpgrade/Governance.sol");
var UpgraderInfo = artifacts.require("./appGovernanceUpgrade/UpgraderInfo.sol");
var Resolver = artifacts.require("./appGovernanceUpgrade/Resolver.sol");

var PreUprgader1 = artifacts.require("./appUpgraders/PreUpgrader1.sol");
var PreUprgader2 = artifacts.require("./appUpgraders/PreUpgrader2.sol");
var PreUpgrader3A = artifacts.require("./appUpgraders/PreUpgrader3A.sol");
var PreUpgrader3B = artifacts.require("./appUpgraders/PreUpgrader3B.sol");
var Upgrader1 = artifacts.require("./appUpgraders/upgrader1.sol");
var Upgrader2 = artifacts.require("./appUpgraders/Upgrader2.sol");

var BNDESRegistry = artifacts.require("./BNDESRegistry.sol");


var expectThrow = require('./helper.js');


contract('GovernanceInAction', async accounts => {

    const nullAddr = "0x0000000000000000000000000000000000000000";

    let bndesAddr = accounts[0];
    let id1 = accounts[0];
    let id2 = accounts[1];
    let id3 = accounts[2];

    let governanceAddr;
    let governanceInstance;
    let upgraderInfo;
    let resolver;
    let bndesRegistry;

    let preUpgrader1;
    let preUpgrader2;
    let preUpgrader3A;
    let preUpgrader3B;    
    let upgrader1;      
    let upgrader2;     

  let governanceMembersId = [];

 
  it("should create the PreUpgrader contract with Governance - async", async () => {
    preUpgrader1 = await PreUprgader1.new(bndesAddr,bndesAddr,governanceMembersId, bndesAddr);
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

    await governanceInstance.createNewChange(hashChangeMotivation, [upgraderContractAddr], 0);

    let resultGetChange  = await governanceInstance.getChange(0);
  
    assert.equal(resultGetChange['1'][0], upgraderContractAddr, "Upgraders deveriam ser iguais");
    assert.equal(resultGetChange['3'], nullAddr, "Decision address deveriam ser iguais");
    assert.equal(resultGetChange['4'], 1, "Estado deveria ser APPROVED");

  });


  it("should execute the change preUpgrader2 -- async", async () => {

    await governanceInstance.executeChange(0);
    let resultGetChange  = await governanceInstance.getChange(0);
    let resolverAddr = await preUpgrader2.resolverAddr();
     
    assert.equal(resultGetChange['4'], 5, "Estado deveria ser FINISHED");
    assert.notEqual(resolverAddr, nullAddr, "Resolver deveria ser um endereço válido");
    
  });

  it("should create the change PreUpgrader3 -- async", async () => {

    preUpgrader3A = await PreUpgrader3A.new(preUpgrader2.address);
    preUpgrader3B = await PreUpgrader3B.new(preUpgrader3A.address);

    let hashChangeMotivation = web3.utils.asciiToHex('justification upgrader3');
    let upgraderContractAddrA = preUpgrader3A.address;
    let upgraderContractAddrB = preUpgrader3B.address;

    let bndesRegistryAddr = await preUpgrader3A.bndesRegistryAddr();
    assert.equal(bndesRegistryAddr, nullAddr, "bndesRegistryAddr deve ser null");

    await governanceInstance.createNewChange(hashChangeMotivation, [upgraderContractAddrA, upgraderContractAddrB], 0);
    let resultGetChange  = await governanceInstance.getChange(1);

    assert.equal(resultGetChange['1'][0], upgraderContractAddrA, "Upgraders A deveriam ser iguais");
    assert.equal(resultGetChange['1'][1], upgraderContractAddrB, "Upgraders B deveriam ser iguais");
    assert.equal(resultGetChange['3'], nullAddr, "Decision address deveriam ser iguais");
    assert.equal(resultGetChange['4'], 1, "Estado deveria ser APPROVED");
  });


  it("should execute the change PreUpgrader3A -- async", async () => {

    await governanceInstance.executeChange(1,0);

    let resultGetChange  = await governanceInstance.getChange(1);
    let bndesRegistryAddr = await preUpgrader3A.bndesRegistryAddr();
     
    assert.equal(resultGetChange['4'], 2, "Estado deveria ser EXECUTING");
    assert.notEqual(bndesRegistryAddr, nullAddr, "bndesRegistryAddr deveria ser um endereço válido");
    
  });

  it("should execute the change PreUpgrader3B -- async", async () => {

    let resultGetChange  = await governanceInstance.getChange(1);
    assert.equal(resultGetChange['4'], 2, "Estado deveria ser EXECUTING");
    assert.equal(resultGetChange['2'], 1, "upgraderContractToBeExecutedIndex should be 1");
    await governanceInstance.executeChange(1,1);
    resultGetChange  = await governanceInstance.getChange(1);
    let bndesRegistryAddr = await preUpgrader3B.bndesRegistryAddr();
     
    assert.equal(resultGetChange['4'], 5, "Estado deveria ser FINISHED");
    assert.notEqual(bndesRegistryAddr, nullAddr, "bndesRegistryAddr deveria ser um endereço válido");
    
  });


  it("should have the correct address of BNDESRegistry in Resolver -- async", async () => {

    let bndesRegistryAddr = await preUpgrader3B.bndesRegistryAddr();
    let resolverAddr = await preUpgrader3B.resolverAddr();
    resolver = await Resolver.at(resolverAddr);
    let bndesRegistryAddrByResolver = await resolver.getAddr("BNDESRegistry");
    assert.equal(bndesRegistryAddr, bndesRegistryAddrByResolver, "Endereço do BNDESRegistry recuperado do resolver não é o correto");
    
  });

  it("should save and recover the CNPJ -- async", async () => {

    let bndesRegistryAddrByResolver = await resolver.getAddr("BNDESRegistry");
    bndesRegistry = await BNDESRegistry.at(bndesRegistryAddrByResolver);
    let cnpjConst = 12345678901;
    await bndesRegistry.registryLegalEntity(cnpjConst);

    let cnpj = await bndesRegistry.getCNPJ(bndesAddr);
    let cnpjById = await bndesRegistry.getId(bndesAddr);

    assert.equal(cnpj, cnpjConst, "CNPJ was not saved or recovered in a correct form");
    assert.equal(cnpjById, cnpjConst, "ID was not saved or recovered in a correct form");    
    
  });

  it("should include and remove new members in governance -- async", async () => {

    let governanceMembers = await governanceInstance.governanceMembers();
    assert.equal(governanceMembers.length, 0, "There is a governance member");

    await governanceInstance.includeNewGovernanceMember(9999);
    governanceMembers = await governanceInstance.governanceMembers();    
    assert.equal(governanceMembers.length, 1, "There is not 1 governance member");    

    await governanceInstance.removeGovernanceMember(9999);
    governanceMembers = await governanceInstance.governanceMembers();    
    assert.equal(governanceMembers.length, 0, "There is not 0 governance member");    

  });




  it("should create the change upgrader1 -- async", async () => {

    let hashChangeMotivation = web3.utils.asciiToHex('justification upgrader');
    upgrader1 = await Upgrader1.new(preUpgrader3B.address);
    let upgraderContractAddr = upgrader1.address;

    await governanceInstance.createNewChange(hashChangeMotivation, [upgraderContractAddr], 0);

    let resultGetChange  = await governanceInstance.getChange(2);
  
    assert.equal(resultGetChange['1'][0], upgraderContractAddr, "Upgraders deveriam ser iguais");
    assert.equal(resultGetChange['3'], nullAddr, "Decision address deveriam ser iguais");
    assert.equal(resultGetChange['4'], 1, "Estado deveria ser APPROVED");

  });

  it("should execute the change upgrader1 -- async", async () => {

    await governanceInstance.executeChange(2);
    let resultGetChange  = await governanceInstance.getChange(2);
    let cnpj = await bndesRegistry.getCNPJ(bndesAddr);

    assert.equal(resultGetChange['4'], 5, "Estado deveria ser FINISHED");
    assert.equal(cnpj, 666, "CNPJ was not saved or recovered in a correct form");    
  });


  it("should create the change upgrader2 -- async", async () => {

    let hashChangeMotivation = web3.utils.asciiToHex('justification upgrader2');
    upgrader2 = await Upgrader2.new(upgrader1.address);
    let upgraderContractAddr = upgrader2.address;

    await governanceInstance.createNewChange(hashChangeMotivation, [upgraderContractAddr], 0);

    let resultGetChange  = await governanceInstance.getChange(3);
  
    assert.equal(resultGetChange['1'][0], upgraderContractAddr, "Upgraders deveriam ser iguais");
    assert.equal(resultGetChange['3'], nullAddr, "Decision address deveriam ser iguais");
    assert.equal(resultGetChange['4'], 1, "Estado deveria ser APPROVED");

  });
/*
  it("should execute the change upgrader2 -- async", async () => {

    await governanceInstance.executeChange(3);
    let resultGetChange  = await governanceInstance.getChange(3);
//    let cnpj = await bndesRegistry.getCNPJ(bndesAddr);

    assert.equal(resultGetChange['4'], 5, "Estado deveria ser FINISHED");
//    assert.equal(cnpj, 666, "CNPJ was not saved or recovered in a correct form");    
  });
*/
});




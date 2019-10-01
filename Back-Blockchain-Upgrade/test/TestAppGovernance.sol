pragma solidity >=0.4.25 <0.6.0;


import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";

import "../contracts/HelloWorld.sol";

import "../contracts/appUpgraders/PreUpgrader1.sol";
import "../contracts/appUpgraders/PreUpgrader2.sol";
import "../contracts/appGovernanceUpgrade/Governance.sol";
import "../contracts/appGovernanceUpgrade/Resolver.sol";


contract TestAppGovernance {
/*
  PreUpgrader1 public preUpgrader1;
  PreUpgrader2 public preUpgrader2;


  function testHelloWorld() public {
    HelloWorld hw = new HelloWorld();
    Assert.equal(hw.get1(), 1, "False");
  }

  function testSetupPreUpgrader1() public {
    uint[] memory governanceMembersId;
    address addressThis = address(this);
    preUpgrader1 = new PreUpgrader1(addressThis, addressThis, governanceMembersId);
  }

  
  function testSetupPreUpgrader2() public {
    preUpgrader2 = new PreUpgrader2(address(preUpgrader1));
  }

/*

  function testGovernanceCreation() public {

    Governance governance = Governance (preUpgrader1.governanceAddr());
    address a = governance.upgraderInfoAddr();
    address b = governance.idRegistryAddr();

    Assert.notEqual(a, b, "They should not be equal");
  }

  function testGovernanceCreationAdmin() public {

    Governance governance = Governance (preUpgrader1.governanceAddr());
    UpgraderInfo ui = UpgraderInfo(governance.upgraderInfoAddr());
    address a = ui.adminAddr();
    address b = address(this);

    Assert.equal(a, b, "They should be equal");
  }

  function testUpgraderInfoOwner() public {

    Governance governance = Governance (preUpgrader1.governanceAddr());
    UpgraderInfo ui = UpgraderInfo(governance.upgraderInfoAddr());
    address a = ui.owner();
    address b = preUpgrader1.governanceAddr();

    Assert.equal(a, b, "They should be equal");

    
  }
*/


/*
  function testPreUpgraderCreation() public {

    Assert.notEqual(preUpgrader1.governanceAddr(), preUpgrader2.resolverAddr(), "They should not be equal");
  }

  function testResolverCreation() public {

    Resolver resolver = Resolver (preUpgrader2.resolverAddr());

    Assert.equal(resolver.dataAvailable(), true, "Data must be available");
  }

  function testResolverAndGovernanceCreation() public {

    Resolver resolver = Resolver (preUpgrader2.resolverAddr());
    Governance governance = Governance (preUpgrader1.governanceAddr());

    Assert.equal(resolver.upgraderInfoAddr(), governance.upgraderInfoAddr(), "Addr must be the same");
  }
*/
/*
  function testGovernanceChangeCreationWithoutDecision() public {
    Governance governance = Governance (preUpgrader1.governanceAddr());
    bytes32 hashChangeMotivation = keccak256("justification");

    address upgraderContractAddr = address(preUpgrader2);

    governance.createNewChange(hashChangeMotivation, upgraderContractAddr, 0);
    (bytes32 hashChangeMotivation2, address upgraderContractAddr2, address decisionContractAddr, Governance.ChangeState state) = governance.getChange(0);

    Assert.equal(hashChangeMotivation, hashChangeMotivation, "obvio");
    Assert.equal(hashChangeMotivation, hashChangeMotivation2, "Hash deveriam ser iguais");
    Assert.equal(upgraderContractAddr, upgraderContractAddr2, "Upgraders deveriam ser iguais");
    Assert.equal(decisionContractAddr, address(0), "Decision address deveriam ser iguais");
    Assert.equal(uint(state), uint(Governance.ChangeState.APPROVED), "Estado deveria ser APPROVED");
  }
*/
/*
  function testGovernanceExecuteChange() public {
    Governance governance = Governance (preUpgrader1.governanceAddr());
    bytes32 hashChangeMotivation = keccak256("justification");
    address upgraderContractAddr = address(preUpgrader2);
    governance.createNewChange(hashChangeMotivation, upgraderContractAddr, 0);

    governance.executeChange(0);
    
    (bytes32 hashChangeMotivation2, address upgraderContractAddr2, address decisionContractAddr, Governance.ChangeState state) = governance.getChange(0);
    Assert.equal(hashChangeMotivation, hashChangeMotivation2, "Hash deveriam ser iguais");
    Assert.equal(upgraderContractAddr, upgraderContractAddr2, "Upgraders deveriam ser iguais");
    Assert.equal(decisionContractAddr, address(0), "Decision address deveriam ser iguais");
    Assert.equal(uint(state), uint(Governance.ChangeState.FINISHED), "Estado deveria ser FINISHED");
  }
*/
/*
  function testGovernanceChangeCreationWithDecision() public {
    Governance governance = Governance (preUpgrader1.governanceAddr());
    bytes32 hashChangeMotivation = keccak256("justification");
    PreUpgrader2 preUpgrader2 = PreUpgrader2(DeployedAddresses.PreUpgrader2());    
    address upgraderContractAddr = address(preUpgrader2);
    governance.createNewChange(hashChangeMotivation, upgraderContractAddr, 30);
    (bytes32 hashChangeMotivation2, address upgraderContractAddr2, address decisionContractAddr, Governance.ChangeState state) = governance.getChange(0);
    
    Assert.equal(hashChangeMotivation, hashChangeMotivation2, "Hash deveriam ser iguais");
    Assert.equal(upgraderContractAddr, upgraderContractAddr2, "Upgraders deveriam ser iguais");
    Assert.notEqual(decisionContractAddr, address(0), "Decision address deveriam ser diferentes");
    Assert.equal(uint(state), uint(Governance.ChangeState.WAITING), "Estado deveria ser WAITING");

  }
*/

}

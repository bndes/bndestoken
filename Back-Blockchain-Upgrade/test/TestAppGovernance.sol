pragma solidity >=0.4.25 <0.6.0;


import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/appUpgraders/PreUpgrader.sol";
import {Governance} from "../contracts/appGovernanceUpgrade/Governance.sol";
import "../contracts/HelloWorld.sol";

contract TestAppGovernance {


  function testHelloWorld() public {

    HelloWorld hw = new HelloWorld();
    Assert.equal(hw.get1(), 1, "False");
  }

  function testGovernanceCreation() public {

    Governance governance = Governance(DeployedAddresses.Governance());
    address a = governance.upgraderInfoAddr();
    address b = governance.idRegistryAddr();

    Assert.notEqual(a, b, "They should not be equal");
  }


  function testPreUpgrader() public {

    PreUpgrader preUpgrader = PreUpgrader(DeployedAddresses.PreUpgrader());

    Assert.notEqual(preUpgrader.governanceAddr(), preUpgrader.resolverAddr(), "They should not be equal");
  }

}

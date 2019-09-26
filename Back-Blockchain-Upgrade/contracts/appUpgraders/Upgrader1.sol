pragma solidity ^0.5.0;

import "../appGovernanceUpgrade/Upgrader.sol";
import "../appGovernanceUpgrade/Governance.sol";
import "../appGovernanceUpgrade/Storage.sol";

import "./PreUpgrader.sol";
import "../LegalEntityMapping.sol";
import "../BNDESRegistry.sol";


contract Upgrader1 is Upgrader {

    //Variables from previous Migration
    address public governanceAddr;
    address public resolverAddr;

    //New variables
    address public storageContractAddr;
    address public legalEntityMappingAddr;
    address public bndesRegistryAddr;

    constructor (address preUpgraderAddr) public {
        PreUpgrader preUpgrader = PreUpgrader(preUpgraderAddr);
        governanceAddr = preUpgrader.governanceAddr();
        resolverAddr = preUpgrader.resolverAddr();
    }

    modifier onlyGovernance() {
        require(governanceAddr==msg.sender, "This function can only be executed by the Governance");
        _;
    }

    function upgrade () external onlyGovernance {

        Governance governance = Governance (governanceAddr);
        address upgraderInfoAddr = governance.getUpgraderInfoAddr();
        UpgraderInfo ui = UpgraderInfo(upgraderInfoAddr);

        Storage storageContract = new Storage(upgraderInfoAddr);
        storageContractAddr = address(storageContract);
        storageContract.addPauser(ui.getAdminAddr());

        //Owner is a pausable because it enables him to remove other pausers
        storageContract.addPauser(governance.owner());

        LegalEntityMapping legalEntityMapping = new LegalEntityMapping(upgraderInfoAddr,storageContractAddr);
        legalEntityMappingAddr = address(legalEntityMapping);
        legalEntityMapping.addPauser(ui.getAdminAddr());
        legalEntityMapping.addPauser(governance.owner());

        BNDESRegistry bndesRegistry = new BNDESRegistry(upgraderInfoAddr, legalEntityMappingAddr);
        bndesRegistryAddr = address(bndesRegistry);
        bndesRegistry.addPauser(resolverAddr);
        bndesRegistry.addPauser(governance.owner());
        bndesRegistry.addPauser(ui.getAdminAddr());

        governance.setIdRegistryAddr(bndesRegistry);

        storageContract.addHandler(legalEntityMappingAddr);
        legalEntityMapping.addHandler(bndesRegistryAddr);

        Resolver resolver = Resolver(resolverAddr);
        resolver.changeContract("BNDESRegistry", bndesRegistryAddr);
       
        storageContract.renouncePauser();
        legalEntityMapping.renouncePauser();
        bndesRegistry.renouncePauser();

    }


}

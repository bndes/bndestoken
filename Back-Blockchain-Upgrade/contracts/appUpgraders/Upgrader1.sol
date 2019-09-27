pragma solidity ^0.5.0;

import "../appGovernanceUpgrade/Upgrader.sol";
import "../appGovernanceUpgrade/Governance.sol";
import "../appGovernanceUpgrade/Storage.sol";

import "./PreUpgrader2.sol";
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

    constructor (address preUpgraderAddr2) public {
        PreUpgrader2 preUpgrader2 = PreUpgrader2(preUpgraderAddr2);
        governanceAddr = preUpgrader2.governanceAddr();
        resolverAddr = preUpgrader2.resolverAddr();
    }

    modifier onlyGovernance() {
        require(governanceAddr==msg.sender, "This function can only be executed by the Governance");
        _;
    }

    function upgrade () external onlyGovernance {

        Governance governance = Governance (governanceAddr);
        address upgraderInfoAddr = governance.upgraderInfoAddr();
        UpgraderInfo ui = UpgraderInfo(upgraderInfoAddr);

        Storage storageContract = new Storage(upgraderInfoAddr);
        storageContractAddr = address(storageContract);
        
        //Owner is a pausable because it enables him to remove other pausers
        storageContract.addPauser(governance.owner());
        storageContract.addPauser(ui.adminAddr());
        storageContract.renouncePauser();


        LegalEntityMapping legalEntityMapping = new LegalEntityMapping(upgraderInfoAddr,storageContractAddr);
        legalEntityMappingAddr = address(legalEntityMapping);
        legalEntityMapping.addPauser(governance.owner());
        legalEntityMapping.addPauser(ui.adminAddr());
        legalEntityMapping.renouncePauser();


        BNDESRegistry bndesRegistry = new BNDESRegistry(upgraderInfoAddr, legalEntityMappingAddr);
        bndesRegistryAddr = address(bndesRegistry);
        bndesRegistry.addPauser(resolverAddr);
        bndesRegistry.addPauser(governance.owner());
        bndesRegistry.addPauser(ui.adminAddr());
        bndesRegistry.renouncePauser();

        governance.setIdRegistryAddr(address(bndesRegistry));

        storageContract.addHandler(legalEntityMappingAddr);
        legalEntityMapping.addHandler(bndesRegistryAddr);

        Resolver resolver = Resolver(resolverAddr);
        resolver.changeContract("BNDESRegistry", bndesRegistryAddr);


    }


}

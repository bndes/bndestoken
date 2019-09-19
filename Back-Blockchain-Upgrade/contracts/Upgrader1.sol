pragma solidity ^0.5.0;

import "./Upgrader.sol";
import "./PreUpgrader.sol";
import "./LegalEntityMapping.sol";
import "./Storage.sol";
import "./BNDESRegistry.sol";
import "./Governance.sol";


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

        Storage storageContract = new Storage(upgraderInfoAddr);
        storageContractAddr = address(storageContract);
        
        LegalEntityMapping legalEntityMapping = new LegalEntityMapping(upgraderInfoAddr,storageContractAddr);
        legalEntityMappingAddr = address(legalEntityMapping);

        BNDESRegistry bndesRegistry = new BNDESRegistry(upgraderInfoAddr, legalEntityMappingAddr);
        bndesRegistryAddr = address(bndesRegistry);
        //TODO: setar o registry na governanca

        storageContract.addHandler(legalEntityMappingAddr);
        legalEntityMapping.addHandler(bndesRegistryAddr);

        Resolver resolver = Resolver(resolverAddr);
        resolver.changeContract("BNDESRegistry", bndesRegistryAddr);
       
        storageContract.renouncePauser();
        legalEntityMapping.renouncePauser();
        bndesRegistry.renouncePauser();

    }


}

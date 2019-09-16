pragma solidity ^0.5.0;

import "./Upgrader.sol";
import "./PreUpgrader.sol";
import "./LegalEntityMapping.sol";
import "./Storage.sol";
import "./BNDESRegistry.sol";
import "./Governance.sol";


contract Upgrader1 is Upgrader {

    PreUpgrader public preUpgrader;

    Storage public storageContract;
    LegalEntityMapping public legalEntityMapping;
    BNDESRegistry public bndesRegistry;

    constructor (address preUpgraderAddr) public {
        preUpgrader = PreUpgrader(preUpgraderAddr);
    }

    modifier onlyGovernance() {
        require(preUpgrader.getGovernanceAddr()==msg.sender, "This function can only be executed by the Governance");
        _;
    }

    function upgrade () external onlyGovernance {

        address governanceAddr = preUpgrader.getGovernanceAddr();
        Governance governance = Governance (governanceAddr);
        address upgraderInfoAddr = governance.getUpgraderInfoAddr();

        storageContract = new Storage(upgraderInfoAddr);
        legalEntityMapping = new LegalEntityMapping(upgraderInfoAddr, address(storageContract));
        bndesRegistry = new BNDESRegistry(upgraderInfoAddr, address(legalEntityMapping));

        storageContract.addHandler(address(legalEntityMapping));
        legalEntityMapping.addHandler(address(bndesRegistry));

        Resolver resolver = Resolver(preUpgrader.getResolverAddr());
        resolver.changeContract("BNDESRegistry", address(bndesRegistry));
       
        storageContract.renouncePauser();
        legalEntityMapping.renouncePauser();
        bndesRegistry.renouncePauser();

    }



    //TODO: gets
}

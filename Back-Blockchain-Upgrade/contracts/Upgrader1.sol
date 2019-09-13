pragma solidity ^0.5.0;

import "./Upgrader.sol";
import "./Upgrader0.sol";
import "./LegalEntityMapping.sol";
import "./Storage.sol";
import "./BNDESRegistry.sol";
import "./IChangeDataContract.sol";
import "./BNDESGovernance.sol";


contract Upgrader1 is Upgrader {

    Upgrader0 public upgrader0;

    Storage public storageContract;
    LegalEntityMapping public legalEntityMapping;
    BNDESRegistry public bndesRegistry;

    constructor () public {

        //TODO: Ajeitar
        upgrader0 = Upgrader0(address(0));
    }

    modifier onlyGovernance() {
        require(upgrader0.getBNDESGovernanceAddr()==msg.sender, "This function can only be executed by the Governance");
        _;
    }

    function upgrade () external onlyGovernance {

        address upgraderInfoAddr = upgrader0.getUpgraderInfoAddr();

        storageContract = new Storage(upgraderInfoAddr);
        legalEntityMapping = new LegalEntityMapping(upgraderInfoAddr, address(storageContract));
        bndesRegistry = new BNDESRegistry(upgraderInfoAddr, address(legalEntityMapping));

        storageContract.addHandler(address(legalEntityMapping));
        legalEntityMapping.addHandler(address(bndesRegistry));

        Resolver resolver = Resolver(upgrader0.getResolverAddr());
        resolver.changeContract("BNDESRegistry", address(bndesRegistry));
       
        storageContract.addPauser(upgrader0.getAdminOfNewContractsAddr());
        legalEntityMapping.addPauser(upgrader0.getAdminOfNewContractsAddr());
        bndesRegistry.addPauser(upgrader0.getAdminOfNewContractsAddr());
        
        storageContract.renouncePauser();
        legalEntityMapping.renouncePauser();
        bndesRegistry.renouncePauser();

    }

}

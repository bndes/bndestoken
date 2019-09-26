pragma solidity ^0.5.0;

import "../appGovernanceUpgrade/Governance.sol";
import "../appGovernanceUpgrade/Resolver.sol";


contract PreUpgrader {

    address public governanceAddr;
    address public resolverAddr;

    constructor(address ownerOfGovernanceAddr, address adminOfNewContractsAddr, uint[] memory governanceMembersId) public {

        Governance governance = new Governance(adminOfNewContractsAddr, governanceMembersId);
        governance.transferOwnership(ownerOfGovernanceAddr);
        governance.addPauser(adminOfNewContractsAddr);
        governance.renouncePauser();
        governanceAddr = address(governance);


        Resolver resolver = new Resolver(governance.getUpgraderInfoAddr());
        resolver.renouncePauser();
        resolverAddr = address(resolver);
    }

}

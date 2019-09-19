pragma solidity ^0.5.0;

import "./Governance.sol";
import "./Resolver.sol";


contract PreUpgrader {

    address public governanceAddr;
    address public resolverAddr;
 

    constructor(address ownerOfGovernanceAddr, address adminOfNewContractsAddr, uint[] memory governanceMembersId) public {

        Governance governance = new Governance(adminOfNewContractsAddr, governanceMembersId);
        governance.transferOwnership(ownerOfGovernanceAddr);
        governance.renouncePauser();
        governanceAddr = address(governance);


        Resolver resolver = new Resolver(governance.getUpgraderInfoAddr());
        resolver.renouncePauser();
        resolverAddr = address(resolver);
    }

}

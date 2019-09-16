pragma solidity ^0.5.0;

import "./Governance.sol";
import "./Resolver.sol";


contract PreUpgrader {

    Governance public governance;
    Resolver public resolver;

    constructor(address ownerOfGovernanceAddr, address adminOfNewContractsAddr) public {

        governance = new Governance(adminOfNewContractsAddr);
        governance.transferOwnership(ownerOfGovernanceAddr);
        governance.renouncePauser();

        resolver = new Resolver(governance.getUpgraderInfoAddr());
        resolver.renouncePauser();
    }

    function getGovernanceAddr() public view returns(address) {
        return address(governance);
    }

    function getResolverAddr() public view returns (address) {
        return address(resolver);
    }


}

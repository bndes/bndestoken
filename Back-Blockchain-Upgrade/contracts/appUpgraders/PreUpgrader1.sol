pragma solidity ^0.5.0;

import "../appGovernanceUpgrade/Governance.sol";


contract PreUpgrader1 {

    address private _governanceAddr;

    //owner and admin must be different
    constructor(address ownerOfGovernanceAddr, address adminOfNewContractsAddr, uint[] memory governanceMembersId, address resposibleForAssigningGovernanceMembers) public {

        Governance governance = new Governance(adminOfNewContractsAddr, governanceMembersId, resposibleForAssigningGovernanceMembers);
        governance.addPauser(ownerOfGovernanceAddr);
        if (ownerOfGovernanceAddr!=adminOfNewContractsAddr) {
            governance.addPauser(adminOfNewContractsAddr);
        }
        governance.renouncePauser();
        governance.transferOwnership(ownerOfGovernanceAddr);
        _governanceAddr = address(governance);

    }

    function governanceAddr() public view returns (address) {
        return _governanceAddr;
    }

}
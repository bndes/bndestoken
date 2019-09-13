pragma solidity ^0.5.0;

import "./BNDESGovernance.sol";
import "./Upgrader.sol";
import "./Resolver.sol";


contract Upgrader0 is Upgrader {

    BNDESGovernance public bndesGovernance;
    address public adminOfNewContractsAddr;
    Resolver public resolver;

    constructor() public {

        //TODO: esses 2 endereços seriam fixos (e nao msg.sender) para que a estrutura de governanca aprovar!!!!

        bndesGovernance = new BNDESGovernance();
        address ownerOfGovernanceAddr = msg.sender;
        bndesGovernance.transferOwnership(ownerOfGovernanceAddr);
        
        adminOfNewContractsAddr = msg.sender;
        bndesGovernance.addPauser(adminOfNewContractsAddr);
        bndesGovernance.renouncePauser();

        resolver = new Resolver(bndesGovernance.getUpgraderInfoAddr());
        resolver.addPauser(adminOfNewContractsAddr);
        resolver.renouncePauser();
    }

    function getBNDESGovernanceAddr() public returns(address) {
        return address(bndesGovernance);
    }

    function getUpgraderInfoAddr() public returns (address) {
        return bndesGovernance.getUpgraderInfoAddr();
    }

    function getAdminOfNewContractsAddr() public returns (address) {
        return adminOfNewContractsAddr;
    }

    function getResolverAddr() public returns (address) {
        return address(resolver);
    }

    function upgrade () external {
    }

}

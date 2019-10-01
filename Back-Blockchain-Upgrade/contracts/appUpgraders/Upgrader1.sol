pragma solidity ^0.5.0;

import "../appGovernanceUpgrade/Upgrader.sol";
import "../appGovernanceUpgrade/Governance.sol";
import "../appGovernanceUpgrade/Storage.sol";

import "./PreUpgrader2.sol";
import "../LegalEntityMapping.sol";
import "../BNDESRegistry.sol";


contract Upgrader1 is Upgrader {

    //Variables from previous Migration
    address private _governanceAddr;
    address private _resolverAddr;

    //New variables
    address private _storageContractAddr;
    address private _legalEntityMappingAddr;
    address private _bndesRegistryAddr;

    constructor (address preUpgraderAddr2) public {
        PreUpgrader2 preUpgrader2 = PreUpgrader2(preUpgraderAddr2);
        _governanceAddr = preUpgrader2.governanceAddr();
        _resolverAddr = preUpgrader2.resolverAddr();
    }

    modifier onlyGovernance() {
        require(_governanceAddr==msg.sender, "This function can only be executed by the Governance");
        _;
    }

    function upgrade () external onlyGovernance {

        Governance governance = Governance (_governanceAddr);
        address upgraderInfoAddr = governance.upgraderInfoAddr();
        UpgraderInfo ui = UpgraderInfo(upgraderInfoAddr);

        Storage storageContract = new Storage(upgraderInfoAddr);
        _storageContractAddr = address(storageContract);
        
        //Owner is a pausable because it enables him to remove other pausers
        storageContract.addPauser(governance.owner());
        storageContract.addPauser(ui.adminAddr());
        storageContract.renouncePauser();


        LegalEntityMapping legalEntityMapping = new LegalEntityMapping(upgraderInfoAddr,_storageContractAddr);
        _legalEntityMappingAddr = address(legalEntityMapping);
        legalEntityMapping.addPauser(governance.owner());
        legalEntityMapping.addPauser(ui.adminAddr());
        legalEntityMapping.renouncePauser();


        BNDESRegistry bndesRegistry = new BNDESRegistry(upgraderInfoAddr, _legalEntityMappingAddr);
        _bndesRegistryAddr = address(bndesRegistry);
        bndesRegistry.addPauser(_resolverAddr);
        bndesRegistry.addPauser(governance.owner());
        bndesRegistry.addPauser(ui.adminAddr());
        bndesRegistry.renouncePauser();

        governance.setIdRegistryAddr(address(bndesRegistry));

        storageContract.addHandler(_legalEntityMappingAddr);
        legalEntityMapping.addHandler(_bndesRegistryAddr);

        Resolver resolver = Resolver(_resolverAddr);
        resolver.changeContract("BNDESRegistry", _bndesRegistryAddr);
    }

    function governanceAddr() public view returns (address) {
        return _governanceAddr;
    }

    function resolverAddr() public view returns (address) {
        return _resolverAddr;
    }

    function storageContractAddr() public view returns (address) {
        return _storageContractAddr;
    }
    function legalEntityMappingAddr() public view returns (address) {
        return _legalEntityMappingAddr;
    }
    function bndesRegistryAddr() public view returns (address) {
        return _bndesRegistryAddr;
    }


}

pragma solidity ^0.5.0;

import "../appGovernanceUpgrade/Upgrader.sol";
import "../appGovernanceUpgrade/Governance.sol";
import "../appGovernanceUpgrade/Storage.sol";

import "./PreUpgrader3A.sol";
import "../LegalEntityMapping.sol";
import "../BNDESRegistry.sol";


contract PreUpgrader3B is Upgrader {

    PreUpgrader3A preUpgrader3A;
    
    //Variables from previous Migration
    address private _governanceAddr;
    address private _resolverAddr;

    //New variables
    address private _storageContractAddr;
    address private _legalEntityMappingAddr;
    address private _bndesRegistryAddr;

    constructor (address preUpgraderAddr3A) public {
        preUpgrader3A = PreUpgrader3A(preUpgraderAddr3A);
        _governanceAddr = preUpgrader3A.governanceAddr();
        _resolverAddr = preUpgrader3A.resolverAddr();
        _storageContractAddr = preUpgrader3A.storageContractAddr();

    }

    modifier onlyGovernance() {
        require(_governanceAddr==msg.sender, "Upgrader 3B - This function can only be executed by the Governance");
        _;
    }

    function upgrade () external onlyGovernance {

        //These variables were created after by preUpgrader3A
        _legalEntityMappingAddr = preUpgrader3A.legalEntityMappingAddr();
        _bndesRegistryAddr = preUpgrader3A.bndesRegistryAddr();

        Governance governance = Governance (_governanceAddr);
        Storage storageContract = Storage(_storageContractAddr);
        LegalEntityMapping legalEntityMapping = LegalEntityMapping(_legalEntityMappingAddr);

        //Very important: The governance now knows how to identify the governance members
        governance.setIdRegistryAddr(_bndesRegistryAddr);

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

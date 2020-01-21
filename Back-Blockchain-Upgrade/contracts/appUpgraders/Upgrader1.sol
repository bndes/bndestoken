pragma solidity ^0.5.0;

import "../appGovernanceUpgrade/Upgrader.sol";
import "../appGovernanceUpgrade/Governance.sol";
import "../appGovernanceUpgrade/Storage.sol";

import {PreUpgrader3B as LastUpgrader} from './PreUpgrader3B.sol';
import "../LegalEntityMapping.sol";
import "../BNDESRegistry.sol";


contract Upgrader1 is Upgrader {

    LastUpgrader lastUpgrader;
    
    //Variables from previous Migration
    address private _governanceAddr;
    address private _resolverAddr;
    address private _storageContractAddr;
    address private _legalEntityMappingAddr;
    address private _bndesRegistryAddr;

    constructor (address lastUpgraderAddr) public {
        lastUpgrader = LastUpgrader(lastUpgraderAddr);
        _governanceAddr = lastUpgrader.governanceAddr();
        _resolverAddr = lastUpgrader.resolverAddr();
        _storageContractAddr = lastUpgrader.storageContractAddr();
        _legalEntityMappingAddr = lastUpgrader.legalEntityMappingAddr();
        _bndesRegistryAddr = lastUpgrader.bndesRegistryAddr();

    }

    modifier onlyGovernance() {
        require(_governanceAddr==msg.sender, "Upgrader 1 - This function can only be executed by the Governance");
        _;
    }

    function upgrade () external onlyGovernance {

        Governance governance = Governance (_governanceAddr);
        Storage storageContract = Storage(_storageContractAddr);
        LegalEntityMapping legalEntityMapping = LegalEntityMapping(_legalEntityMappingAddr);

        //Change a data in storage
        

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

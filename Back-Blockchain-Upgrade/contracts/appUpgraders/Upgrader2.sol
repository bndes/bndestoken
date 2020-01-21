pragma solidity ^0.5.0;

import "../appGovernanceUpgrade/Upgrader.sol";
import "../appGovernanceUpgrade/Governance.sol";
import "../appGovernanceUpgrade/Storage.sol";

import {Upgrader1 as LastUpgrader} from './Upgrader1.sol';
import "../LegalEntityMapping.sol";
import "../LegalEntityMapping2.sol";
import "../BNDESRegistry.sol";


contract Upgrader2 is Upgrader {

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
        require(_governanceAddr==msg.sender, "Upgrader 2 - This function can only be executed by the Governance");
        _;
    }

    function upgrade () external onlyGovernance {

        Governance governance = Governance (_governanceAddr);
        address upgraderInfoAddr = governance.upgraderInfoAddr();
        UpgraderInfo ui = UpgraderInfo(upgraderInfoAddr);
        BNDESRegistry bndesRegistry = BNDESRegistry(_bndesRegistryAddr);
        Storage storageContract = Storage(_storageContractAddr);
        LegalEntityMapping legalEntityMapping = LegalEntityMapping(_legalEntityMappingAddr);

        LegalEntityMapping2 legalEntityMapping2 = new LegalEntityMapping2(upgraderInfoAddr,_storageContractAddr);
        address _legalEntityMappingAddr2 = address(legalEntityMapping2);
        legalEntityMapping2.addPauser(governance.owner());
        if (governance.owner()!=ui.adminAddr()) {
            legalEntityMapping2.addPauser(ui.adminAddr());
        }
        legalEntityMapping2.renouncePauser();

        bndesRegistry.setLegalEntityMapping(_legalEntityMappingAddr2);

        storageContract.addHandler(_legalEntityMappingAddr2);
        legalEntityMapping2.addHandler(_bndesRegistryAddr);

        storageContract.removeHandler(_legalEntityMappingAddr);
        legalEntityMapping.pause();
       
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

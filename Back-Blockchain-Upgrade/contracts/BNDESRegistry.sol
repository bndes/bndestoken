pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";

import "./appGovernanceUpgrade/IdRegistry.sol";
import "./appGovernanceUpgrade/Updatable.sol";

import "./LegalEntityMapping.sol";

contract BNDESRegistry is Updatable, IdRegistry {

    LegalEntityMapping private legalEntityMapping;

    event evnDebug (address addr, uint cnpj);

    constructor (address upgraderInfo, address legalEntityMappingAddr) Updatable (upgraderInfo) public {
        legalEntityMapping = LegalEntityMapping(legalEntityMappingAddr);
    }

    function setLegalEntityMapping (address newAddr) public onlyAllowedUpgrader {
        legalEntityMapping = LegalEntityMapping(newAddr);
    }

    function getLegalEntity (address addr) internal returns (LegalEntityMapping) {
        legalEntityMapping.setAddrLegalEntityToPoint(addr);
        return legalEntityMapping;
    }

    function registryLegalEntity(uint64 cnpj) public {
        getLegalEntity(msg.sender).setCNPJ(cnpj);
        emit evnDebug(msg.sender, cnpj);
    }

    function getCNPJ(address addr) public returns (uint) {
        uint cnpj = getLegalEntity(addr).getCNPJ();
        emit evnDebug(addr, cnpj);
        return cnpj;
    }

    //Implemented because of IdRegistry
    function getId(address addr) external returns (uint) {
        getCNPJ(addr);
    }

    function kill () external onlyAllowedUpgrader {
        selfdestruct(address(0));
    }

}
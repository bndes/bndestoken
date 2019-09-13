pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "./Updatable.sol";
import "./LegalEntityMapping.sol";

contract BNDESRegistry is Updatable {

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

}
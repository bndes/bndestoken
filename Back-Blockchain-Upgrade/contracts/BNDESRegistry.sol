pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "./LegalEntityMapping.sol";

contract BNDESRegistry is Pausable, Ownable() {

    LegalEntityMapping private legalEntityMapping;

    event evnDebug (address addr, uint cnpj);

    constructor (address legalEntityMappingAddr) public {
        legalEntityMapping = LegalEntityMapping(legalEntityMappingAddr);
    }

    //Using this method, it is possible to update legalEntityMapping
    function setLegalEntityMapping (address newAddr) public onlyOwner {
        legalEntityMapping = LegalEntityMapping(newAddr);
    }

    function getLegalEntity (address addr) internal returns (LegalEntityMapping) {
        legalEntityMapping.setAddrLegalEntity(addr);
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
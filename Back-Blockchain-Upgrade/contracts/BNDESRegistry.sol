pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";

import "./appGovernanceUpgrade/IdRegistry.sol";
import "./appGovernanceUpgrade/Updatable.sol";

import "./LegalEntityMapping.sol";

contract BNDESRegistry is Updatable, IdRegistry {

    LegalEntityMapping private legalEntityMapping;

    event evnRegistry (address addr, uint cnpj);

    constructor (address upgraderInfo, address legalEntityMappingAddr) Updatable (upgraderInfo) public {
        legalEntityMapping = LegalEntityMapping(legalEntityMappingAddr);
    }

    function setLegalEntityMapping (address newAddr) public onlyAllowedUpgrader {
        legalEntityMapping = LegalEntityMapping(newAddr);
    }

    function registryLegalEntity(uint64 cnpj) public {
        legalEntityMapping.setCNPJ(msg.sender, cnpj);
        emit evnRegistry(msg.sender, cnpj);
    }

    function getCNPJ(address addr) public view returns (uint) {
        return legalEntityMapping.getCNPJ(addr);
    }

    //Implemented because of IdRegistry
    function getId(address addr) external view returns (uint) {
        return getCNPJ(addr);
    }

    function kill() external onlyAllowedUpgrader {
        selfdestruct(address(0));
    }

}
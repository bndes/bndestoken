pragma solidity ^0.5.0;

import "./Storage.sol";

/*

    struct LegalEntityInfo {
        uint64 cnpj; //Brazilian identification of legal entity
        todo: add other attributes 
    } 
    //Links Ethereum addresses to LegalEntityInfo        
    mapping(address => LegalEntityInfo) public legalEntitiesInfo;

*/

contract LegalEntityMapping {

    Storage storageContract;
    address addrLegalEntity;

    constructor (address storageContractAddr) public {
        storageContract = Storage(storageContractAddr); 
    }

    function setAddrLegalEntity(address newAddr) public {
        addrLegalEntity = newAddr;
    }

    function getCNPJ() view public returns (uint) {
        bytes32 key = keccak256(abi.encodePacked("LegalEntityInfo",addrLegalEntity,"cnpj"));
        return storageContract.getUint(key);
    }

    function setCNPJ(uint cnpj) public {
        bytes32 key = keccak256(abi.encodePacked("LegalEntityInfo",addrLegalEntity,"cnpj"));
        storageContract.setUint(key, cnpj);
    }

}
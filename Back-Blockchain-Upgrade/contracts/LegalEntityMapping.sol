pragma solidity ^0.5.0;

import "./Storage.sol";
import "./UpdatableHandleable.sol";

/*

    struct LegalEntityInfo {
        uint64 cnpj; //Brazilian identification of legal entity
        todo: add other attributes 
    } 
    //Links Ethereum addresses to LegalEntityInfo        
    mapping(address => LegalEntityInfo) public legalEntitiesInfo;

*/

//TODO: avaliar se vale coloca-lo como atualizavel soh por causa do add do storage

contract LegalEntityMapping is UpdatableHandleable {

    Storage storageContract;
    address addrLegalEntityToPoint;

    constructor (address upgraderInfo,address storageContractAddr) UpdatableHandleable (upgraderInfo) public {
        storageContract = Storage(storageContractAddr);
    }

    function setAddrLegalEntityToPoint(address newAddr) public {
        addrLegalEntityToPoint = newAddr;
    }

    function getCNPJ() view public returns (uint) {
        bytes32 key = keccak256(abi.encodePacked("LegalEntityInfo",addrLegalEntityToPoint,"cnpj"));
        return storageContract.getUint(key);
    }

    function setCNPJ(uint cnpj) public onlyHandler {
        bytes32 key = keccak256(abi.encodePacked("LegalEntityInfo",addrLegalEntityToPoint,"cnpj"));
        storageContract.setUint(key, cnpj);
    }

}
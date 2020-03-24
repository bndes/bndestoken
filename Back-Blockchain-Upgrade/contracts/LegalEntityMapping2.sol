pragma solidity ^0.5.0;

import "./appGovernanceUpgrade/Storage.sol";
import "./appGovernanceUpgrade/UpdatableHandleable.sol";

/*

    struct LegalEntityInfo {
        uint64 cnpj; //Brazilian identification of legal entity
        todo: add other attributes 
    } 
    //Links Ethereum addresses to LegalEntityInfo        
    mapping(address => LegalEntityInfo) public legalEntitiesInfo;

*/

//TODO: avaliar se vale coloca-lo como atualizavel soh por causa do add do storage

contract LegalEntityMapping2 is UpdatableHandleable {

    Storage storageContract;

    constructor (address upgraderInfo, address storageContractAddr) UpdatableHandleable (upgraderInfo) public {
        storageContract = Storage(storageContractAddr);
    }

    function getCNPJ(address addrLegalEntity) view public returns (uint) {
        bytes32 key = keccak256(abi.encodePacked("LegalEntityInfo",addrLegalEntity,"cnpj"));
        return storageContract.getUint(key);
    }

    function setCNPJ(address addrLegalEntity, uint cnpj) public onlyHandler {
        bytes32 key = keccak256(abi.encodePacked("LegalEntityInfo",addrLegalEntity,"cnpj"));
        storageContract.setUint(key, cnpj);
    }

}
pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./LegalEntityMapping.sol";
import "./Storage.sol";
import "./BNDESRegistry.sol";


contract BNDESFactory is Ownable() {

    Storage public storageContract;
    LegalEntityMapping public legalEntityMapping;
    BNDESRegistry public bndesRegistry;

    constructor () public {
    }
    

    function createAll () public onlyOwner {
        storageContract = new Storage();
       
        legalEntityMapping = new LegalEntityMapping(address(storageContract));
        address legalEntityMappingAddr = address(legalEntityMapping);

        storageContract.addHandler(legalEntityMappingAddr);
        bndesRegistry = new BNDESRegistry(legalEntityMappingAddr);
        
    }

    function getOwnershipContracts() public onlyOwner {

        storageContract.transferOwnership(owner());
        bndesRegistry.transferOwnership(owner());
    }

    function changeLegalEntityMapping (address newLegalEntityAddr) public onlyOwner {

        storageContract.removeHandler(address(legalEntityMapping));
        storageContract.addHandler(newLegalEntityAddr);

        legalEntityMapping = LegalEntityMapping(newLegalEntityAddr);
        bndesRegistry.setLegalEntityMapping(newLegalEntityAddr);
        
    }

    
}
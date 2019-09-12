pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./LegalEntityMapping.sol";
import "./Storage.sol";
import "./BNDESRegistry.sol";
import "./BNDESResolver.sol";
import "./IChangeDataContract.sol";
import "./BNDESGovernance.sol";


//TODO: aspecto changes precisam receber o hash da mudança para verificar se foi aprovado  - onlyUnderApproval  
contract BNDESAdmin is Ownable() {

    Storage public storageContract;
    LegalEntityMapping public legalEntityMapping;

    BNDESRegistry public bndesRegistry;
    BNDESResolver public bndesResolver;
    BNDESGovernance public bndesGovernance;

    constructor () public {
    }
    

    function createAll () public onlyOwner {
        
        storageContract = new Storage();

        legalEntityMapping = new LegalEntityMapping(address(storageContract));
        address legalEntityMappingAddr = address(legalEntityMapping);

        storageContract.addHandler(legalEntityMappingAddr);
        bndesRegistry = new BNDESRegistry(legalEntityMappingAddr);

        bndesResolver = new BNDESResolver();
        bndesResolver.changeContract("BNDESRegistry", address(bndesRegistry));

        bndesGovernance = new BNDESGovernance(msg.sender);
        
    }

    function changeBNDESResolver (address newBndesResolverAddr) public onlyOwner {
        
        bndesResolver = BNDESResolver(newBndesResolverAddr);
        
    }


    //BNDESFactory needs to be the owner of the dataUpdater contract para chamar o update
    function changeData (address dataUpdaterAddr) public onlyOwner {
       
        storageContract.addHandler(dataUpdaterAddr);
        storageContract.setDataAvailable(false);
        IChangeDataContract iChangeDataContract = IChangeDataContract(dataUpdaterAddr);
        iChangeDataContract.updateData();
        storageContract.setDataAvailable(true);
        storageContract.removeHandler(dataUpdaterAddr);

    }


    function changeLegalEntityMapping (address newLegalEntityAddr) public onlyOwner {

        storageContract.removeHandler(address(legalEntityMapping));
        storageContract.addHandler(newLegalEntityAddr);

        legalEntityMapping = LegalEntityMapping(newLegalEntityAddr);
        bndesRegistry.setLegalEntityMapping(newLegalEntityAddr);
        
    }

    function changeBNDESRegistry (address newBNDESRegistryAddr) public onlyOwner {
        
        bndesRegistry.addPauser(address(bndesResolver));

        bndesRegistry = BNDESRegistry(newBNDESRegistryAddr);
        bndesResolver.changeContract("BNDESRegistry", newBNDESRegistryAddr);

        //mudar nos contratos que referenciam o bndesregistry 
        
    }


    function getOwnershipContracts() public onlyOwner {

        storageContract.transferOwnership(owner());
        bndesRegistry.transferOwnership(owner());
        bndesResolver.transferOwnership(owner());
    }

    function getOwnershipBNDESRegistry() public onlyOwner {
        bndesRegistry.transferOwnership(owner());
    }


    function pauseAll() public onlyOwner {
        bndesRegistry.pause();
    }
   
}
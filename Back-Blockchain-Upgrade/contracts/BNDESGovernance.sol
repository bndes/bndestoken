pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


contract BNDESGovernance is Ownable() {

    enum ChangeStateEnum { WAITING, APPROVED, REPROVED, CANCELED }

    struct ChangeDataStructure {
        
        //Addresses of contracts to be updated
        address[] contractsToBeUpdated;

        //Addresses of contracts to be updated
        address[] updatingContracts;

        //Addresses of new contracts
        address[] newContracts;

        //Addresses of contracts that change data
        address[] updatingDataContracts;
        
        //Address of multisig contract (if necessary)
        address decisionContract;

        ChangeStateEnum chageState;
    }

    //Mapping from (the hash of the change motivation) to (the data structure of this change)
    mapping (bytes32 => ChangeDataStructure) public governingChanges;

    address public governanceHandlerAddr;

    constructor (address _governanceHandlerAddr) {
        governanceHandlerAddr = _governanceHandlerAddr;
    }

    function setGovernanceHandlerAdd (address _governanceHandlerAddr) public onlyOwner {
        governanceHandlerAddr = _governanceHandlerAddr;
    }

    function createNewChange (bytes32 hashChangeMotivation, address[] contractsToBeUpdated, address[] updatingContracts,
        address[] newContracts, updatingDataContracts, boolean containsDecision) public onlyHandler {
            
            ChangeDataStructure cds;
            if (containsDecision) {
                cds = new ChangeDataStructure(contractsToBeUpdated, updatingContractsnewContracts, updatingDataContracts,
                                    address(0), ChangeStateEnum.WAITING);
            }
            else {
                cds = new ChangeDataStructure(contractsToBeUpdated, updatingContractsnewContracts, updatingDataContracts,
                                    address(0), ChangeStateEnum.APPROVED);
            }
            governingChanges[hashChangeMotivation] = cds;
    }





    function registryObserverGovernance(address observerAddr) external {

    }




    event notifyObservers();

    function isThereOpenedChangeToThisContract (bytes32 hashGoverningChange, address updatedContract) external {

    }


}
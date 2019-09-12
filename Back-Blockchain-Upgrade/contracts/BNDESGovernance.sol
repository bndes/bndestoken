pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


contract BNDESGovernance is Ownable() {

    enum ChangeStateEnum { WAITING, APPROVED, REPROVED, CANCELED }

    struct ChangeDataStructure {
        
        //Hash of the change motivation
        bytes32 hashMotivation;
        
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


    ChangeDataStructure[] public governingChanges;

    address public handlerAddr;


    /**
	 * Check if msg.sender is a Handler of this contract. It is used for setters.
	 * If fail, throw PermissionException.
	 */
	modifier onlyHandler {
		require(isHandler(), "Do not have the handler permission!");
		_;
	}  

    constructor (address _handlerAddr) public {
        handlerAddr = _handlerAddr;
    }

    /**
     * @return true if `msg.sender` is the handler of the contract.
     */
    function isHandler() public view returns (bool) {
        return msg.sender == handlerAddr;
    }

    function setHandler (address newAddr) public onlyOwner {
        handlerAddr = newAddr;
    }

    event notifyObservers();
    

    function createNewChange (bytes32 hashChangeMotivation, address[] memory contractsToBeUpdated, address[] memory updatingContracts,
        address[] memory newContracts, address[] memory updatingDataContracts, address decisionContract, bool containsDecision) public onlyHandler {
            
            //TODO: avaliar se é storage ou memory
            ChangeDataStructure memory cds;
            if (containsDecision) {
                cds = ChangeDataStructure(hashChangeMotivation, contractsToBeUpdated, updatingContracts, newContracts, updatingDataContracts,
                                    decisionContract, ChangeStateEnum.WAITING);
            }
            else {
                cds = ChangeDataStructure(hashChangeMotivation, contractsToBeUpdated, updatingContracts, newContracts, updatingDataContracts,
                                    address(0), ChangeStateEnum.APPROVED);
            }
            governingChanges.push(cds);
    }

//testar mudança do contrato para add new metodo - como fica na factory? quais são os limites do admin

    function approveChange (bytes32 hashChangeMotivation) public {

        //verify address of decision contract

        //checar que foi do contrato adequado
        emit notifyObservers(); //quais pontos deve avisar?

    }

    function repproveChange (bytes32 hashChangeMotivation) public {

        //verify address of decision contract

        emit notifyObservers(); //quais pontos deve avisar?
    }

    function cancelChange (bytes32 hashChangeMotivation) public {

        //verify address of decision contract or owner

        emit notifyObservers(); //quais pontos deve avisar?
    }

    function registryObserverGovernance(address observerAddr) external {

    }


    function isThereOpenedChangeToThisContract (bytes32 hashGoverningChange, address contractsToBeUpdated, 
            address updatingContract) external returns (bool) {

    }

    function isThereOpenedChangeToThisDataContract (bytes32 hashGoverningChange, address updatingDataContracts) 
        external returns (bool) {


    }

}
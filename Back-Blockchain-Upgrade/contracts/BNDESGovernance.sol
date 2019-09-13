pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "./UpgraderInfo.sol";
import "./Upgrader.sol";


contract BNDESGovernance is Pausable, Ownable() {

    enum ChangeState { WAITING, APPROVED, REPROVED, CANCELED, FINALIZED }

    struct ChangeDataStructure {
        
        //Hash of the change motivation
        bytes32 hashMotivation;
        
        //Address of upgrader contract
        address upgraderContractAddr;

        //Address of multisig contract (if necessary)
        address decisionContractAddr;

        ChangeState chageState;
    }


    ChangeDataStructure[] public governingChanges;

    UpgraderInfo public upgraderInfo;

    constructor () public {
        upgraderInfo = new UpgraderInfo();
    }

    function getUpgraderInfoAddr() public returns (address) {
        return upgraderInfo.getAllowedUpgraderAddr();
    }

    event notifyObservers();
    

    function createNewChange (bytes32 hashChangeMotivation, address upgraderContractAddr,
            address decisionContractAddr) public onlyOwner {
            
            //TODO: avaliar se é storage ou memory
            ChangeDataStructure memory cds;
            if (decisionContractAddr != address(0)) {
                cds = ChangeDataStructure(hashChangeMotivation, upgraderContractAddr,
                                    decisionContractAddr, ChangeState.WAITING);
            }
            else {
                cds = ChangeDataStructure(hashChangeMotivation, upgraderContractAddr,
                                    address(0), ChangeState.APPROVED);
                approveChange(hashChangeMotivation);
            }
            governingChanges.push(cds);
    }


    function approveChange (bytes32 hashChangeMotivation) public {

        //verify address of decision contract

        address upgraderContractAddr = address(0);


        upgraderInfo.setAllowedUpgrader(upgraderContractAddr);
        Upgrader upgrader = Upgrader(upgraderContractAddr);
        upgrader.upgrade();

        emit notifyObservers(); //quais pontos deve avisar?

    }

    function repproveChange (bytes32 hashChangeMotivation) public {

        //verify address of decision contract

        emit notifyObservers(); //quais pontos deve avisar?
    }

    function cancelChange (bytes32 hashChangeMotivation) public onlyOwner {

        //verify address of decision contract or owner

        emit notifyObservers(); //quais pontos deve avisar?
    }

    //todo: funcao de finalizar mudanca
            //remove atribuicao do admin



    function registryObserverGovernance(address observerAddr) external {

    }





}
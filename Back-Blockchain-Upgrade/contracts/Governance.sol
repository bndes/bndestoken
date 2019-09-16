pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "./GovernanceDecision.sol";
import "./UpgraderInfo.sol";
import "./Upgrader.sol";


contract Governance is Pausable, Ownable() {

    enum ChangeState { WAITING, APPROVED, DISAPPROVED, CANCELED, FINISHED }

    struct ChangeDataStructure {
        
        //Hash of the change motivation
        bytes32 hashChangeMotivation;
        
        //Address of upgrader contract
        address upgraderContractAddr;

        //Address of decision contract (if necessary)
        address decisionContractAddr;

        ChangeState changeState;
    }

    ChangeDataStructure[] public governingChanges;

    UpgraderInfo public upgraderInfo;

    constructor (address adminOfNewContractsAddr) public {
        addPauser(adminOfNewContractsAddr);
        upgraderInfo = new UpgraderInfo(adminOfNewContractsAddr);
    }

    function getUpgraderInfoAddr() public view returns (address) {
        return upgraderInfo.getAllowedUpgraderAddr();
    }

    event NewChangeCreated(uint changeNumber, bytes32 hashChangeMotivation, address upgraderContractAddr,
            address decisionContractAddr);
    event ChangeApproved(uint changeNumber);
    event ChangeExecuted(uint changeNumber);
    event ChangeDisapproved(uint changeNumber);
    event ChangeCancelled(uint changeNumber);
    

    function createNewChange (bytes32 hashChangeMotivation, address upgraderContractAddr,
            address decisionContractAddr) public onlyOwner {
            
            uint changeNumber = governingChanges.length;

            //TODO: avaliar se é storage ou memory
            ChangeDataStructure memory cds;
            if (decisionContractAddr != address(0)) {
                cds = ChangeDataStructure(hashChangeMotivation, upgraderContractAddr,
                        decisionContractAddr, ChangeState.WAITING);
                emit NewChangeCreated(changeNumber, hashChangeMotivation, upgraderContractAddr, decisionContractAddr);
                GovernanceDecision governanceDecision = GovernanceDecision(decisionContractAddr);
                governanceDecision.setChangeNumber(changeNumber);

            }
            else { //The owner decided by itself
                cds = ChangeDataStructure(hashChangeMotivation, upgraderContractAddr,
                                    address(0), ChangeState.APPROVED);
                emit NewChangeCreated(changeNumber, hashChangeMotivation, upgraderContractAddr, decisionContractAddr);
                cds.changeState = ChangeState.APPROVED;
                emit ChangeApproved(changeNumber);

            }
            governingChanges.push(cds);
            
    }

    function approveChangeWithDecisionContract (uint changeNumber) public {

        require (changeNumber<governingChanges.length, "Invalid change number");
        
        ChangeDataStructure memory cds = governingChanges[changeNumber];

        require(cds.changeState==ChangeState.WAITING, "A mudança precisa estar no estado WAITING");
        
        require(cds.decisionContractAddr==msg.sender, "A aprovação precisa ser chamada pelo contrato de decisão da mudança");

        cds.changeState = ChangeState.APPROVED;

        emit ChangeApproved(changeNumber);
    }

    function denyChangeWithDecisionContract (uint changeNumber) public {

        require (changeNumber<governingChanges.length, "Invalid change number");

        ChangeDataStructure memory cds = governingChanges[changeNumber];

        require(cds.changeState==ChangeState.WAITING, "A mudança precisa estar no estado de espera da decisão da mudança");
        
        require(cds.decisionContractAddr==msg.sender, "A aprovação precisa ser chamada pelo contrato de decisão da mudança");

        cds.changeState = ChangeState.DISAPPROVED;

        emit ChangeDisapproved(changeNumber);
    }


    function executeChange (uint changeNumber) public {

        require (changeNumber<governingChanges.length, "Invalid change number");

        require (upgraderInfo.isAdmin(), "A mudança só pode ser executada pelo admin da governança");

        ChangeDataStructure memory cds = governingChanges[changeNumber];

        require(cds.changeState==ChangeState.APPROVED, "A mudança precisa estar no estado aprovada");

        address upgraderContractAddr = cds.upgraderContractAddr;
        upgraderInfo.setAllowedUpgrader(upgraderContractAddr);
        Upgrader upgrader = Upgrader(upgraderContractAddr);
        upgrader.upgrade();

        cds.changeState = ChangeState.FINISHED;

        emit ChangeExecuted(changeNumber);
    }


    function cancelChange (uint changeNumber) public onlyOwner {

        require (changeNumber<governingChanges.length, "Invalid change number");

        ChangeDataStructure memory cds = governingChanges[changeNumber];

        require(cds.changeState==ChangeState.WAITING || cds.changeState==ChangeState.APPROVED,
            "A mudança precisa estar no estado de espera da decisão da mudança ou aprovada");

        cds.changeState = ChangeState.CANCELED;

        emit ChangeCancelled(changeNumber);
    }

    function getChange(uint changeNumber) public returns (bytes32, address, address, ChangeState) {
        ChangeDataStructure memory cds = governingChanges[changeNumber];
        return (cds.hashChangeMotivation, cds.upgraderContractAddr, cds.decisionContractAddr, cds.changeState);
    }


 }
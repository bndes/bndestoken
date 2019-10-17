pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";

import "./GovernanceDecision.sol";
import "./UpgraderInfo.sol";
import "./Upgrader.sol";
import "./IdRegistry.sol";


contract Governance is Pausable, Ownable() {

    enum ChangeState { WAITING, APPROVED, EXECUTING, DISAPPROVED, CANCELED, FINISHED }

    struct ChangeDataStructure {
        
        //Hash of the change motivation
        bytes32 hashChangeMotivation;
        
        //Address of upgrader contract
        address[] upgraderContractsAddr;

        //Stores the next executed upgrader of this change data structure - it will finish with upgraderContractsAddr.lenght
        uint upgraderContractToBeExecutedIndex;

        //Address of decision contract (if necessary)
        address decisionContractAddr;

        ChangeState changeState;
    }

    ChangeDataStructure[] private governingChanges;
    uint[] governanceMembersId;

    UpgraderInfo private upgraderInfo;
    IdRegistry private idRegistry;

    modifier onlyAllowedUpgrader() {
        require(upgraderInfo.isAllowedUpgrader(msg.sender), "This function can only be executed by Upgraders");
        _;
    }

    constructor (address adminOfNewContractsAddr, uint[] memory initialGovernanceMembersId) public {
        upgraderInfo = new UpgraderInfo(adminOfNewContractsAddr);
        governanceMembersId = initialGovernanceMembersId;
    }

    //TODO: metodos para mudar governanceMembersId por um novo papel

    //It is necessary to call this function before any governance decision
    function setIdRegistryAddr(address idRegistryAddr) public onlyAllowedUpgrader {
        idRegistry = IdRegistry(idRegistryAddr);
    }

    event NewChangeCreated(uint changeNumber, bytes32 hashChangeMotivation, address[] upgraderContractsAddr,
            address decisionContractAddr);
    event ChangeApproved(uint changeNumber);
    event ChangePartialExecuted(uint changeNumber, uint index);
    event ChangeExecuted(uint changeNumber);
    event ChangeDisapproved(uint changeNumber);
    event ChangeCancelled(uint changeNumber);
    

    function createNewChange (bytes32 hashChangeMotivation, address[] memory upgraderContractsAddr,
            uint256 percentageDecision) public onlyOwner {
            
            uint changeNumber = governingChanges.length;

            ChangeDataStructure memory cds;
            if (percentageDecision != 0) {
                GovernanceDecision governanceDecision = new GovernanceDecision(governanceMembersId, percentageDecision, address(idRegistry), changeNumber);
                cds = ChangeDataStructure(hashChangeMotivation, upgraderContractsAddr, 0,
                        address(governanceDecision), ChangeState.WAITING);
                emit NewChangeCreated(changeNumber, hashChangeMotivation, upgraderContractsAddr, address(governanceDecision));

            }
            else { //The owner decided by itself
                cds = ChangeDataStructure(hashChangeMotivation, upgraderContractsAddr, 0,
                                    address(0), ChangeState.APPROVED);
                emit NewChangeCreated(changeNumber, hashChangeMotivation, upgraderContractsAddr, address(0));
                cds.changeState = ChangeState.APPROVED;
                emit ChangeApproved(changeNumber);

            }
            governingChanges.push(cds);
    }

	function makeResult(uint changeNumber) public onlyOwner returns(bool) {

        require (changeNumber<governingChanges.length, "Invalid change number");
        
        ChangeDataStructure memory cds = governingChanges[changeNumber];

        require(cds.changeState==ChangeState.WAITING, "The change needs to be in WAITING state");

        GovernanceDecision governanceDecision = GovernanceDecision(cds.decisionContractAddr);

        if (governanceDecision.makeResult()) {
           
            governingChanges[changeNumber].changeState = ChangeState.APPROVED;
            emit ChangeApproved(changeNumber);
            return true;
        }
		else {

            governingChanges[changeNumber].changeState = ChangeState.DISAPPROVED;
            emit ChangeDisapproved(changeNumber);
			return false;
		}

	}

    function executeChange (uint changeNumber) public {
        executeChange(changeNumber, 0);
    }

    function executeChange (uint changeNumber, uint index) public {

        require (changeNumber<governingChanges.length, "Invalid change number");

        require (upgraderInfo.isAdmin(msg.sender), "The change needs to be executed by Admin");

        ChangeDataStructure memory cds = governingChanges[changeNumber];

        require(cds.changeState==ChangeState.APPROVED || cds.changeState==ChangeState.EXECUTING,
            "The change needs to be in APPROVED or in EXECUTING state");

        address[] memory upgraderContractsAddr = cds.upgraderContractsAddr;

        require (index < upgraderContractsAddr.length, "index must be lower than the total size of Upgraders");
        require (!(index < cds.upgraderContractToBeExecutedIndex), "index belongs to a change that was already executed");
        require (!(index > cds.upgraderContractToBeExecutedIndex), "it is necessary to execute an upgrader with lower index first");

        address upgraderAddr = upgraderContractsAddr[index];
        upgraderInfo.setAllowedUpgrader(upgraderAddr);
        Upgrader upgrader = Upgrader(upgraderAddr);
        upgrader.upgrade();
        cds.upgraderContractToBeExecutedIndex++;

        if (cds.upgraderContractToBeExecutedIndex < upgraderContractsAddr.length) { //still need to execute more changes
            emit ChangePartialExecuted(changeNumber, index);
            if (governingChanges[changeNumber].changeState == ChangeState.APPROVED) {
                governingChanges[changeNumber].changeState = ChangeState.EXECUTING;
            }
        }
        
        else if (cds.upgraderContractToBeExecutedIndex == upgraderContractsAddr.length) {
            governingChanges[changeNumber].changeState = ChangeState.FINISHED;
            emit ChangeExecuted(changeNumber);
        }
    }


    function cancelChange (uint changeNumber) public onlyOwner {

        require (changeNumber<governingChanges.length, "Invalid change number");

        ChangeDataStructure memory cds = governingChanges[changeNumber];

        require(cds.changeState==ChangeState.WAITING || cds.changeState==ChangeState.APPROVED || cds.changeState==ChangeState.EXECUTING,
            "The change needs to be in WAITING or APPROVED or EXECUTING state");

        governingChanges[changeNumber].changeState = ChangeState.CANCELED;

        //TODO: cancelar no contrato de decisão

        emit ChangeCancelled(changeNumber);
    }

    function getChange(uint changeNumber) public view returns (bytes32, address[] memory, uint, address, ChangeState) {

        require (changeNumber<governingChanges.length, "Invalid change number");

        ChangeDataStructure memory cds = governingChanges[changeNumber];
        return (cds.hashChangeMotivation, cds.upgraderContractsAddr, cds.upgraderContractToBeExecutedIndex,
                cds.decisionContractAddr, cds.changeState);

    }

    //This function should not be called alone. In order to change the admin, it is necessary to change the pausables.
    function setAdminAddr (address newAddr) public onlyAllowedUpgrader {
        upgraderInfo.setAdminAddr(newAddr);
    }

    function upgraderInfoAddr() public view returns (address)  {
        return address(upgraderInfo);
    }

    function idRegistryAddr() public view returns (address) {
        return address(idRegistry);
    }

   
 }
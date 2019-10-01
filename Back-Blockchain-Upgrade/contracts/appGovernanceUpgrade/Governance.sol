pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";

import "./GovernanceDecision.sol";
import "./UpgraderInfo.sol";
import "./Upgrader.sol";
import "./IdRegistry.sol";


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

    ChangeDataStructure[] private governingChanges;
    uint[] governanceMembersId;

    UpgraderInfo private upgraderInfo;
    IdRegistry private idRegistry;

    modifier onlyAllowedUpgrader() {
        require(upgraderInfo.isAllowedUpgrader(), "This function can only be executed by Upgraders");
        _;
    }

    constructor (address adminOfNewContractsAddr, uint[] memory initialGovernanceMembersId) public {
        upgraderInfo = new UpgraderInfo(adminOfNewContractsAddr);
        governanceMembersId = initialGovernanceMembersId;
    }

    //TODO: metodos para mudar governanceMembersId

    //It is necessary to call this function before any governance decision
    function setIdRegistryAddr(address idRegistryAddr) public onlyAllowedUpgrader {
        idRegistry = IdRegistry(idRegistryAddr);
    }

    event NewChangeCreated(uint changeNumber, bytes32 hashChangeMotivation, address upgraderContractAddr,
            address decisionContractAddr);
    event ChangeApproved(uint changeNumber);
    event ChangeExecuted(uint changeNumber);
    event ChangeDisapproved(uint changeNumber);
    event ChangeCancelled(uint changeNumber);
    

    function createNewChange (bytes32 hashChangeMotivation, address upgraderContractAddr,
            uint256 percentageDecision) public onlyOwner {
            
            uint changeNumber = governingChanges.length;

            ChangeDataStructure memory cds;
            if (percentageDecision != 0) {
                GovernanceDecision governanceDecision = new GovernanceDecision(governanceMembersId, percentageDecision, address(idRegistry), changeNumber);
                cds = ChangeDataStructure(hashChangeMotivation, upgraderContractAddr,
                        address(governanceDecision), ChangeState.WAITING);
                emit NewChangeCreated(changeNumber, hashChangeMotivation, upgraderContractAddr, address(governanceDecision));

            }
            else { //The owner decided by itself
                cds = ChangeDataStructure(hashChangeMotivation, upgraderContractAddr,
                                    address(0), ChangeState.APPROVED);
                emit NewChangeCreated(changeNumber, hashChangeMotivation, upgraderContractAddr, address(0));
                cds.changeState = ChangeState.APPROVED;
                emit ChangeApproved(changeNumber);

            }
            governingChanges.push(cds);
    }

	function makeResult(uint changeNumber) public onlyOwner returns(bool) {

        require (changeNumber<governingChanges.length, "Invalid change number");
        
        ChangeDataStructure memory cds = governingChanges[changeNumber];

        require(cds.changeState==ChangeState.WAITING, "A mudança precisa estar no estado WAITING");

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

        require (changeNumber<governingChanges.length, "Invalid change number");

        require (upgraderInfo.isAdmin(msg.sender), "A mudança só pode ser executada pelo admin da governança");

        ChangeDataStructure memory cds = governingChanges[changeNumber];

        require(cds.changeState==ChangeState.APPROVED, "A mudança precisa estar no estado aprovada");

        address upgraderContractAddr = cds.upgraderContractAddr;
        upgraderInfo.setAllowedUpgrader(upgraderContractAddr);
        Upgrader upgrader = Upgrader(upgraderContractAddr);
        upgrader.upgrade();

        governingChanges[changeNumber].changeState = ChangeState.FINISHED;

        emit ChangeExecuted(changeNumber);
    }


    function cancelChange (uint changeNumber) public onlyOwner {

        require (changeNumber<governingChanges.length, "Invalid change number");

        ChangeDataStructure memory cds = governingChanges[changeNumber];

        require(cds.changeState==ChangeState.WAITING || cds.changeState==ChangeState.APPROVED,
            "A mudança precisa estar no estado de espera da decisão da mudança ou aprovada");

        governingChanges[changeNumber].changeState = ChangeState.CANCELED;

        //TODO: cancelar no contrato de decisão

        emit ChangeCancelled(changeNumber);
    }

    function getChange(uint changeNumber) public view returns (bytes32, address, address, ChangeState) {
        ChangeDataStructure memory cds = governingChanges[changeNumber];
        return (cds.hashChangeMotivation, cds.upgraderContractAddr, cds.decisionContractAddr, cds.changeState);
    }

    //This function should not be called alone. In order to change the admin, it is necessary to change the pausables.
    function setAdminAddr (address newAddr) public {
        require(upgraderInfo.isAllowedUpgrader(), "This function can only be executed by Upgraders");
        upgraderInfo.setAdminAddr(newAddr);
    }

    function upgraderInfoAddr() public view returns (address) {
        return address(upgraderInfo);
    }

    function idRegistryAddr() public view returns (address) {
        return address(idRegistry);
    }

//teste
/*
    function retorna1() public pure returns (uint) {
        return 1;
    }
    
    uint public test = 1;
*/    
 }
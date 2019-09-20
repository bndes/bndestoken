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

    uint[] governanceMembersId;
    IdRegistry private idRegistry;

    constructor (address adminOfNewContractsAddr, uint[] memory _governanceMembersId) public {
        addPauser(adminOfNewContractsAddr);
        upgraderInfo = new UpgraderInfo(adminOfNewContractsAddr);
        governanceMembersId = _governanceMembersId;
    }

    //TODO: metodos para mudar governanceMembersId

    function setIdRegistryAddr(address idRegistryAddr) public onlyOwner {
        idRegistry = IdRegistry(idRegistryAddr);
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
           
            cds.changeState = ChangeState.APPROVED;
            emit ChangeApproved(changeNumber);
            return true;
        }
		else {

            cds.changeState = ChangeState.DISAPPROVED;
            emit ChangeDisapproved(changeNumber);
			return false;
		}

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

        //TODO: cancelar no contrato de decisão

        emit ChangeCancelled(changeNumber);
    }

    function getChange(uint changeNumber) public view returns (bytes32, address, address, ChangeState) {
        ChangeDataStructure memory cds = governingChanges[changeNumber];
        return (cds.hashChangeMotivation, cds.upgraderContractAddr, cds.decisionContractAddr, cds.changeState);
    }


 }
pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./Governance.sol";

/**
 * The upgrader works in following steps:
 *   1. Call startProposal() to start the voting process;
 *   2. Call getResolution() before the expiration;
 *   3. Upgrade succeed or proposal is expired.
 *    * Function done() can be called at any time to let upgrader destruct itself.
 *    * Function status() can be called at any time to show caller status of the upgrader.
 */
contract GovernanceDecision is Ownable() {

	using SafeMath for uint256;

	uint private changeNumber;

	address private governanceAddr;


	/** Marker */
	enum UpgraderStatus {
		Preparing,
		Voting,
		Success,
		Expired,
		End
	}
	UpgraderStatus public status;

	/** Voting mechanism related */
	uint256 private percentage;
	mapping(address => bool) public voting;
	mapping(address => bool) private voterRegistered;
	uint256 private numOfVoters = 0;
	uint256 private numOfAgreements = 0;

    uint256 private proposalBlockNumber;
	uint256 private proposalPeriod;

	/**
	 * Check if the proposal is expired.
	 * If so, contract would be marked as expired.
	 *
	 * exception	PreparingUpgraderException	proposal has not been started.
	 * exception	ReupgradingException	upgrading has been done.
	 * exception	ExpirationException	proposal is expired.
	 */
	modifier notExpired {

        if (proposalBlockNumber.add(proposalPeriod) < block.number) {
				status = UpgraderStatus.Expired;
		}
		require(status != UpgraderStatus.Preparing, "Invalid proposal!");
		require(status != UpgraderStatus.Success, "Upgrading has been done!");
		require(status != UpgraderStatus.Expired, "Proposal is expired!");
		_;
	}

    modifier onlyGovernance() {
        require(governanceAddr==msg.sender, "This function can only be executed by the Governance");
        _;
    }

	/**
	 * Constructor.
	 *
	 * @param	_voters	addresses of voters.
	 * @param	_percentage	value of this.percentage.
	 *
	 * exception	UninitializationException	_dataAddr does not belong to a deployed Data contract having been initialization.
	 * exception	UpgraderConflictException	another upgrader is working.
	 * exception	InvalidHandlerException	_originalAddr or _newAddr does not belong to a deployed Handler contract.
	 */
	constructor (address[] memory _voters, uint256 _percentage, uint256 _period, address gAddr, address adminAddr) public {

        proposalBlockNumber = 0;
		proposalPeriod = _period;

		_addVoters(_voters);
		_setPercentage(_percentage);

		// Mark the contract as preparing.
		status = UpgraderStatus.Preparing;

		governanceAddr = gAddr;
	}


	/**
	 * Start voting.
	 * Upgrader must check if Data contract and 2 Handler contracts are ok.
	 *
	 * exception	RestartingException	proposal has been already started.
	 * exception	PermissionException	msg.sender is not the owner.
	 */
	function startProposal () external onlyOwner {
	 require(status == UpgraderStatus.Preparing, "Proposal has been already started!");

		// Mark the contract as voting.
		status = UpgraderStatus.Voting;
	}

	/**
	 * Add unique voters.
	 * If expired, self-destruct.
	 *
	 * @param	_voters	addresses of voters.
	 *
	 * exception	PermissionException	msg.sender is not the owner.
	 * 
	 * see  this.notExpired
	 */
	function addVoters (address[] memory _voters) public notExpired onlyOwner {
		_addVoters(_voters);
	}

	function _addVoters (address[] memory _voters) internal {
		for (uint256 i = 0; i < _voters.length; i++) {
			if (!voterRegistered[_voters[i]]) {
				voterRegistered[_voters[i]] = true;
				numOfVoters++;
			}
		}
	}

	/**
	 * Vote.
	 * If expired, self-destruct.
	 *
	 * @param	_choose	if the voter agrees with the proposal.
	 *
	 * exception	PermissionException	msg.sender is not a voter.
	 * 
	 * see  this.notExpired
	 */
	function vote (bool _choose) external notExpired {
		require(voterRegistered[msg.sender], "Do not have the permission!");
		if (voting[msg.sender] != _choose) {
			if (_choose) {
				numOfAgreements++;
			} else {
				numOfAgreements--;
			}
			voting[msg.sender] = _choose;
		}
	}

	/**
	 * Set percentage.
	 * If percentage is over 100, it will be fixed automatically.
	 *
	 * @param	_percentage	value of this.percentage.
	 *
	 * exception	PermissionException	msg.sender is not the owner.
	 * 
	 * see  this.notExpired
	 */
	function setPercentage(uint256 _percentage) external notExpired onlyOwner {
		_setPercentage(_percentage);
	}

	function _setPercentage(uint256 _percentage) internal {
		percentage = _percentage;
		if (percentage > 100) {
			percentage = 100;
		}
	}

	/**
	 * Anyone can try to get resolution.
	 * If voters get consensus, upgrade the Handler contract.
	 * If expired, self-destruct.
	 * Otherwise, do nothing.
	 *
	 * exception	PreparingUpgraderException	proposal has not been started.
	 *
	 * @return	status of proposal.
	 * 
	 * see  this.notExpired
	 */
	function getResolution() external notExpired returns(UpgraderStatus) {
		if (numOfAgreements > numOfVoters.mul(percentage).div(100)) {
			status = UpgraderStatus.Success;
		}
		return status;
	}

	function approveChangeIfPossible() external onlyOwner {
		
		if (status == UpgraderStatus.Success) {
	        Governance governance = Governance (governanceAddr);
			governance.approveChangeWithDecisionContract(changeNumber);
		}

		//TODO: e se percentual jah nao dah para aprovar?
		//!!!!!!!!!!!!!!!! DISCUTIR REQUISITOS DO CONTRATO DE DECISAO
		else if (status == UpgraderStatus.Expired) {
			Governance governance = Governance (governanceAddr);
			governance.denyChangeWithDecisionContract(changeNumber);
		}
	}

	/**
	 * Destruct itself.
	 *
	 * exception	PermissionException	msg.sender is not the owner.
	 */
/*	function done() external onlyOwner {
		selfdestruct(owner());
	}
*/


	/**
	 * Getter of proposalPeriod.
	 *
	 * exception	GetterPermissionException	msg.sender is not permitted to call the getter.
	 *
	 * @return	this.proposalPeriod.
	 */
	function getProposalPeriod () public view returns(uint256) {
		return proposalPeriod;
	}

	/**
	 * Setter of proposalPeriod.
	 *
	 * @param	_proposalPeriod	new value of this.proposalPeriod.
	 *
	 * exception	PermissionException	msg.sender is not the owner.
	 *
	 * @return	if this.proposalPeriod is successfully set.
	 */
	function setProposalPeriod (uint256 _proposalPeriod) public onlyOwner returns(bool) {
		proposalPeriod = _proposalPeriod;
		return true;
	}

	function getChangeNumber () public view returns(uint256) {
		return changeNumber;
	}

	function setChangeNumber (uint256 number) public onlyGovernance returns(bool) {
		changeNumber = number;
		return true;
	}

	function getGovernanceAddr() public view returns(address) {
		return governanceAddr;
	}

}
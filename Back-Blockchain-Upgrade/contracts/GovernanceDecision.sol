pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./IdRegistry.sol";
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

	IdRegistry private idRegistry;


	/** Marker */
	enum UpgraderStatus {
		Preparing,
		Voting,
		Approved,
		Rejected,
		Cancelled
	}

	UpgraderStatus public status;


	/** Voting mechanism related */
	uint256 private percentage;
	mapping(uint => bool) public voting;
	mapping(uint => bool) private voterRegistered;
	uint256 private numOfVoters = 0;
	uint256 private numOfAgreements = 0;

	modifier onlyInVotingState {
		require(status == UpgraderStatus.Voting, "Decision not in the voting state!");
		_;
	}

    modifier onlyGovernance() {
        require(governanceAddr==msg.sender, "This function can only be executed by the Governance");
        _;
    }


	constructor (uint[] memory _votersId, uint256 _percentage, address gAddr, address idRegistryAddr) public {

		_addVoters(_votersId);
		_setPercentage(_percentage);

		idRegistry = IdRegistry(idRegistryAddr);

		// Mark the contract as preparing.
		status = UpgraderStatus.Preparing;

		governanceAddr = gAddr;
	}

	//TODO: cancel change


	/**
	 * Start voting.
	 *
	 * exception	RestartingException	proposal has been already started.
	 * exception	PermissionException	msg.sender is not the owner.
	 */
	function startProposal (uint256 _changeNumber) external onlyGovernance returns(bool) {
	 	require(status == UpgraderStatus.Preparing, "Proposal has been already started!");

		 changeNumber = _changeNumber;

		// Mark the contract as voting.
		status = UpgraderStatus.Voting;
	}

	/**
	 * Vote.
	 *
	 * @param	_choose	if the voter agrees with the proposal.
	 *
	 * exception	PermissionException	msg.sender is not a voter.
	 * 
	 */
	function vote (bool _choose) external onlyInVotingState {
		uint voterId = idRegistry.getId(msg.sender);
		require(voterRegistered[voterId], "Do not have the permission!");
		if (voting[voterId] != _choose) {
			if (_choose) {
				numOfAgreements++;
			} else {
				numOfAgreements--;
			}
			voting[voterId] = _choose;
		}
	}



	/**
	 * Anyone can try to get resolution.
	 * If voters get consensus, upgrade the Handler contract.
	 * Otherwise, do nothing.
	 *
	 * exception	PreparingUpgraderException	proposal has not been started.
	 *
	 * @return	status of proposal.
	 * 
	 */
	function getResolution() external onlyInVotingState returns(UpgraderStatus) {
		if (numOfAgreements > numOfVoters.mul(percentage).div(100)) {
			status = UpgraderStatus.Approved;
		}
//TODO: testar caso negativo
		return status;
	}


	function approveChangeIfPossible() external onlyOwner {

		Governance governance = Governance (governanceAddr);
		if (status == UpgraderStatus.Approved) {
			governance.approveChangeWithDecisionContract(changeNumber);
		}
		else if (status == UpgraderStatus.Rejected) {
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


	function addVoters (uint[] memory _votersId) public onlyInVotingState onlyOwner {
		_addVoters(_votersId);
	}

	function _addVoters (uint[] memory _votersId) internal {
		for (uint256 i = 0; i < _votersId.length; i++) {
			if (!voterRegistered[_votersId[i]]) {
				voterRegistered[_votersId[i]] = true;
				numOfVoters++;
			}
		}
	}


	function getChangeNumber () public view returns(uint256) {
		return changeNumber;
	}


	/**
	 * Set percentage.
	 * If percentage is over 100, it will be fixed automatically.
	 *
	 * @param	_percentage	value of this.percentage.
	 *
	 * exception	PermissionException	msg.sender is not the owner.
	 * 
	 */
	function setPercentage(uint256 _percentage) external onlyInVotingState onlyOwner {
		_setPercentage(_percentage);
	}

	function _setPercentage(uint256 _percentage) internal {
		percentage = _percentage;
		if (percentage > 100) {
			percentage = 100;
		}
	}

}
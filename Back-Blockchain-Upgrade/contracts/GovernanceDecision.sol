pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./IdRegistry.sol";
import "./Governance.sol";


contract GovernanceDecision is Ownable() {

	using SafeMath for uint256;

	uint private changeNumber;

	address private governanceAddr;

	IdRegistry private idRegistry;


	/** Marker */
	enum UpgraderStatus {
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

	constructor (uint[] memory _votersId, uint256 _percentage, address gAddr, address idRegistryAddr, uint256 _changeNumber) public {

		_addVoters(_votersId);
		_setPercentage(_percentage);

		idRegistry = IdRegistry(idRegistryAddr);
		governanceAddr = gAddr;

		changeNumber = _changeNumber;

		// Mark the contract as voting.
		status = UpgraderStatus.Voting;

	}

	//TODO: cancel change


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



	function makeDecision() public onlyInVotingState onlyOwner returns(UpgraderStatus) {

		Governance governance = Governance (governanceAddr);

		if (numOfAgreements > numOfVoters.mul(percentage).div(100)) {
			status = UpgraderStatus.Approved;
			governance.approveChangeWithDecisionContract(changeNumber);
		}
		else {
			status = UpgraderStatus.Rejected;
			governance.denyChangeWithDecisionContract(changeNumber);
		}

		return status;
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


	function _setPercentage(uint256 _percentage) internal {
		percentage = _percentage;
		if (percentage > 100) {
			percentage = 100;
		}
	}

}
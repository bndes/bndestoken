pragma solidity ^0.5.0;

import "./Updatable.sol";

contract UpdatableHandleable is Updatable {

    mapping(address => bool) private handlerAddrPermission;

    constructor (address upgraderInfo) Updatable(upgraderInfo)  public {
    }

    /**
	 * Check if msg.sender is a Handler of this contract. It is used for setters.
	 * If fail, throw PermissionException.
	 */
	modifier onlyHandler {
		require(isHandler(), "Do not have the handler permission to write!");
		_;
	}

	modifier onlyHandlerOrUpgrader {
		require(isHandler() || isAllowedUpgrader(), "Do not have the handler permission to write!");
		_;
	}

    function isHandler() public view returns (bool) {
        return handlerAddrPermission[msg.sender];
    }

	function addHandler (address _handlerAddr) external onlyAllowedUpgrader returns(bool)  {
        handlerAddrPermission[_handlerAddr] = true;
		return true;
	}

	function removeHandler (address _handlerAddr) external onlyAllowedUpgrader returns(bool)  {
        handlerAddrPermission[_handlerAddr] = false;
		return true;
	}

}
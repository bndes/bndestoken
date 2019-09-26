pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "./UpgraderInfo.sol";

contract Updatable is Pausable {

    UpgraderInfo private upgraderInfo;
    bool private _dataAvailable;


    constructor (address newAddr) public {
        upgraderInfo = UpgraderInfo (newAddr);
        _dataAvailable = true;
    }

    modifier onlyAllowedUpgrader() {
        require(isAllowedUpgrader(), "This function can only be executed by Upgraders");
        _;
    }

    function isAllowedUpgrader() public view returns (bool) {
        return upgraderInfo.isAllowedUpgrader();
    }

    function dataAvailable() external view returns (bool) {
        return _dataAvailable;
    }

    function setDataAvailable (bool b) external onlyAllowedUpgrader {
        _dataAvailable = b;
    }

    function upgraderInfoAddr() view public returns(address) {
        return address(upgraderInfo);
    }

}

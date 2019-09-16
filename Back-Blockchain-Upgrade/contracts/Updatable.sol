pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "./UpgraderInfo.sol";

contract Updatable is Pausable {

    address public upgraderInfoAddr;
    bool public dataAvailable;


    constructor (address newAddr) public {
        upgraderInfoAddr = newAddr;
        dataAvailable = true;

//avaliar se fica aqui. Problema é se mudar Admin
        UpgraderInfo ui = UpgraderInfo(newAddr);
        addPauser(ui.getAdminAddr());
    }

    modifier onlyAllowedUpgrader() {
        require(isAllowedUpgrader(), "This function can only be executed by Upgraders");
        _;
    }

    function isAllowedUpgrader() public view returns (bool) {
        UpgraderInfo ui = UpgraderInfo (upgraderInfoAddr);
        return ui.isAllowedUpgrader();
    }

    function getDataAvailable () external view returns (bool) {
        return dataAvailable;
    }

    function setDataAvailable (bool b) external onlyAllowedUpgrader {
        dataAvailable = b;
    }
}

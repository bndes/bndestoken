pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

//O owner desse contrato é o contrato de Governanca
contract UpgraderInfo is Ownable() {

    address private allowedUpgraderAddr;

    event UpgraderInfoChanged(address indexed previousAddr, address indexed newAddr);

    function getAllowedUpgraderAddr() public view returns (address) {
        return allowedUpgraderAddr;
    }

    function isAllowedUpgrader() public view returns (bool) {
        return msg.sender == allowedUpgraderAddr;
    }

    function setAllowedUpgrader(address newAddr) public onlyOwner {
//        require(newAddr!=address(0), "NewAddr is not a valid address");
        emit UpgraderInfoChanged(allowedUpgraderAddr, newAddr);
        allowedUpgraderAddr = newAddr;
    }

    function setNoUpgrader() public onlyOwner {
        setAllowedUpgrader(address(0));
    }


}

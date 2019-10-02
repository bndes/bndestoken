pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

//O owner desse contrato é o contrato de Governanca
contract UpgraderInfo is Ownable() {

    address private allowedUpgraderAddr;

    address private _adminAddr;

    event AllowedUpgraderChanged(address indexed previousAddr, address indexed newAddr);
    event AdminChanged(address indexed previousAddr, address indexed newAddr);

    constructor (address newAdmin) public {
       emit AdminChanged(_adminAddr, newAdmin);
       _adminAddr = newAdmin;
    }

    function getAllowedUpgraderAddr() public view returns (address) {
        return allowedUpgraderAddr;
    }

    function isAllowedUpgrader(address sender) public view returns (bool) {
        return sender == allowedUpgraderAddr;
    }

    function setAllowedUpgrader(address newAddr) public onlyOwner {
//        require(newAddr!=address(0), "NewAddr is not a valid address");
        emit AllowedUpgraderChanged(allowedUpgraderAddr, newAddr);
        allowedUpgraderAddr = newAddr;
    }

    function isAdmin(address possibleAdmin) public view returns (bool) {
        return _adminAddr==possibleAdmin;
    }

    function adminAddr() public view returns (address) {
        return _adminAddr;
    }

//se mudar admin precisa setar em cada contrato o novo pauser!!!!!!!!!
//avaliar se esse metodo deve existir
    function setAdminAddr (address newAddr) public onlyOwner {
        require(newAddr!=address(0), "NewAddr is not a valid address");
        emit AdminChanged(_adminAddr, newAddr);
        _adminAddr = newAddr;
    }


}

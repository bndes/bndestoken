pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";

contract Updatable is Pausable, Ownable() {

    address private admin;

    event AdminTransferred(address indexed previousAdmin, address indexed newAdmin);

    constructor () internal {
        admin = msg.sender;
        emit AdminTransferred(address(0), admin);
    }

    function getAdmin() public view returns (address) {
        return admin;
    }

    modifier onlyAdmin() {
        require(isAdmin());
        _;
    }

    function isAdmin() public view returns (bool) {
        return msg.sender == admin;
    }

    function transferAdmin(address newAdmin) public onlyOwner {
        _transferAdmin(newAdmin);
    }

    function _transferAdmin(address newAdmin) internal {
        require(newAdmin != address(0), "NewAdmin is not a valid address");
        emit AdminTransferred(admin, newAdmin);
        admin = newAdmin;
    }

}

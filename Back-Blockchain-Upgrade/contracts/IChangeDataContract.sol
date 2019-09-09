pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract IChangeDataContract is Ownable() {

    function updateData() external onlyOwner {

    }
}
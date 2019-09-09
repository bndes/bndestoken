pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";


contract BNDESResolver is Ownable() {
    
    mapping (string => address) nameToAddress;
    mapping (string => address[]) nameToPreviousAddresses;
    
    function changeContract(string memory name, address newAddr) public onlyOwner returns (bool) {

        address contractAddr = nameToAddress[name];
        if(newAddr != contractAddr) {

            if (contractAddr != address(0)) {
                Pausable pausable = Pausable(contractAddr);
                pausable.pause();
            }

            nameToPreviousAddresses[name].push(newAddr);
            nameToAddress[name] = newAddr;
            return true;
        }

        return false;
    }

    function getAddr(string memory name) public view returns (address) {
        return nameToAddress[name];
    }
}
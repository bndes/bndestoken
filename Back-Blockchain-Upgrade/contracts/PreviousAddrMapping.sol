pragma solidity ^0.5.0;

import "./Storage.sol";

/*
    address[] previousbndesRegistryAddr;
*/

contract PreviousAddrMapping {

    Storage storageContract;
    string objectType = new string(20);
    int length=0;

    constructor (string memory t, address storageContractAddr) public {
        objectType = t;
        storageContract = Storage(storageContractAddr);
    }

    function getAddr(int index) view public returns (address) {
        bytes32 key = keccak256(abi.encodePacked("PreviousAddrMapping","BNDESResolver", objectType, index));
        return storageContract.getAddress(key);
    }

    function pushAddr(address newAddr) public {
        bytes32 key = keccak256(abi.encodePacked("PreviousAddrMapping","BNDESResolver", objectType, length));
        storageContract.setAddress(key, newAddr);
        length++;
    }

}
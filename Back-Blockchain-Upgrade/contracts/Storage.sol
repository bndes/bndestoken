pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./BNDESRegistry.sol";

//ERC930 -https://github.com/ethereum/EIPs/issues/930
contract Storage is Ownable() {
    
    mapping(address => bool) private handlerAddrPermission;

    struct StorageStruct {
        mapping(bytes32 => bool) _bool;
        mapping(bytes32 => int) _int;
        mapping(bytes32 => uint) _uint;
        mapping(bytes32 => string) _string;
        mapping(bytes32 => address) _address;
        mapping(bytes32 => bytes) _bytes;
    }

    StorageStruct internal s;

    bool public dataAvailable;

    constructor () public {
        dataAvailable = true;
    }

    /**
	 * Check if msg.sender is a Handler of this contract. It is used for setters.
	 * If fail, throw PermissionException.
	 */
	modifier onlyHandler {
		require(handlerAddrPermission[msg.sender], "Do not have the handler permission to write in the storage!");
		_;
	}  

	/**
	 * Set Handler contract for the contract. Owner must set one to initialize the Data contract.
	 * Handler can be set by owner or Upgrader contract.
	 *
	 * @param	_handlerAddr	address of a deployed Handler contract.
	 *
	 * exception	PermissionException	msg.sender is not the owner nor a registered Upgrader contract.
	 *
	 * @return	if Handler contract is successfully set.
	 */
	function addHandler (address _handlerAddr) external onlyOwner returns(bool)  {
        handlerAddrPermission[_handlerAddr] = true;
		return true;
	}
	function removeHandler (address _handlerAddr) external onlyOwner returns(bool)  {
        handlerAddrPermission[_handlerAddr] = false;
		return true;
	}
    function renounceHandler() external onlyHandler returns(bool)  {
        handlerAddrPermission[msg.sender] = false;
		return true;
    }


    function setDataAvailable (bool b) external onlyHandler {
        dataAvailable = b;
    }
    function getDataAvailable () external view returns (bool) {
        return dataAvailable;
    }

    function setBoolean(bytes32 h, bool v) public onlyHandler {
        s._bool[h] = v;
    }
    function setInt(bytes32 h, int v) public onlyHandler {
        s._int[h] = v;
    }
    function setUint(bytes32 h, uint256 v) public onlyHandler {
        s._uint[h] = v;
    }
    function setAddress(bytes32 h, address v) public onlyHandler {
        s._address[h] = v;
    }
    function setString(bytes32 h, string memory v) public onlyHandler {
        s._string[h] = v;
    }
    function setBytes(bytes32 h, bytes memory v) public onlyHandler {
        s._bytes[h] = v;
    }


    function getBoolean(bytes32 h) public view returns (bool){
        return s._bool[h];
    }
    function getInt(bytes32 h) public view returns (int){
        return s._int[h];
    }
    function getUint(bytes32 h) public view returns (uint256){
        return s._uint[h];
    }
    function getAddress(bytes32 h) public view returns (address){
        return s._address[h];
    }
    function getString(bytes32 h) public view returns (string memory){
        return s._string[h];
    }
    function getBytes(bytes32 h) public view returns (bytes memory){
        return s._bytes[h];
    }

}
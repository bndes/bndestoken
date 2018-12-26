pragma solidity ^0.4.13;

contract Owned {
	address internal owner = msg.sender;

	modifier onlyOwner 
	{ 
		require(msg.sender == owner); 
		_; 
	}

	event NewOwner(address indexed old, address indexed current);

    function getOwner() view public returns(address)
    {
    	return owner;
    }

    function setOwner(address _new) public onlyOwner 
    { 
    	if (owner != 0x0)
    		require(msg.sender == owner);

    	owner = _new; 
    	NewOwner(owner, _new); 
    }

}
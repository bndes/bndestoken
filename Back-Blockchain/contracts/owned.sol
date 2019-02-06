pragma solidity ^0.4.13;

contract Owned {
	address internal owner = msg.sender;
  address ownerCandidate;

	modifier onlyOwner
	{
		require(msg.sender == owner);
		_;
	}

  modifier onlyOwnerCandidate
  {
    require (msg.sender == ownerCandidate);
    _;
  }

	event NewOwnerCandidate(address indexed old, address indexed invited);
	event NewOwner(address indexed old, address indexed current);

    function getOwner() public returns(address)
    {
    	return owner;
    }

	  function inviteOwner(address _new) public onlyOwner {
	    ownerCandidate = _new;
    	NewOwnerCandidate(owner, _new);
	  }

	  function acceptOwnership() public onlyOwnerCandidate {
	    owner = ownerCandidate;
    	NewOwner(owner, msg.sender);
	  }
}

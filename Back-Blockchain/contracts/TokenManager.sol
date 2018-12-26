pragma solidity ^0.4.13;

import "./TokenERC20.sol";
import "./owned.sol";

contract TokenManager is TokenERC20, Owned {
	
    function TokenManager (uint256 initialSupply, string tokenName, string tokenSymbol) public TokenERC20(initialSupply, tokenName, tokenSymbol) {
        //nothing else to do. it calls the TokenERC20 Constructor
    }

    /**
     * This method does not belong to ERC20 standard, but is generic enough to be here
     *
     * @param target address which will receive the created tokens
     * @param mintedAmount of tokens created
     */
    function mintToken(address target, uint256 mintedAmount) onlyOwner internal {
        balanceOf[target] += mintedAmount;
        totalSupply += mintedAmount;
    }

    /**
     * Destroy tokens from other account
     *
     * Remove `_value` tokens from the system irreversibly on behalf of `_from`.
     *
     * @param _from the address of the sender
     * @param _value the amount of money to burn
     */
    function burnFrom(address _from, uint256 _value) internal {
        require(balanceOf[_from] >= _value);                // Check if the targeted balance is enough
        //require(_value <= allowance[_from][msg.sender]);    // Check allowance
        balanceOf[_from] -= _value;                         // Subtract from the targeted balance
        //allowance[_from][msg.sender] -= _value;             // Subtract from the sender's allowance
        totalSupply -= _value;                              // Update totalSupply
    }

    function setTotalSupply(uint256 _value) onlyOwner public {
        totalSupply = _value;
    }

    function setName(string _name) onlyOwner public {
        name = _name;
    }

    function setSymbol(string _symbol) onlyOwner public {
        symbol = _symbol;
    }

    function setDecimals(uint8 _decimals) onlyOwner public {
        decimals = _decimals;
    }

}
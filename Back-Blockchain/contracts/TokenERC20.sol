pragma solidity ^0.4.13;

contract TokenERC20 {
    string internal name;
    string internal symbol;
    uint8  internal decimals;
    // 18 decimals is the strongly suggested default, avoid changing it
    uint256 internal totalSupply;

    // This creates an array with all balances
    mapping (address => uint256) internal balanceOf;

    mapping (address => mapping (address => uint256)) private allowance;    

    // This generates a public event on the blockchain that will notify clients
    event Transfer(address indexed from, address indexed to, uint256 value);    

    function TokenERC20 (uint256 initialSupply, string tokenName, 
        string tokenSymbol) public 
    {
        totalSupply = initialSupply * 10 ** uint256(decimals);  // Update total supply with the decimal amount
        balanceOf[msg.sender] = totalSupply;                // Give the creator all initial tokens
        name = tokenName;                                   // Set the name for display purposes
        symbol = tokenSymbol;                               // Set the symbol for display purposes
    }

    /**
     * Internal transfer, only this by contract and contracts deriving from it can access
     */
    function _transfer(address _from, address _to, uint _value) internal {
        // Prevent transfer to 0x0 address. Use burn() instead
        require(_to != 0x0);
        // Check if the sender has enough
        require(balanceOf[_from] >= _value);
        // Check for overflows
        require(balanceOf[_to] + _value > balanceOf[_to]);
        // Save this for an assertion in the future
        uint previousBalances = balanceOf[_from] + balanceOf[_to];
        // Subtract from the sender
        balanceOf[_from] -= _value;
        // Add the same to the recipient
        balanceOf[_to] += _value;
        Transfer(_from, _to, _value);
        // Asserts are used to use static analysis to find bugs in your code. They should never fail
        assert(balanceOf[_from] + balanceOf[_to] == previousBalances);
    }

    /**
     * Transfer tokens from other address
     *
     * Send `_value` tokens to `_to` in behalf of `_from`
     *
     * @param _from The address of the sender
     * @param _to The address of the recipient
     * @param _value the amount to send
     */
    function transferFrom(address _from, address _to, uint256 _value) public pure returns (bool) {
        // Função não é utilizada no BNDES Token
        revert();
         
        //Coloquei esse código só para não dar warning
        if (_from != _to) 
            return false;
        if (_from == _to) 
            return false;
        if (_value == 0) 
            return false;
        if (_value != 0) 
            return false;
    }

    /**
     * Set allowance for other address
     *
     * Allows `_spender` to spend no more than `_value` tokens in your behalf
     *
     * @param _spender The address authorized to spend
     * @param _value the max amount they can spend
     */
    function approve(address _spender, uint256 _value) public pure returns (bool) {
        // Não usada no BNDES Token ainda
        revert();

        //Coloquei esse código só para não dar warning
        if (_spender == 0) 
            return false;
        if (_spender != 0) 
            return false;
        if (_value == 0) 
            return false;
        if (_value != 0) 
            return false;
    }

    function getBalanceOf(address _addr) view public returns(uint256) {
        return balanceOf[_addr];
    }

    function getTotalSupply() view public returns (uint256) {
        return totalSupply;
    }

    function getName() view public returns (string) {
        return name;
    } 

    function getSymbol() view public returns (string) {
        return symbol;
    }

    function getDecimals() view public returns (uint8) {
        return decimals;
    }
    
}

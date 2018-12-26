pragma solidity ^0.4.13;
// Enables event logging of the format `console.log('descriptive string', variable)`, 
// without having to worry about the variable type (as long as an event has been declared for that type in the 
// Console contract.

contract Console {

    event LogUint(string a, uint b);
    function log(string s , uint x) public {
        LogUint(s, x);
    }
    
    event LogInt(string a , int b);
    function log(string s , int x) public {
        LogInt(s, x);
    }
    
    event LogBytes(string a, bytes b);
    function log(string s , bytes x) public {
        LogBytes(s, x);
    }
    
    event LogBytes32(string a, bytes32 b);
    function log(string s , bytes32 x) public {
        LogBytes32(s, x);
    }

    event LogAddress(string a, address b);
    function log(string s , address x) public {
        LogAddress(s, x);
    }

    event LogBool(string a, bool b);
    function log(string s , bool x) public {
        LogBool(s, x);
    }
}

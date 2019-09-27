pragma solidity ^0.5.0;

import "./Updatable.sol";

contract Resolver is Updatable {
    
    mapping (string => address) nameToAddress;
    mapping (string => address[]) nameToPreviousAddresses;

    //todo: metodo para acessar essa estrutura?
    address[] private allValidContracts;

    constructor (address upgraderInfoAddr) Updatable (upgraderInfoAddr) public {
    }
    
    function changeContract(string memory name, address newAddr) public onlyAllowedUpgrader returns (bool) {

        address contractAddr = nameToAddress[name];
        if(newAddr != contractAddr) {

            if (contractAddr != address(0)) {
                Pausable pausable = Pausable(contractAddr);
                pausable.pause();
                updateValidContracts(contractAddr, newAddr);
            }
            else {
                allValidContracts.push(newAddr);
            }

            nameToPreviousAddresses[name].push(newAddr);
            nameToAddress[name] = newAddr;
            return true;
        }

        return false;
    }

    function updateValidContracts(address contractAddr, address newAddr) internal {
        for (uint i=0; i<allValidContracts.length; i++) {
            if (allValidContracts[i]==contractAddr) {
                allValidContracts[i]=newAddr;
            }
        }
    }


    function getAddr(string memory name) public view returns (address) {
        return nameToAddress[name];
    }

    function pauseAll() public {
        UpgraderInfo upgraderInfo = UpgraderInfo (upgraderInfoAddr());
        require (upgraderInfo.isAdmin(msg.sender), "A ação só pode ser executada pelo admin da governança");
        for (uint i=0; i<allValidContracts.length; i++) {
            Pausable pausable = Pausable(allValidContracts[i]);
            pausable.pause();
        }

    }
}
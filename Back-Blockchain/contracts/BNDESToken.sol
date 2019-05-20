pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Pausable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import "./BNDESRegistry.sol";


contract BNDESToken is BNDESRegistry, ERC20Pausable, ERC20Detailed("BNDESToken", "BND", 2) {

    uint private version = 20190517;

    event BNDESTokenDisbursement(uint cnpj, uint idFinancialSupportAgreement, uint256 value);
    event BNDESTokenTransfer(uint fromCnpj, uint fromIdFinancialSupportAgreement, uint toCnpj, uint256 value);
    event BNDESTokenRedemption(uint cnpj, uint256 value);
    event BNDESTokenRedemptionSettlement(string redemptionTransactionHash, string receiptHash);


    function getVersion() view public returns (uint) {
        return version;
    }


    function transfer (address to, uint256 value) public whenNotPaused returns (bool) {

        address from = msg.sender;

        require(from != to, "Não pode transferir token para si mesmo");

        if (isResponsibleForDisbursement(from)) {

            require(isValidatedClient(to), "O endereço não pertence a um cliente ou não está validada");

            _mint(to, value);

            emit BNDESTokenDisbursement(getCNPJ(to), getIdLegalFinancialAgreement(to), value);

        } else { 

            if (isRedemptionAddress(to)) { 

                require(isValidatedSupplier(from), "A conta do endereço não pertence a um fornecedor ou não está validada");

                _burn(from, value);

                emit BNDESTokenRedemption(getCNPJ(from), value);

            } else {

                // Se nem from nem to são o Banco, eh transferencia normal

                require(isValidatedClient(from), "O endereço não pertence a um cliente ou não está validada");
                require(isValidatedSupplier(to), "A conta do endereço não pertence a um fornecedor ou não está validada");

                _transfer(msg.sender, to, value);

                emit BNDESTokenTransfer(getCNPJ(from), getIdLegalFinancialAgreement(from), getCNPJ(to), value);
  
            }
        }

        return true;
    }


    function redeem (uint256 value) public whenNotPaused returns (bool) {
        return transfer(getRedemptionAddress(), value);
    }


    function notifyRedemptionSettlement(string memory redemptionTransactionHash, string memory receiptHash) 
        public whenNotPaused {
        require (isResponsibleForSettlement(msg.sender), "A liquidação só não pode ser realizada pelo endereço que submeteu a transação"); 
        emit BNDESTokenRedemptionSettlement(redemptionTransactionHash, receiptHash);
    }


    function registryLegalEntity(uint cnpj, uint idFinancialSupportAgreement, uint salic, string memory idProofHash) 
        public whenNotPaused { 
        super.registryLegalEntity( cnpj,  idFinancialSupportAgreement,  salic, idProofHash);
    }

    function changeAccountLegalEntity(uint cnpj, uint idFinancialSupportAgreement, uint salic, string memory idProofHash) 
        public whenNotPaused {
        
        address oldAddr = getBlockchainAccount(cnpj, idFinancialSupportAgreement);
        address newAddr = msg.sender;
        
        super.changeAccountLegalEntity(cnpj, idFinancialSupportAgreement, salic, idProofHash);

        // Se há saldo no enderecoAntigo, precisa transferir
        if (balanceOf(oldAddr) > 0) {
            _transfer(oldAddr, newAddr, balanceOf(oldAddr));
        }

    }

    //Unsupported methods
    function transferFrom(address from, address to, uint256 value) public whenNotPaused returns (bool) {
        require(false, "Unsupported method - transferFrom");
    }

    function approve(address spender, uint256 value) public whenNotPaused returns (bool) {
        require(false, "Unsupported method - approve");
    }

    function increaseAllowance(address spender, uint addedValue) public whenNotPaused returns (bool success) {
        require(false, "Unsupported method - increaseAllowance");
    }

    function decreaseAllowance(address spender, uint subtractedValue) public whenNotPaused returns (bool success) {
        require(false, "Unsupported method - decreaseAllowance");
    }



}
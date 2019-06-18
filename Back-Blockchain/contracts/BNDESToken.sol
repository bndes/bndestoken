pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Pausable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import "./BNDESRegistry.sol";


contract BNDESToken is ERC20Pausable, ERC20Detailed("BNDESToken", "BND", 2) {

    uint private version = 20190517;

    BNDESRegistry registry;

    event BNDESTokenDisbursement(uint64 cnpj, uint64 idFinancialSupportAgreement, uint256 value);
    event BNDESTokenTransfer(uint64 fromCnpj, uint64 fromIdFinancialSupportAgreement, uint64 toCnpj, uint256 value);
    event BNDESTokenRedemption(uint64 cnpj, uint256 value);
    event BNDESTokenRedemptionSettlement(string redemptionTransactionHash, string receiptHash);
    event BNDESManualIntervention(string description);

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(isOwner());
        _;
    }

    constructor (address newRegistryAddr) public {
        registry = BNDESRegistry(newRegistryAddr);
    }


    function getVersion() view public returns (uint) {
        return version;
    }


   /**
    * The transfer funcion follows ERC20 token signature. 
    * Using them, it is possible to disburse money to the client, transfer from client to supplier and redeem.
    * @param to the Ethereum address to where the money should be sent
    * @param value how much BNDESToken the supplier wants to redeem
    */
    function transfer (address to, uint256 value) public whenNotPaused returns (bool) {

        address from = msg.sender;

        require(from != to, "Não pode transferir token para si mesmo");

        if (registry.isResponsibleForDisbursement(from)) {

            require(registry.isValidatedClient(to), "O endereço não pertence a um cliente ou não está validada");

            _mint(to, value);

            emit BNDESTokenDisbursement(registry.getCNPJ(to), registry.getIdLegalFinancialAgreement(to), value);

        } else { 

            if (registry.isRedemptionAddress(to)) { 

                require(registry.isValidatedSupplier(from), "A conta do endereço não pertence a um fornecedor ou não está validada");

                _burn(from, value);

                emit BNDESTokenRedemption(registry.getCNPJ(from), value);

            } else {

                // Se nem from nem to são o Banco, eh transferencia normal

                require(registry.isValidatedClient(from), "O endereço não pertence a um cliente ou não está validada");
                require(registry.isValidatedSupplier(to), "A conta do endereço não pertence a um fornecedor ou não está validada");

                _transfer(msg.sender, to, value);

                emit BNDESTokenTransfer(registry.getCNPJ(from), registry.getIdLegalFinancialAgreement(from), 
                                registry.getCNPJ(to), value);
  
            }
        }

        return true;
    }

   /**
    * When redeeming, the supplier indicated to the Resposible for Settlement that he wants to receive 
    * the FIAT money.
    * @param value - how much BNDESToken the supplier wants to redeem
    */
    function redeem (uint256 value) public whenNotPaused returns (bool) {
        return transfer(registry.getRedemptionAddress(), value);
    }

   /**
    * Using this function, the Responsible for Settlement indicates that he has made the FIAT money transfer.
    * @param redemptionTransactionHash hash of the redeem transaction in which the FIAT money settlement occurred.
    * @param receiptHash hash that proof the FIAT money transfer
    */
    function notifyRedemptionSettlement(string memory redemptionTransactionHash, string memory receiptHash) 
        public whenNotPaused {
        require (registry.isResponsibleForSettlement(msg.sender), "A liquidação só não pode ser realizada pelo endereço que submeteu a transação"); 
        require (registry.isValidHash(receiptHash), "O hash do recibo é inválido");
        emit BNDESTokenRedemptionSettlement(redemptionTransactionHash, receiptHash);
    }


    function registryLegalEntity(uint64 cnpj, uint64 idFinancialSupportAgreement, uint32 salic, string memory idProofHash) 
        public whenNotPaused { 
        registry.registryLegalEntity(cnpj,  idFinancialSupportAgreement, salic, msg.sender, idProofHash);
    }

   /**
    * Changes the original link between CNPJ and Ethereum account. 
    * The new link still needs to be validated by BNDES.
    * IMPORTANT: The BNDESTOKENs are transfered from the original to the new Ethereum address 
    * @param cnpj Brazilian identifier to legal entities
    * @param idFinancialSupportAgreement contract number of financial contract with BNDES. It assumes 0 if it is a supplier.
    * @param salic contract number of financial contract with ANCINE. It assumes 0 if it is a supplier.
    * @param idProofHash The legal entities have to send BNDES a PDF where it assumes as responsible for an Ethereum account. 
    *                   This PDF is signed with eCNPJ and send to BNDES. 
    */
    function changeAccountLegalEntity(uint64 cnpj, uint64 idFinancialSupportAgreement, uint32 salic, string memory idProofHash) 
        public whenNotPaused {
        
        address oldAddr = registry.getBlockchainAccount(cnpj, idFinancialSupportAgreement);
        address newAddr = msg.sender;
        
        registry.changeAccountLegalEntity(cnpj, idFinancialSupportAgreement, salic, msg.sender, idProofHash);

        // Se há saldo no enderecoAntigo, precisa transferir
        if (balanceOf(oldAddr) > 0) {
            _transfer(oldAddr, newAddr, balanceOf(oldAddr));
        }

    }

    //These methods may be necessary to solve incidents.
    function burn(address from, uint256 value, string memory description) public onlyOwner {
        _burn(from, value);
        emit BNDESManualIntervention(description);        
    }

    //These methods may be necessary to solve incidents.
    function mint(address to, uint256 value, string memory description) public onlyOwner {
        _mint(to, value);
        emit BNDESManualIntervention(description);        
    }

    function isOwner() public view returns (bool) {
        return registry.owner() == msg.sender;
    } 

    //Unsupported methods - created to avoid call the lib functions by overriding them
    function transferFrom(address from, address to, uint256 value) public whenNotPaused returns (bool) {
        require(false, "Unsupported method - transferFrom");
    }

    //Unsupported methods - created to avoid call the lib functions by overriding them
    function approve(address spender, uint256 value) public whenNotPaused returns (bool) {
        require(false, "Unsupported method - approve");
    }

    //Unsupported methods - created to avoid call the lib functions by overriding them
    function increaseAllowance(address spender, uint addedValue) public whenNotPaused returns (bool success) {
        require(false, "Unsupported method - increaseAllowance");
    }

    //Unsupported methods - created to avoid call the lib functions by overriding them
    function decreaseAllowance(address spender, uint subtractedValue) public whenNotPaused returns (bool success) {
        require(false, "Unsupported method - decreaseAllowance");
    }



}
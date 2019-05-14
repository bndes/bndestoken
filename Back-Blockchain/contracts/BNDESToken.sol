pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Pausable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "./BNDESRegistry.sol";


contract BNDESToken is BNDESRegistry, ERC20Pausable, 
    ERC20Detailed("BNDESToken", "BND", 2), ERC20Mintable, ERC20Burnable {

    uint private versao = 20190414;

    event Liberacao(uint cnpj, uint idSubcredito, uint256 valor);
    event Transferencia(uint fromCnpj, uint fromSubcredito, uint toCnpj, uint256 valor);
    event Resgate(uint cnpj, uint256 valor);
    event LiquidacaoResgate(string hashResgate, string hashComprovante, bool isOk);


    function getVersao() view public returns (uint) {
        return versao;
    }


    function transfer (address _to, uint256 _value) 
        public whenNotPaused returns (bool) {

        address from = msg.sender;

        // O cara não é louco de transferir para si mesmo!!!
        require(from != _to, "Não pode transferir token para si mesmo");

        // Se a origem eh o BNDES, eh uma LIBERACAO
        if (isBNDES(from)) {

            // A conta de destino é de um cliente
            require(isValidatedClient(_to), "O endereço não pertence a um cliente ou não está validada");

            _mint(_to, _value);

            emit Liberacao(getCNPJ(_to), getSubcredito(_to), _value);

        } else { 

            if (isBNDES(_to)) { 

                // _to eh o BNDES. Entao eh RESGATE
                require(isValidatedSupplier(from), "A conta do endereço não pertence a um fornecedor ou não está validada");

                _burn(from, _value);

                emit Resgate(getCNPJ(from), _value);

            } else {

                // Se nem from nem to são o Banco, eh transferencia normal

                require(isValidatedClient(from), "O endereço não pertence a um cliente ou não está validada");
                require(isValidatedSupplier(_to), "A conta do endereço não pertence a um fornecedor ou não está validada");

                _transfer(msg.sender, _to, _value);

                emit Transferencia(getCNPJ(from), getSubcredito(from), getCNPJ(_to), _value);
  
            }
        }

        return true;
    }



    function notificaLiquidacaoResgate(string memory redemptionTransactionHash, string memory receiptHash, bool isOk) 
        public whenNotPaused {
        require (isResponsibleForSettlement(msg.sender), "A liquidação só não pode ser realizada pelo endereço que submeteu a transação"); 
        emit LiquidacaoResgate(redemptionTransactionHash, receiptHash, isOk);
    }


    function cadastra(uint _cnpj, uint _idSubcredito, uint _salic, string memory hashdeclaracao) 
        public whenNotPaused { 
        super.cadastra( _cnpj,  _idSubcredito,  _salic, hashdeclaracao);
    }

    function troca(uint _cnpj, uint _idSubcredito, uint _salic, string memory _hashdeclaracao) 
        public whenNotPaused {
        
        address oldAddr = getContaBlockchain(_cnpj, _idSubcredito);
        address newAddr = msg.sender;
        
        super.troca(_cnpj, _idSubcredito, _salic, _hashdeclaracao);

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

    function mint(address to, uint256 value) public onlyMinter returns (bool) {
        require(false, "Unsupported method - mint");
    }

    function burnFrom(address from, uint256 value) public {
        require(false, "Unsupported method - burnFrom");
    }



}
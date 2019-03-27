pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Pausable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


contract BNDESToken is ERC20Pausable, ERC20Detailed("BNDESToken", "BND", 2), ERC20Mintable, ERC20Burnable, Ownable() {

    uint private versao = 20190325;


    //TODO: Vale a pena adicionar o estado de conta SUSPENSA para casos excepcionais?
    //TODO: Vale a pena adicionar o estado de conta INVALIDADA_INCONFORMIDADE para casos excepcionais?
    enum EstadoContaBlockchain {DISPONIVEL,AGUARDANDO_VALIDACAO,VALIDADA,INVALIDADA_CADASTRO,INVALIDADA_TROCA} 

    EstadoContaBlockchain estadosPossiveis; //variavel nao utilizada, apenas para definir o enum

    address responsibleForSettlement;

    struct PJInfo {
        uint cnpj;
        uint idSubcredito;
        uint salic;
        string hashdeclaracao;
        EstadoContaBlockchain estado;
    } 

    mapping(address => PJInfo) public pjsInfo;
    mapping(uint => mapping(uint => address)) cnpjSubEndereco; 

    event CadastroConta(address endereco, uint cnpj, uint idSubcredito, uint salic, string hashdeclaracao);
    event TrocaConta(address endereco, uint cnpj, uint idSubcredito, uint salic);//TODO: rever troca. Deveria seguir os mesmos parametros do Cadastro?
    event ValidacaoConta(address endereco);
    event InvalidacaoCadastroConta(address endereco);

    event Liberacao(uint cnpj, uint idSubcredito, uint256 valor);
    event Transferencia(uint fromCnpj, uint fromSubcredito, uint toCnpj, uint256 valor);
    event Repasse(uint fromCnpj, uint fromSubcredito, uint toCnpj, uint256 valor);
    event Resgate(uint cnpj, uint256 valor);
    event LiquidacaoResgate(string hashResgate, string hashComprovante, bool isOk);

    constructor () public {
        responsibleForSettlement = msg.sender;
    }


    function setResponsibleForSettlement(address rs) onlyOwner public {
        responsibleForSettlement = rs;
    }

    /**
    Associa um endereço blockchain ao CNPJ
    */
    function cadastra(uint _cnpj, uint _idSubcredito, uint _salic, string memory hashdeclaracao) public { 

        address endereco = msg.sender;
        
        // Endereço não pode ter sido cadastrado anteriormente
        require(pjsInfo[endereco].cnpj == 0, "Endereço não pode ter sido cadastrado anteriormente");

        pjsInfo[endereco] = PJInfo(_cnpj, _idSubcredito, _salic, hashdeclaracao, EstadoContaBlockchain.AGUARDANDO_VALIDACAO);
        
        // Não pode haver outro endereço cadastrado para esse mesmo subcrédito
        if (_idSubcredito > 0) {
            require (cnpjSubEndereco[_cnpj][_idSubcredito] == address(0x0), "Subcredito já está associado a outro endereço");
        }
        
        cnpjSubEndereco[_cnpj][_idSubcredito] = endereco;

        emit CadastroConta(endereco, _cnpj, _idSubcredito, _salic, hashdeclaracao);
    }

    /**
    Reassocia um cnpj/subcrédito a um novo endereço da blockchain (o sender)
    */
    function troca(uint _cnpj, uint _idSubcredito) public {

        address enderecoNovo = msg.sender;

        // O endereço novo não pode estar sendo utilizado
        require(pjsInfo[enderecoNovo].cnpj == 0, "Endereço novo já está sendo utilizado");

        // Tem que haver um endereço associado a esse cnpj/subcrédito
        require(cnpjSubEndereco[_cnpj][_idSubcredito] != address(0x0), "Tem que haver um endereço associado a esse cnpj/subcrédito");

        address enderecoAntigo = cnpjSubEndereco[_cnpj][_idSubcredito];

        require(enderecoNovo != enderecoAntigo, "O endereço novo deve ser diferente do antigo");

        // Se há saldo no enderecoAntigo, precisa transferir
        if (balanceOf(enderecoAntigo) > 0) {
            _transfer(enderecoAntigo, enderecoNovo, balanceOf(enderecoAntigo));
        }

        // Aponta o novo endereço para o registro existente no mapping
        pjsInfo[enderecoNovo] = pjsInfo[enderecoAntigo];
        // Apaga o mapping do endereço antigo
        pjsInfo[enderecoAntigo] = PJInfo(0, 0, 0, "", EstadoContaBlockchain.INVALIDADA_TROCA);
        // Aponta mapping CNPJ e Subcredito para enderecoNovo
        pjsInfo[enderecoNovo].estado = EstadoContaBlockchain.AGUARDANDO_VALIDACAO;
        cnpjSubEndereco[_cnpj][_idSubcredito] = enderecoNovo;

        emit TrocaConta(enderecoNovo, _cnpj, _idSubcredito, 0); //TODO: refatorar para incluir salic no metodo troca 
    }

    function getVersao() view public returns (uint) {
        return versao;
    }

    function getCNPJ(address _addr) view public returns (uint) {
        return pjsInfo[_addr].cnpj;
    }

    function getSubcredito(address _addr) view public returns (uint) {
        return pjsInfo[_addr].idSubcredito;
    }

    function getPJInfo (address _addr) view public returns (uint, uint, uint, string memory, uint) {
        return (pjsInfo[_addr].cnpj, pjsInfo[_addr].idSubcredito, pjsInfo[_addr].salic, pjsInfo[_addr].hashdeclaracao, (uint) (pjsInfo[_addr].estado));
    }

    function getContaBlockchain(uint256 _cnpj, uint256 _idSubcredito) view public returns (address) {
        return cnpjSubEndereco[_cnpj][_idSubcredito];
    }

    function transfer (address _to, uint256 _value) public returns (bool) {

        address from = msg.sender;

        // O cara não é louco de transferir para si mesmo!!!
        require(from != _to, "Não pode transferir token para si mesmo");

        // Se a origem eh o BNDES, eh uma LIBERACAO
        if (isBNDES(from)) {

            // A conta de destino existe        
            require(pjsInfo[_to].cnpj != 0, "Não foi encontrado um cliente");

            // A conta de destino é de um cliente
            require(isCliente(_to), "O endereço não pertence a um cliente");

            require(pjsInfo[_to].estado == EstadoContaBlockchain.VALIDADA, "A conta do endereço não está validada");

            mint(_to, _value);

            emit Transfer(from, _to, _value); // Evento do ERC-20 para manter o padrão na visualização da transação 
            emit Liberacao(pjsInfo[_to].cnpj, pjsInfo[_to].idSubcredito, _value);

        } else { 

            // A conta de origem existe
            require(pjsInfo[from].cnpj != 0, "Não existe conta associada ao endereço");

            // O Cadastro esta valido para operar o BNDESToken
            require(pjsInfo[from].estado == EstadoContaBlockchain.VALIDADA, "A conta do endereço não está validada");


            if (isBNDES(_to)) { 
                // _to eh o BNDES. Entao eh RESGATE

                // Garante que a conta de origem eh um fornecedor
                require(isFornecedor(from), "A conta não é de um fornecedor");

                burnFrom(from, _value);

                emit Resgate(pjsInfo[from].cnpj, _value);

            } else {

                // Se nem from nem to são o Banco, eh transferencia normal

                require(isCliente(from), "O endereço de origem precisa ser um cliente");

                // A conta de destino existe        
                require(pjsInfo[_to].cnpj != 0, "Não existe conta associada ao endereço ");

                require(isFornecedor(_to), "A conta de destino precisa ser de um fornecedor");
                require(pjsInfo[_to].estado == EstadoContaBlockchain.VALIDADA, "A conta do endereço não está validada");

                emit Transferencia(pjsInfo[from].cnpj, pjsInfo[from].idSubcredito, pjsInfo[_to].cnpj, _value);
  
                _transfer(msg.sender, _to, _value);
            }
        }

        return true;
    }

    function validarCadastro(address _addr, string memory _hashdeclaracao) onlyOwner public {

        require(pjsInfo[_addr].estado == EstadoContaBlockchain.AGUARDANDO_VALIDACAO, "A conta precisa estar no estado Aguardando Validação");

        require(keccak256(abi.encodePacked(pjsInfo[_addr].hashdeclaracao)) == keccak256(abi.encodePacked(_hashdeclaracao)), "");

        pjsInfo[_addr].estado = EstadoContaBlockchain.VALIDADA;

        emit ValidacaoConta(_addr);
    }

    function invalidarCadastro(address _addr) onlyOwner public {

        require(pjsInfo[_addr].estado == EstadoContaBlockchain.AGUARDANDO_VALIDACAO, "A conta precisa estar no estado Aguardando Validação");

        pjsInfo[_addr].estado = EstadoContaBlockchain.INVALIDADA_CADASTRO;

        emit InvalidacaoCadastroConta(_addr);
    }

    function isContaValidada(address _addr) view public returns (bool) {

        return pjsInfo[_addr].estado == EstadoContaBlockchain.VALIDADA;
    }

    function isFornecedor(address _addr) view public returns (bool) {

        if (_addr == owner())
            return false;

        return pjsInfo[_addr].idSubcredito == 0;
    }

    function isValidatedSupplier (address _addr) view public returns (bool) {
        return isFornecedor(_addr) && (pjsInfo[_addr].estado == EstadoContaBlockchain.VALIDADA);
    }


    function isCliente (address _addr) view public returns (bool) {

        if (_addr == owner())
            return false;

        return pjsInfo[_addr].idSubcredito != 0;
    }

    function isValidatedClient (address _addr) view public returns (bool) {
        return isCliente(_addr) && (pjsInfo[_addr].estado == EstadoContaBlockchain.VALIDADA);
    }

    //TODO: isBNDES deveria pegar minters tb? Openzepellin abriu a possibilidade de adicionarmos novos minters
    function isBNDES(address _addr) view public returns (bool) {
        return (_addr == owner());
    }

    function isResponsibleForSettlement(address _addr) view public returns (bool) {
        return (_addr == responsibleForSettlement);
    }    

    function notificaLiquidacaoResgate(string memory redemptionTransactionHash, string memory receiptHash, bool isOk) 
        public {
        require (msg.sender==responsibleForSettlement, "A liquidação não pode ser realizada pelo endereço que submeteu a transação"); 
        emit LiquidacaoResgate(redemptionTransactionHash, receiptHash, isOk);
    }

    function getEstadoContaAsString(address _addr) view public returns (string memory) {

        if ( pjsInfo[_addr].estado == EstadoContaBlockchain.VALIDADA ) {
            return "Validada"; 
        } else if ( pjsInfo[_addr].estado == EstadoContaBlockchain.INVALIDADA_CADASTRO ) {
            return "Conta invalidada no Cadastro";
        } else if ( pjsInfo[_addr].estado == EstadoContaBlockchain.INVALIDADA_TROCA ) {
            return "Conta invalidada por Troca de Conta";
        } else if ( pjsInfo[_addr].estado == EstadoContaBlockchain.AGUARDANDO_VALIDACAO ) {
            return "Aguardando validação do Cadastro";
        } else if ( pjsInfo[_addr].cnpj == 0 && pjsInfo[_addr].estado == EstadoContaBlockchain.DISPONIVEL) {
            return "Disponível";
        } else {
            return "Erro";
        }

    }



}
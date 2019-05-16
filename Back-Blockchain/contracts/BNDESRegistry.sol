pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract BNDESRegistry is Ownable() {

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

    //_cnpj => (_idSubcredito => endereco)
    mapping(uint => mapping(uint => address)) cnpjSubEndereco; 



    event CadastroConta(address endereco, uint cnpj, uint idSubcredito, uint salic, string hashdeclaracao);
    event TrocaConta(address endereco, uint cnpj, uint idSubcredito, uint salic, string hashdeclaracao);
    event ValidacaoConta(address endereco);
    event InvalidacaoCadastroConta(address endereco);


    constructor () public {
        responsibleForSettlement = msg.sender;
    }


    /**
    Associa um endereço blockchain ao CNPJ
    */
    function cadastra(uint _cnpj, uint _idSubcredito, uint _salic, string memory hashdeclaracao) public { 

        address endereco = msg.sender;

        // Endereço não pode ter sido cadastrado anteriormente
        require (isContaDisponivel(endereco), "Endereço não pode ter sido cadastrado anteriormente");

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
    function troca(uint _cnpj, uint _idSubcredito, uint _salic, string memory _hashdeclaracao) public {

        address enderecoNovo = msg.sender;
     
        require (isContaDisponivel(enderecoNovo), "Novo endereço não pode ter sido cadastrado anteriormente");

        // Tem que haver um endereço associado a esse cnpj/subcrédito
        require(cnpjSubEndereco[_cnpj][_idSubcredito] != address(0x0), "Tem que haver um endereço associado a esse cnpj/subcrédito");

        address enderecoAntigo = cnpjSubEndereco[_cnpj][_idSubcredito];

        require(enderecoNovo != enderecoAntigo, "O endereço novo deve ser diferente do antigo");

        require(pjsInfo[enderecoAntigo].cnpj==_cnpj && pjsInfo[enderecoAntigo].idSubcredito ==_idSubcredito, "Dados inconsistentes de cnpj ou subcrédito");

        // Aponta o novo endereço para o novo PJInfo
        pjsInfo[enderecoNovo] = PJInfo(_cnpj, _idSubcredito, _salic, _hashdeclaracao, EstadoContaBlockchain.AGUARDANDO_VALIDACAO);

        // Apaga o mapping do endereço antigo
        pjsInfo[enderecoAntigo] = PJInfo(0, 0, 0, "", EstadoContaBlockchain.INVALIDADA_TROCA);

        // Aponta mapping CNPJ e Subcredito para enderecoNovo
        cnpjSubEndereco[_cnpj][_idSubcredito] = enderecoNovo;

        emit TrocaConta(enderecoNovo, _cnpj, _idSubcredito, _salic, _hashdeclaracao); 

    }


    function validarCadastro(address _addr, string memory _hashdeclaracao) onlyOwner public {

        require(pjsInfo[_addr].estado == EstadoContaBlockchain.AGUARDANDO_VALIDACAO, "A conta precisa estar no estado Aguardando Validação");

        require(keccak256(abi.encodePacked(pjsInfo[_addr].hashdeclaracao)) == keccak256(abi.encodePacked(_hashdeclaracao)), "O hash recebido é diferente do esperado");

        pjsInfo[_addr].estado = EstadoContaBlockchain.VALIDADA;

        emit ValidacaoConta(_addr);
    }

    function invalidarCadastro(address _addr) onlyOwner public {

        pjsInfo[_addr].estado = EstadoContaBlockchain.INVALIDADA_CADASTRO;

        emit InvalidacaoCadastroConta(_addr);
    }


    function setResponsibleForSettlement(address rs) onlyOwner public {
        responsibleForSettlement = rs;
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

    function isContaReservada(address _addr) view public returns (bool) {

        if (isBNDES(_addr) || isResponsibleForSettlement(_addr))
            return true;

        return false;
    }

    function isFornecedor(address _addr) view public returns (bool) {

        if (isContaReservada(_addr))
            return false;

        if (isContaDisponivel(_addr))
            return false;

        return pjsInfo[_addr].idSubcredito == 0;
    }

    function isValidatedSupplier (address _addr) view public returns (bool) {
        return isFornecedor(_addr) && (pjsInfo[_addr].estado == EstadoContaBlockchain.VALIDADA);
    }


    function isCliente (address _addr) view public returns (bool) {

        if (isContaReservada(_addr))
            return false;

        return pjsInfo[_addr].idSubcredito != 0;
    }

    function isValidatedClient (address _addr) view public returns (bool) {
        return isCliente(_addr) && (pjsInfo[_addr].estado == EstadoContaBlockchain.VALIDADA);
    }

    function isBNDES(address _addr) view public returns (bool) {
        return (_addr == owner());
    }

    function isResponsibleForSettlement(address _addr) view public returns (bool) {
        return (_addr == responsibleForSettlement);
    }    


    function isContaDisponivel(address _addr) view public returns (bool) {
        
        if ( isContaReservada(_addr) ) {
            return false;
        } 

        return pjsInfo[_addr].cnpj == 0 && pjsInfo[_addr].estado == EstadoContaBlockchain.DISPONIVEL;
    }

    function isContaAguardandoValidacao(address _addr) view public returns (bool) {
        return pjsInfo[_addr].estado == EstadoContaBlockchain.AGUARDANDO_VALIDACAO;
    }

    function isContaValidada(address _addr) view public returns (bool) {
        return pjsInfo[_addr].estado == EstadoContaBlockchain.VALIDADA;
    }


    function getEstadoContaAsString(address _addr) view public returns (string memory) {

        if ( isBNDES(_addr) ) {
            return "Conta Reservada - BNDES";
        } else if ( isResponsibleForSettlement(_addr)) {
            return "Conta Reservada - Liquidante do contrato";
        } else if ( isContaValidada(_addr) ) {
            return "Validada"; 
        } else if ( pjsInfo[_addr].estado == EstadoContaBlockchain.INVALIDADA_CADASTRO ) {
            return "Conta invalidada no Cadastro";
        } else if ( pjsInfo[_addr].estado == EstadoContaBlockchain.INVALIDADA_TROCA ) {
            return "Conta invalidada por Troca de Conta";
        } else if ( isContaAguardandoValidacao(_addr) ) {
            return "Aguardando validação do Cadastro";
        } else if (isContaDisponivel (_addr)) {
            return "Disponível";
        } else {
            return "Erro";
        }

    }


}
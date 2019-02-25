pragma solidity ^0.4.13;

import "./TokenManager.sol";
import "./Console.sol";

contract BNDESCoin is TokenManager(0,"BNDESCoin", "BND"),  Console {
    uint private versao = 20181105;

        //TODO: Vale a pena adicionar o estado de conta SUSPENSA para casos excepcionais?
        //TODO: Vale a pena adicionar o estado de conta INVALIDADA_INCONFORMIDADE para casos excepcionais?
        enum EstadoContaBlockchain {DISPONIVEL,AGUARDANDO_VALIDACAO,VALIDADA,INVALIDADA_CADASTRO,INVALIDADA_TROCA} 
        EstadoContaBlockchain estadosPossiveis; //variavel nao utilizada, apenas para definir o enum

    struct PJInfo {
        uint cnpj;
        uint idSubcredito;
        uint salic;
        uint cnpjOrigemRepasse;
        bool isRepassador;
        string hashdeclaracao;
        EstadoContaBlockchain estado;
    } 

    mapping (address => PJInfo) public pjsInfo;
    mapping(uint => mapping(uint => address)) cnpjSubEndereco; 

    event CadastroConta(address endereco, uint cnpj, uint idSubcredito, uint salic, uint cnpjOrigemRepasse, bool isRepassador, string hashdeclaracao);
    event TrocaConta(address endereco, uint cnpj, uint idSubcredito, uint salic);//TODO: rever troca. Deveria seguir os mesmos parametros do Cadastro?
    event ValidacaoConta(address endereco);
    event InvalidacaoCadastroConta(address endereco);

    event Liberacao(uint cnpj, uint idSubcredito, uint256 valor);
    event Transferencia(uint fromCnpj, uint fromSubcredito, uint toCnpj, uint256 valor);
    event Repasse(uint fromCnpj, uint fromSubcredito, uint toCnpj, uint256 valor);
    event Resgate(uint cnpj, uint256 valor);
    event LiquidacaoResgate(string hashResgate, string hashComprovante);

    function BNDESCoin() public {
        balanceOf[msg.sender] = 0;
        decimals = 2;
    }

    /**
    Associa um endereço blockchain ao CNPJ
    */
    function cadastra(uint _cnpj, uint _idSubcredito, uint _salic, uint _cnpjOrigemRepasse, bool _isRepassador, string hashdeclaracao) public { 
        address endereco = msg.sender;
        //log("SOLIDITY::cadastra(...) - _cnpj = ", _cnpj);

        // Endereço não pode ter sido cadastrado anteriormente
        require(pjsInfo[endereco].cnpj == 0);

        pjsInfo[endereco] = PJInfo(_cnpj, _idSubcredito, _salic, _cnpjOrigemRepasse, _isRepassador, hashdeclaracao, EstadoContaBlockchain.AGUARDANDO_VALIDACAO);
        
        // Não pode haver outro endereço cadastrado para esse mesmo subcrédito
        if (_idSubcredito > 0) {
            require (cnpjSubEndereco[_cnpj][_idSubcredito] == 0x0);
        }
        
        cnpjSubEndereco[_cnpj][_idSubcredito] = endereco;
        balanceOf[endereco] = 0;
        CadastroConta(endereco, _cnpj, _idSubcredito, _salic, _cnpjOrigemRepasse, _isRepassador, hashdeclaracao);
    }

    /**
    Reassocia um cnpj/subcrédito a um novo endereço da blockchain (o sender)
    */
    function troca(uint _cnpj, uint _idSubcredito) public {
        address enderecoNovo = msg.sender;
        // O endereço novo não pode estar sendo utilizado
        require(pjsInfo[enderecoNovo].cnpj == 0);

        // Tem que haver um endereço associado a esse cnpj/subcrédito
        require(cnpjSubEndereco[_cnpj][_idSubcredito] != 0x0000000000000000000000000000000000000000);

        address enderecoAntigo = cnpjSubEndereco[_cnpj][_idSubcredito];

        require(enderecoNovo != enderecoAntigo);

        // Se há saldo no enderecoAntigo, precisa transferir
        if (getBalanceOf(enderecoAntigo) > 0) {
            _transfer(enderecoAntigo, enderecoNovo, getBalanceOf(enderecoAntigo));
        }

        // Aponta o novo endereço para o registro existente no mapping
        pjsInfo[enderecoNovo] = pjsInfo[enderecoAntigo];
        // Apaga o mapping do endereço antigo
        pjsInfo[enderecoAntigo] = PJInfo(0, 0, 0, 0, false, "", EstadoContaBlockchain.INVALIDADA_TROCA);
        // Aponta mapping CNPJ e Subcredito para enderecoNovo
        cnpjSubEndereco[_cnpj][_idSubcredito] = enderecoNovo;

        TrocaConta(enderecoNovo, _cnpj, _idSubcredito, 0); //TODO: refatorar para incluir salic no metodo troca 
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

    function getPJInfo (address _addr) view public returns (uint, uint, uint, string, uint) {
        return (pjsInfo[_addr].cnpj, pjsInfo[_addr].idSubcredito, pjsInfo[_addr].salic, pjsInfo[_addr].hashdeclaracao, (uint) (pjsInfo[_addr].estado));
    }

    function getContaBlockchain(uint256 _cnpj, uint256 _idSubcredito) view public returns (address) {
        return cnpjSubEndereco[_cnpj][_idSubcredito];
    }

    function transfer (address _to, uint256 _value) public {
        address from = msg.sender;

        // O cara não é louco de transferir para si mesmo!!!
        require(from != _to);

        // Se a origem eh o BNDES, eh uma liberacao`
        if (isBNDES(from)) {
            // A conta de destino existe        
            require(pjsInfo[_to].cnpj != 0);

            require(isCliente(_to));

            mintToken(_to, _value);
            Transfer(from, _to, _value); // Evento do ERC-20 para manter o padrão na visualização da transação 
            Liberacao(pjsInfo[_to].cnpj, pjsInfo[_to].idSubcredito, _value);
        } else {
            // A conta de origem existe
            require(pjsInfo[from].cnpj != 0);

            // O Cadastro esta valido para operar o BNDESToken
            require(pjsInfo[from].estado == EstadoContaBlockchain.VALIDADA);

            if (isBNDES(_to)) {
                // _to eh o BNDES. Entao eh resgate

                // Grante que a conta de origem eh um fornecedor
                require(isFornecedor(from));

                burnFrom(from, _value);
                Resgate(pjsInfo[from].cnpj, _value);
            } else {
                // Se nem from nem to são o Banco, eh transferencia normal

                // A conta de destino existe        
                require(pjsInfo[_to].cnpj != 0);

                // A conta de destino existe        
                require(pjsInfo[_to].cnpj != 0);

                // Verifica se é transferência para repassador
                if (isRepassador(_to)) {
                    require(isCliente(from));

                    // Garante que esse repassador é repassador do 
                    // conjunto cliente/subcrédito
                    require(isRepassadorSubcredito(_to, from));
                    Repasse(pjsInfo[from].cnpj, pjsInfo[from].idSubcredito, pjsInfo[_to].cnpj, _value);
                } else {
                    require(isFornecedor(_to));

                    require(isCliente(from) || isRepassador(from));
                    Transferencia(pjsInfo[from].cnpj, pjsInfo[from].idSubcredito, pjsInfo[_to].cnpj, _value);
                }
  
                _transfer(msg.sender, _to, _value);
            }
        }
    }

    function validarCadastro(address _addr, string _hashdeclaracao) onlyOwner public {
        require(pjsInfo[_addr].estado == EstadoContaBlockchain.AGUARDANDO_VALIDACAO);
        require(keccak256(pjsInfo[_addr].hashdeclaracao) == keccak256(_hashdeclaracao));
        pjsInfo[_addr].estado = EstadoContaBlockchain.VALIDADA;
        ValidacaoConta(_addr);
    }

    function invalidarCadastro(address _addr) onlyOwner public {
        require(pjsInfo[_addr].estado == EstadoContaBlockchain.AGUARDANDO_VALIDACAO);
        pjsInfo[_addr].estado = EstadoContaBlockchain.INVALIDADA_CADASTRO;
        InvalidacaoCadastroConta(_addr);
    }

    function isContaValidada(address _addr) view public returns (bool) {
        return pjsInfo[_addr].estado == EstadoContaBlockchain.VALIDADA;
    }

    function isRepassador(address _addr) view public returns (bool) {
        if (_addr == owner)
            return false;
        return pjsInfo[_addr].isRepassador;
    }

    function isFornecedor(address _addr) view public returns (bool) {
        if (_addr == owner)
            return false;
        return pjsInfo[_addr].idSubcredito == 0;
    }

    function isCliente (address _addr) view public returns (bool) {
        if (_addr == owner)
            return false;
        return pjsInfo[_addr].idSubcredito != 0 && !pjsInfo[_addr].isRepassador;
    }

    function isBNDES(address _addr) view public returns (bool) {
        return (_addr == owner);
    }

    function isRepassadorSubcredito(address _addrRepassador, address _addrSubcredito) view public returns (bool) {
        if (_addrSubcredito == owner || _addrRepassador == owner) 
            return false;
        return pjsInfo[_addrRepassador].cnpjOrigemRepasse == pjsInfo[_addrSubcredito].cnpj && 
            pjsInfo[_addrRepassador].idSubcredito == pjsInfo[_addrSubcredito].idSubcredito;
    }


    function notificaLiquidacaoResgate(string hashResgate, string hashComprovante) onlyOwner public {
        LiquidacaoResgate(hashResgate, hashComprovante);
    }

    function setBalanceOf(address _addr, uint256 _value) onlyOwner public {
        require(_value >= 0);
        require(pjsInfo[_addr].cnpj != 0);

        uint256 delta = _value - balanceOf[_addr];
        totalSupply += delta;

        balanceOf[_addr] = _value;
    }

    function getEstadoContaAsString(address _addr) view public returns (string) {

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
pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract BNDESRegistry is Ownable() {

    enum BlockchainAccountState {AVAILABLE,WAITING_VALIDATION,VALIDATED,INVALIDATED_BY_VALIDATOR,INVALIDATED_BY_CHANGE} 
    BlockchainAccountState blockchainState; //Not used. Defined to create the enum type.

    address responsibleForSettlement;
    address responsibleForRegistryValidation;
    address responsibleForDisbursement;
    address redemptionAddress;

    struct LegalEntityInfo {
        uint cnpj;
        uint idFinancialSupportAgreement; //subcredit
        uint salic;
        string idProofHash;
        BlockchainAccountState state;
    } 

    mapping(address => LegalEntityInfo) public legalEntitiesInfo;

    //cnpj => (idFinancialSupportAgreement => address)
    mapping(uint => mapping(uint => address)) cnpjFSAddr; 


    event AccountRegistration(address addr, uint cnpj, uint idFinancialSupportAgreement, uint salic, string idProofHash);
    event AccountChange(address addr, uint cnpj, uint idFinancialSupportAgreement, uint salic, string idProofHash);
    event AccountValidation(address addr);
    event AccountInvalidation(address addr);


    constructor () public {
        responsibleForSettlement = msg.sender;
        responsibleForRegistryValidation = msg.sender;
        responsibleForDisbursement = msg.sender;
        redemptionAddress = msg.sender;
    }


    /**
    Associa um endereço blockchain ao CNPJ
    */
    function registryLegalEntity(uint cnpj, uint idFinancialSupportAgreement, uint salic, string memory idProofHash) public { 

        address addr = msg.sender;

        // Endereço não pode ter sido cadastrado anteriormente
        require (isAvailableAccount(addr), "Endereço não pode ter sido cadastrado anteriormente");

        legalEntitiesInfo[addr] = LegalEntityInfo(cnpj, idFinancialSupportAgreement, salic, idProofHash, BlockchainAccountState.WAITING_VALIDATION);
        
        // Não pode haver outro endereço cadastrado para esse mesmo subcrédito
        if (idFinancialSupportAgreement > 0) {
            address account = getBlockchainAccount(cnpj,idFinancialSupportAgreement);
            require (isAvailableAccount(account) 
                    || isInvalidatedByChangeAccount(account) 
                    || isInvalidatedByValidatorAccount(account)
            , "Subcredito já está associado a outro endereço válido");
        }
        
        cnpjFSAddr[cnpj][idFinancialSupportAgreement] = addr;

        emit AccountRegistration(addr, cnpj, idFinancialSupportAgreement, salic, idProofHash);
    }

    /**
    Reassocia um cnpj/subcrédito a um novo endereço da blockchain (o sender)
    */
    function changeAccountLegalEntity(uint cnpj, uint idFinancialSupportAgreement, uint salic, string memory idProofHash) public {

        address newAddr = msg.sender;
        address oldAddr = getBlockchainAccount(cnpj, idFinancialSupportAgreement);

        // Tem que haver um endereço associado a esse cnpj/subcrédito
        require(!isReservedAccount(oldAddr), "Não pode trocar endereço de conta reservada");

        require(!isAvailableAccount(oldAddr), "Tem que haver um endereço associado a esse cnpj/subcrédito");

        require(isAvailableAccount(newAddr), "Novo endereço não está disponível");

        require(newAddr != oldAddr, "O endereço novo deve ser diferente do antigo");

        require(legalEntitiesInfo[oldAddr].cnpj==cnpj 
                    && legalEntitiesInfo[oldAddr].idFinancialSupportAgreement ==idFinancialSupportAgreement, 
                    "Dados inconsistentes de cnpj ou subcrédito");

        // Aponta o novo endereço para o novo LegalEntityInfo
        legalEntitiesInfo[newAddr] = LegalEntityInfo(cnpj, idFinancialSupportAgreement, salic, idProofHash, BlockchainAccountState.WAITING_VALIDATION);

        // Apaga o mapping do endereço antigo
        legalEntitiesInfo[oldAddr] = LegalEntityInfo(0, 0, 0, "", BlockchainAccountState.INVALIDATED_BY_CHANGE);

        // Aponta mapping CNPJ e Subcredito para newAddr
        cnpjFSAddr[cnpj][idFinancialSupportAgreement] = newAddr;

        emit AccountChange(newAddr, cnpj, idFinancialSupportAgreement, salic, idProofHash); 

    }


    function validateRegistryLegalEntity(address addr, string memory idProofHash) onlyOwner public {

        require(legalEntitiesInfo[addr].state == BlockchainAccountState.WAITING_VALIDATION, "A conta precisa estar no estado Aguardando Validação");

        require(keccak256(abi.encodePacked(legalEntitiesInfo[addr].idProofHash)) == keccak256(abi.encodePacked(idProofHash)), "O hash recebido é diferente do esperado");

        legalEntitiesInfo[addr].state = BlockchainAccountState.VALIDATED;

        emit AccountValidation(addr);
    }

    function invalidateRegistryLegalEntity(address addr) onlyOwner public {

        legalEntitiesInfo[addr].state = BlockchainAccountState.INVALIDATED_BY_VALIDATOR;
        
        emit AccountInvalidation(addr);
    }


    function setResponsibleForSettlement(address rs) onlyOwner public {
        responsibleForSettlement = rs;
    }
    function setResponsibleForRegistryValidation(address rs) onlyOwner public {
        responsibleForRegistryValidation = rs;
    }
    function setResponsibleForDisbursement(address rs) onlyOwner public {
        responsibleForDisbursement = rs;
    }
    function setRedemptionAddress(address rs) onlyOwner public {
        redemptionAddress = rs;
    }

    function isResponsibleForSettlement(address addr) view public returns (bool) {
        return (addr == responsibleForSettlement);
    }
    function isResponsibleForRegistryValidation(address addr) view public returns (bool) {
        return (addr == responsibleForRegistryValidation);
    }
    function isResponsibleForDisbursement(address addr) view public returns (bool) {
        return (addr == responsibleForDisbursement);
    }
    function isRedemptionAddress(address addr) view public returns (bool) {
        return (addr == redemptionAddress);
    }

    function isReservedAccount(address addr) view public returns (bool) {

        if (isOwner(addr) || isResponsibleForSettlement(addr) 
                           || isResponsibleForRegistryValidation(addr)
                           || isResponsibleForDisbursement(addr)
                           || isRedemptionAddress(addr) ) {
            return true;
        }
        return false;
    }
    function isOwner(address addr) view public returns (bool) {
        return owner()==addr;
    }

    function isSupplier(address addr) view public returns (bool) {

        if (isReservedAccount(addr))
            return false;

        if (isAvailableAccount(addr))
            return false;

        return legalEntitiesInfo[addr].idFinancialSupportAgreement == 0;
    }

    function isValidatedSupplier (address addr) view public returns (bool) {
        return isSupplier(addr) && (legalEntitiesInfo[addr].state == BlockchainAccountState.VALIDATED);
    }

    function isClient (address addr) view public returns (bool) {
        if (isReservedAccount(addr)) {
            return false;
        }
        return legalEntitiesInfo[addr].idFinancialSupportAgreement != 0;
    }

    function isValidatedClient (address addr) view public returns (bool) {
        return isClient(addr) && (legalEntitiesInfo[addr].state == BlockchainAccountState.VALIDATED);
    }

    function isAvailableAccount(address addr) view public returns (bool) {
        if ( isReservedAccount(addr) ) {
            return false;
        } 
        return legalEntitiesInfo[addr].state == BlockchainAccountState.AVAILABLE;
    }

    function isWaitingValidationAccount(address addr) view public returns (bool) {
        return legalEntitiesInfo[addr].state == BlockchainAccountState.WAITING_VALIDATION;
    }

    function isValidatedAccount(address addr) view public returns (bool) {
        return legalEntitiesInfo[addr].state == BlockchainAccountState.VALIDATED;
    }

    function isInvalidatedByValidatorAccount(address addr) view public returns (bool) {
        return legalEntitiesInfo[addr].state == BlockchainAccountState.INVALIDATED_BY_VALIDATOR;
    }

    function isInvalidatedByChangeAccount(address addr) view public returns (bool) {
        return legalEntitiesInfo[addr].state == BlockchainAccountState.INVALIDATED_BY_CHANGE;
    }

    function getResponsibleForSettlement() view public returns (address) {
        return responsibleForSettlement;
    }
    function getResponsibleForRegistryValidation() view public returns (address) {
        return responsibleForRegistryValidation;
    }
    function getResponsibleForDisbursement() view public returns (address) {
        return responsibleForDisbursement;
    }
    function getRedemptionAddress() view public returns (address) {
        return redemptionAddress;
    }

    function getCNPJ(address addr) view public returns (uint) {
        return legalEntitiesInfo[addr].cnpj;
    }

    function getIdLegalFinancialAgreement(address addr) view public returns (uint) {
        return legalEntitiesInfo[addr].idFinancialSupportAgreement;
    }

    function getLegalEntityInfo (address addr) view public returns (uint, uint, uint, string memory, uint, address) {
        return (legalEntitiesInfo[addr].cnpj, legalEntitiesInfo[addr].idFinancialSupportAgreement, 
             legalEntitiesInfo[addr].salic, legalEntitiesInfo[addr].idProofHash, (uint) (legalEntitiesInfo[addr].state),
             addr);
    }

    function getBlockchainAccount(uint256 cnpj, uint256 idFinancialSupportAgreement) view public returns (address) {
        return cnpjFSAddr[cnpj][idFinancialSupportAgreement];
    }

    function getLegalEntityInfoByCNPJ (uint256 cnpj, uint256 idFinancialSupportAgreement) 
        view public returns (uint, uint, uint, string memory, uint, address) {
        
        address addr = getBlockchainAccount(cnpj,idFinancialSupportAgreement);
        return getLegalEntityInfo (addr);
    }

    function getAccountState(address addr) view public returns (int) {

        if ( isReservedAccount(addr) ) {
            return 100;
        } 
        else {
            return ((int) (legalEntitiesInfo[addr].state));
        }

    }


}
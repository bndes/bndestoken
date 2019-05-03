# BNDES TOKEN

Token para representar as liberações do BNDES de forma a prover mais transparência de recursos públicos. <br>
Do you want to know how to install or execute bndestoken? See Instalation-Execution-Guide.md


# ATORES

1.	BNDES: Empregado(s) do BNDES responsável(is) por (i) analisar os cadastros de clientes e fornecedores, (ii) realizar as liberações de crédito e (iii) efetivar os resgates.

2.	Cliente: Cliente contratado do BNDES, que obteve um financiamento ou apoio não reembolsável para o desenvolvimento e/ou implantação de um projeto.

3.	Fornecedor: Entidade pessoa jurídica que fornece produtos ou serviços ao Cliente, e por ele é remunerada para o desenvolvimento e/ou implantação de projeto que foi objeto de financiamento ou apoio não reembolsável.

4.	Sociedade: Qualquer cidadão que deseje acompanhar as liberações, transferências e resgates relacionados a financiamentos e/ou apoios não reembolsáveis feitos pelo BNDES.


# FUNCIONALIDADES

1.	BNDES:

a.	Liberar – Permite que o BNDES libere recursos para um cliente de um financiamento ou apoio não reembolsável. São pré-requisitos que o financiamento ou apoio já tenham sido contratados junto ao BNDES e que o Cliente tenha realizado o cadastro da sua conta Blockchain.

b.	Validar Cadastro – Permite que o BNDES valide o cadastro da conta Blockchain de um Cliente ou Fornecedor após a checagem dos dados cadastrados na aplicação e dos documentos enviados.

c.	Liquidar Resgates – Permite que o BNDES liquide os resgastes solicitados pelo Fornecedor, ou seja, que os BNDESTokens detidos pelo Fornecedor sejam devolvidos ao BNDES e queimados na sequência, mediante a transferência do valor correspondente em dinheiro fiduciário para a conta corrente do Fornecedor.

2.	Cliente:

a.	Associar Conta – Permite que o Cliente associe a sua conta Blockchain ao seu CNPJ e subcrédito, mediante o envio de uma declaração assinada com o seu e-CNPJ.

b.	Transferir – Permite que o Cliente transfira BNDESTokens para um Repassador ou para um Fornecedor, mediante o registro da justificativa para transferência e a associação opcional de um documento de suporte à transação, como o link de uma nota fiscal eletrônica ou um recibo digitalizado.

c.	Consultar Transferências – Permite que o Ciente visualize as transferências de BNDESTokens realizadas.

d.	Trocar Conta – Permite que o Cliente troque a conta Blockchain associada a um subcrédito, mediante o envio de nova declaração assinada com o seu e-CNPJ. O Cliente pode precisar trocar a conta devido à perda ou ao roubo da chave privada.

3.	Fornecedor:

a.	Associar Conta - Permite que o Fornecedor associe a sua conta Blockchain e a sua conta corrente ao seu CNPJ, mediante o envio de uma declaração assinada com o seu e-CNPJ.

b.	Solicitar Resgate – Permite que o fornecedor solicite o resgate de BNDESTokens que estão sob sua posse junto ao BNDES.

c.	Trocar Conta – Permite que o Fornecedor troque a conta Blockchain associada a um subcrédito. O Fornecedor pode precisar trocar a conta devido à perda ou ao roubo da chave privada.

4.	Sociedade:

a.	Dashboard Cadastro – Permite que a Sociedade acesse as informações das transações de cadastro de contas Blockchain de Clientes, Repassadores e Fornecedores.

b.	Dashboard Transações – Permite que a Sociedade acesse as informações das transações de liberação, transferência, solicitações de resgate e liquidações de resgate entre o BNDES, Clientes, Repassadores e Fornecedores.


# COMPONENTES

1.	Front: interface visual da aplicação, com telas para acessar as funcionalidades descritas abaixo. O front está escrito em Angular 4.

2.	Back: camada da aplicação responsável pela integração com os sistemas legados escrita em NodeJS. Hoje, os sistemas legados estão mockados numa base Mongo.

3.	Back-Blockchain: camada da aplicação que é executada on-chain. Os smarts contracts fazem parte dessa camada e são escritos em Solidity.

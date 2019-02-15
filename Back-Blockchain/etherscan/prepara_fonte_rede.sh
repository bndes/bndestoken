saida=fonte.sol
echo 'Selecione no etherscan a opcao SEM Otimizacao'
echo 'Escolha a versao correta do compilar, tal como mostrado abaixo' 
truffle version
echo 'nome do arquivo a utilizar: ' $saida
cat owned.sol                                            > $saida
echo ' '                                                 >> $saida 
cat TokenERC20.sol | grep -v 'pragma'                    >> $saida
echo ' '                                                 >> $saida
cat BNDESToken.sol | grep -v 'pragma' | grep -v 'import' >> $saida
echo ' '

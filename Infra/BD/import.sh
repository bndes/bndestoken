if [ $# -eq 0 ]
  then
    echo ' '
    echo "Especifique um identificador para os arquivos a importar (p.e. dsvi ou dsve)"
    echo ' '
    exit
fi
#
echo ' '
echo 'Importando arquivos: mongodb_'$1'_*.txt'
echo ' '
mongoimport --db bndescoin --collection pessoasjuridicas    --file ./mongodb_$1_pessoasjuridicas.txt
mongoimport --db bndescoin --collection resgates            --file ./mongodb_$1_resgates.txt
mongoimport --db bndescoin --collection transferencias      --file ./mongodb_$1_transferencias.txt

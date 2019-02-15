if [ $# -eq 0 ]
  then
    echo ' '
    echo "Especifique um identificador para os arquivos a exportar (p.e. dsvi ou dsve)"
    echo ' '
    exit
fi
#
echo ' '
echo 'Gerando arquivos: mongodb_'$1'_*.txt'
echo ' '
mongoexport --db bndescoin --collection pessoasjuridicas    --out ./mongodb_$1_pessoasjuridicas.txt
mongoexport --db bndescoin --collection resgates 			--out ./mongodb_$1_resgates.txt
mongoexport --db bndescoin --collection transferencias 		--out ./mongodb_$1_transferencias.txt
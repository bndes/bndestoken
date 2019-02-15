#mongoexport" --db bndescoin --collection pessoasjuridicas --out  C:\workspace\coin-app\BD\PJ.json

BD_INICIALIZADO_PATH=./bd-inicializado.marcador

sleep 5

if [[ ! -f ${BD_INICIALIZADO_PATH} ]]; then
	mongo bndescoin --eval 'db.pessoasjuridicas.drop()'
	mongo bndescoin --eval 'db.resgates.drop()'
	mongo bndescoin --eval 'db.transferencias.drop()'
	mongoimport --db bndescoin --collection pessoasjuridicas --file PJ.json
	touch ${BD_INICIALIZADO_PATH}
fi

// Set up
var express = require('express');
var app = express();                               // create our app w/ express
var mongoose = require('mongoose');                     // mongoose for mongodb
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
var cors = require('cors');
var Promise = require('bluebird');
var config = require('./config.json');
var multer = require('multer');

var crypto = require('crypto');
var fs = require('fs')
//const Web3 = require('web3')


var contratoJson = require(config.infra.contrato_json);

var smartContract;
var ABI;
var endereco_websocket;

// Configuration
mongoose.connect(config.infra.addr_bd);

app.use(bodyParser.urlencoded({ 'extended': 'true' }));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());
app.use(cors());

app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

	next();
});

Promise.promisifyAll(mongoose); // key part - promisification


var PessoasJuridicas = mongoose.model('Pessoasjuridicas', {

	cnpj: String,
	dadosCadastrais: {
		cidade: String,
		razaoSocial: String,
		CNAE: String,
		email: String,
		telefone: String
	},
	subcreditos: [{
		numero: Number,
		nome: String,
		contaBlockchain: String,
		isActive: Boolean,
		papel: String
	}],
	contasFornecedor: [{
		numero: Number,
		nome: String,
		contaBlockchain: String,
		isActive: Boolean,
		dadosBancarios: {
			banco: String,
			agencia: String,
			contaCorrente: String
		}
	}]
});

var Liberacoes = mongoose.model('Liberacoes', {
	contaBlockchainOrigem: String,
	cnpjDestino: String,
	contaBlockchainDestino: String,
	numeroSubcredito: String,
	hashOperacao: String,
	dataHora: Date
});


var Transferencias = mongoose.model('Transferencias', {

	contaBlockchainOrigem: String,
	cnpjDestino: String,
	razaoSocialDestino: String,
	contaBlockchainDestino: String,
	numeroSubcredito: String,
	descricao: String,
	hashOperacao: String,
	documentoDeSuporte: String,
	dataHora: Date
});

var Resgates = mongoose.model('Resgates', {

	contaBlockchainOrigem: String,
	cnpjOrigem: String,
	razaoSocialOrigem: String,
	saldoOrigem: Number,
	bancoOrigem: Number,
	agenciaOrigem: Number,
	contaCorrenteOrigem: String,
	ehFornecedor: Boolean,
	contaBlockchainBNDES: String,
	isLiquidado: Boolean,
	hashOperacao: String,
	hashLiquidacao: String,
	dataHora: Date,
	comprovante: {
		nome: String,
		hash: String
	}
});

// Rotas
/*
	//use para pegar qq verbo hhtp
	//verifica autenticacao para todas as rotas abaixo
	app.use('/*', function(req, res, next) {
		console.log("Sempre passa por aqui");
		next();
    });
*/

var n = contratoJson.networks;
var accounts;

console.log("config.infra.rede_blockchain (4=Rinkeby|4447=local) = " + config.infra.rede_blockchain);
	
ABI = contratoJson['abi']
//console.log( "abi = ", this.ABI )

let addrContrato;
if (config.infra.rede_blockchain == 4) { //Rinkeby 
	addrContrato = config.infra.endereco_contrato_rinkeby
	endereco_websocket = config.infra.endereco_websocket_rinkeby
}
else {
	
	try {
		let test = n[config.infra.rede_blockchain].address 
	} catch (error) {
		console.log ("ERROR. Consider: ")
		console.log ("1) remove the back-blockchain/build and then migrate again...")
		console.log ("2) the number of the network in your config.json")
		console.log ("	networks = " + n)
		console.log ("	config.infra.rede_blockchain = " + config.infra.rede_blockchain)
		console.log ("	networks[config.infra.rede_blockchain] = " + n[config.infra.rede_blockchain])		
		process.exit();
	}
	addrContrato = n[config.infra.rede_blockchain].address;
	endereco_websocket = config.infra.endereco_websocket
}

console.log("endereco do contrato=" + addrContrato);
console.info("endereco_websocket", endereco_websocket);

if (1 == 2) {
	instanciaWeb3eSmartC()
	let bloco = 1;

	console.log("/api/liberacao/eventos/from :: bloco = ", bloco);

	smartContract
		.getPastEvents('Liberacao', { fromBlock: bloco })
		.then(events => { console.info('getPastEvents', events); })
}

if (1 == 2) {
	instanciaWeb3eSmartC()
	console.log("/api/liberacao/eventos");

	smartContract.events
		.Liberacao()
		.on('data', event => { console.info('data', event); })
		.on('error', event => { console.info('data', event); })
		.on('changed', event => { console.info('data', event); })
}

// Exemplo de como seria o node fazer chamadas ao smartcontract
function instanciaWeb3eSmartC() {
	console.log("endereco_websocket" + endereco_websocket)
	console.log("ABI" + ABI)
	console.log("addrContrato" + addrContrato)
	var provedor = new Web3.providers.WebsocketProvider(endereco_websocket)

	/* Trecho comentado porque a biblioteca scrypt precisa ser compilada qdo faz o npm install (inviavel no servidor do bndes)
	web3 = new Web3( provedor )
	smartContract = new web3.eth.Contract( ABI, addrContrato )
	// caso seja metodo de leitura use o call - https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#id16
	// senao, use o send
	if (1==2) {
		smartContract.methods.getVersao().call( function(error, result){ 
			if (error) console.log("Backend - associaContaCliente - instanciaWeb3eSmartC - erro " + error );
			if (result) console.log("Backend - associaContaCliente - instanciaWeb3eSmartC - OK " + result );
		});
	}
	if (1==2) {
		smartContract.methods.setTotalSupply(1)
					.send( { from: "0xd636349f5D7E03037e0f224c9B1AC3cCf104f4a5", gas: 500000 }, function(error, transactionHash){ 
			if (error) console.log("Backend - associaContaCliente - setTotalSupply - erro " + error );
			if (transactionHash) console.log("Backend - associaContaCliente - setTotalSupply - OK " + transactionHash );
		});
	}
	*/
}
function web3BuscaAccounts() {
	if (accounts === undefined || accounts === null) {
		web3.eth.getAccounts().then(accounts => {
			console.log("Backend - associaContaCliente - a[] " + accounts)
		}
		);
	}

}
function web3BuscaAccount(indice) {
	if (accounts === undefined || accounts === null) {
		web3.eth.getAccounts().then(accounts => {
			console.log("Backend - associaContaCliente - a[" + indice + "] " + accounts[indice])
		}
		);
	}

}



app.get('/api/abi', function (req, res) {
	res.json(contratoJson);
})

//recupera constantes front
app.post('/api/constantesFront', function (req, res) {
	res.json({ addrContrato: addrContrato });
});

// Get 1 pj
app.get('/api/pj/:id', function (req, res) {

	let pj_id = req.params.id;

	console.log("buscar pj " + pj_id);


	Promise.props({
		pj: PessoasJuridicas.findById(pj_id).execAsync()

	})
		.then(function (results) {

			let pj = results.pj;
			res.json(pj);
		})
		.catch(function (err) {
			console.log("erro ao buscar pj");
		});


});

app.post('/api/populabb', populaBaseEBlockchain);
function populaBaseEBlockchain(req, res) {
	//TODO: implementar chamadas ao smartcontract via WEB3
}

//criei como post porque o cnpj estah salvo com o caracter '/'
app.post('/api/pj-por-cnpj', buscaPJPorCnpj);

function buscaPJPorCnpj(req, res, next) {
	console.info("buscaPJPorCnpj");
	let cnpjRecebido = req.body.cnpj;
	console.info("cnpjRecebido:", cnpjRecebido);
	Promise.props({
		pjs: PessoasJuridicas.find({
			cnpj: cnpjRecebido
		}).execAsync()
	})

		.then(function (results) {

			let pjs = results.pjs;
			let pj = pjs[0];
			console.log(pj);

			res.json(pj);
		})
		.catch(function (err) {
			console.log("erro ao buscar pjs  por cnpj");
		})
		.finally(next);
}


//criei como post porque o cnpj estah salvo com o caracter '/'
app.post('/api/pj-por-contaBlockchain', buscaPJPorContaBlockchain);


function buscaPJPorContaBlockchain(req, res) {

	let contaBlockchainRecebida = req.body.contaBlockchainCNPJ;
	console.log("pj-por-contaBlockchain com conta " + contaBlockchainRecebida);


	Promise.props({
		pjs: PessoasJuridicas.find({
			$or: [
				{ 'contasFornecedor.contaBlockchain': contaBlockchainRecebida },
				{ 'subcreditos.contaBlockchain': contaBlockchainRecebida }
			]
		}).execAsync()
	})
		.then(function (results) {

			let pjs = results.pjs;

			res.json(pjs[0]);

		})
		.catch(function (err) {
			console.log("erro ao buscar pjs  por contaBlockchain");
		});
}


app.post('/api/transf-por-subcredito-hashID', buscaTransfPorSubcreditoEHashID);

function buscaTransfPorSubcreditoEHashID(req, res) {

	console.log("Buscando por hash e subrecdito")

	let numeroSubcreditoRecebido = req.body.numeroSubcredito;
	let hashIDRecebido = req.body.hashID

	console.log(numeroSubcreditoRecebido)

	var paramFixo = { hashOperacao: hashIDRecebido }
	var paramDinamico = numeroSubcreditoRecebido != -1 ? { numeroSubcredito: numeroSubcreditoRecebido } : {}

	Promise.props({
		transf: Transferencias.find(paramFixo).find(paramDinamico).execAsync()
	})
		.then(function (results) {

			let transf = results.transf;
			console.log(transf)
			res.json(transf);
		})
		.catch(function (err) {
			console.log("erro ao buscar transfs  por HashID");
		});
}


app.post('/api/resg-nao-liquidados', buscaResgNaoLiquidados);

function buscaResgNaoLiquidados(req, res) {

	console.log("buscaResgNaoLiquidados")

	let cnpj = req.body.cnpj;

	Promise.props({
		resgates: Resgates.find({
			isLiquidado: false
		}).execAsync()
	})
		.then(function (results) {
			let resgates = results.resgates;

			res.json(resgates);
		})
		.catch(function (err) {
			console.log("Erro ao buscar os resgates por CNPJ");
		});
}



// Recupera pjs
app.get('/api/pjs', buscaPJs);

function buscaPJs(req, res) {

	console.log("buscar pjs");

	Promise.props({
		pjs: PessoasJuridicas.find().execAsync()
	})

		.then(function (results) {

			let pjs = results.pjs;

			res.json(pjs);

		})
		.catch(function (err) {
			console.log("erro ao buscar pjs");
		});
}



app.post('/api/associa-conta-cliente', function (req, res) {

	console.log("Backend - associaContaCliente - iniciando");

	let receivedData = req.body;

	PessoasJuridicas.findById(receivedData.cliente.id, function (err, pj) {
		if (err) {
			console.log("Erro ao buscar pessoa juridica");
			res.sendStatus(500);

		}
		else {

			//modifica a conta blockchain do subcredito adequado
			let subcreditos = pj.subcreditos;

			pj.dadosCadastrais = receivedData.cliente.dadosCadastrais;

			for (let i = 0; i < subcreditos.length; i++) {
				if (subcreditos[i].numero == receivedData.subcredito) {
					subcreditos[i].contaBlockchain = receivedData.contaBlockchain;
					subcreditos[i].isActive = true;
					subcreditos[i].papel = "cliente";
					break;
				}
			}

			pj.save(function (err, pjAlterado) {

				if (err) {
					console.log("Erro ao pj: " + pjAlterado);
					console.log("Erro: " + err);
					res.sendStatus(500);
				}
				else {
					console.log("Salvou pj");
					res.json(pjAlterado);
				}

			}); //fecha save

		} //fecha else

	}); //fecha find

});


app.post('/api/associa-conta-repassador', function (req, res) {

	console.log("associa conta repassador");

	let receivedData = req.body;

	PessoasJuridicas.findById(receivedData.repassador.id, function (err, pj) {
		if (err) {
			console.log("Erro ao buscar pessoa juridica");
			res.sendStatus(500);

		}
		else {

			// adiciona o novo subcredito/conta que foram associados
			pj.subcreditos = receivedData.repassador.subcreditos;

			pj.save(function (err, pjAlterado) {

				if (err) {
					console.log("Erro ao pj: " + pjAlterado);
					console.log("Erro: " + err);
					res.sendStatus(500);
				}
				else {
					console.log("Salvou pj");
					res.json(pjAlterado);
				}

			}); //fecha save

		} //fecha else

	}); //fecha find

});


app.post('/api/associa-conta-fornecedor', function (req, res) {

	console.log("associa conta fornecedor");

	let receivedData = req.body;

	PessoasJuridicas.findById(receivedData.fornecedor.id, function (err, pj) {
		if (err) {
			console.log("Erro ao buscar pessoa juridica");
			res.sendStatus(500);

		}
		else {

			//modifica a conta blockchain do subcredito adequado - por simplificacao eh a primeira e unica conta
			// pj.dadosCadastrais = receivedData.fornecedor.dadosCadastrais;
			// pj.contaFornecedor.dadosBancarios = receivedData.fornecedor.contaFornecedor.dadosBancarios;
			pj.contasFornecedor = receivedData.fornecedor.contasFornecedor;

			pj.save(function (err, pjAlterado) {

				if (err) {
					console.log("Erro ao pj: " + pjAlterado);
					console.log("Erro: " + err);
					res.sendStatus(500);
				}
				else {
					console.log("Salvou pj");
					res.json(pjAlterado);
				}

			}); //fecha save

		} //fecha else

	}); //fecha find

});

app.post('/api/troca-conta-cliente', function (req, res) {

	console.log("Backend - trocaContaCliente - iniciando");

	let requisicao = req.body;

	PessoasJuridicas.findById(requisicao.cliente.id, function (err, pj) {
		if (err) {
			console.log("Erro ao buscar pessoa juridica");
			res.sendStatus(500);

		}
		else {

			//modifica a conta blockchain do subcredito adequado
			let subcreditos = pj.subcreditos;

			pj.dadosCadastrais = requisicao.cliente.dadosCadastrais;

			for (let i = 0; i < subcreditos.length; i++) {
				if (subcreditos[i].numero == requisicao.numeroSubcredito && subcreditos[i].isActive) {
					subcreditos[i].isActive = false;

					subcreditos.push({
						numero: subcreditos[i].numero,
						nome: subcreditos[i].nome,
						contaBlockchain: requisicao.contaBlockchain,
						isActive: true,
						papel: subcreditos[i].papel
					})

					break;
				}
			}

			pj.save(function (err, pjAlterado) {

				if (err) {
					console.log("Erro ao pj: " + pjAlterado);
					console.log("Erro: " + err);
					res.sendStatus(500);
				}
				else {
					console.log("Salvou pj");
					res.json(pjAlterado);
				}

			}); //fecha save

		} //fecha else

	}); //fecha find

});


app.post('/api/troca-conta-repassador', function (req, res) {

	console.log("Backend - trocaContaRepassador - iniciando");

	let requisicao = req.body;

	PessoasJuridicas.findById(requisicao.repassador.id, function (err, pj) {
		if (err) {
			console.log("Erro ao buscar pessoa juridica");
			res.sendStatus(500);

		}
		else {

			//modifica a conta blockchain do subcredito adequado
			let subcreditos = pj.subcreditos;

			pj.dadosCadastrais = requisicao.repassador.dadosCadastrais;

			for (let i = 0; i < subcreditos.length; i++) {
				if (subcreditos[i].numero == requisicao.numeroSubcredito && subcreditos[i].isActive) {
					subcreditos[i].isActive = false;

					subcreditos.push({
						numero: subcreditos[i].numero,
						nome: subcreditos[i].nome,
						contaBlockchain: requisicao.contaBlockchain,
						isActive: true,
						papel: subcreditos[i].papel
					})

					break;
				}
			}

			pj.save(function (err, pjAlterado) {

				if (err) {
					console.log("Erro ao pj: " + pjAlterado);
					console.log("Erro: " + err);
					res.sendStatus(500);
				}
				else {
					console.log("Salvou pj");
					res.json(pjAlterado);
				}

			}); //fecha save

		} //fecha else

	}); //fecha find

});

app.post('/api/troca-conta-fornecedor', function (req, res) {

	console.log("Backend - trocaContaFornecedor - iniciando");

	let requisicao = req.body;

	console.log(requisicao)

	PessoasJuridicas.findById(requisicao.fornecedor.id, function (err, pj) {
		if (err) {
			console.log("Erro ao buscar pessoa juridica");
			res.sendStatus(500);

		}
		else {

			let contasFornecedor = pj.contasFornecedor

			for (var i = 0; i < contasFornecedor.length; i++) {
				if (contasFornecedor[i].contaBlockchain === requisicao.contaBlockchainAntiga && contasFornecedor[i].isActive) {
					contasFornecedor[i].isActive = false;

					contasFornecedor.push({
						numero: contasFornecedor[i].numero,
						nome: contasFornecedor[i].nome,
						contaBlockchain: requisicao.contaBlockchainNova,
						isActive: true,
						dadosBancarios: {
							banco: contasFornecedor[i].dadosBancarios.banco,
							agencia: contasFornecedor[i].dadosBancarios.agencia,
							contaCorrente: contasFornecedor[i].dadosBancarios.contaCorrente
						}
					});
					break;
				}
			}

			pj.save(function (err, pjAlterado) {
				if (err) {
					console.log("Erro ao pj: " + pjAlterado);
					console.log("Erro: " + err);
					res.sendStatus(500);
				}
				else {
					console.log("Salvou pj");
					res.json(pjAlterado);
				}

			}); //fecha save

		} //fecha else

	}); //fecha find

});

app.post('/api/transferencia', function (req, res) {

	console.log("************* cria transf");

	let novaTransf = req.body;
	let dataAtual = new Date();

	Transferencias.create({
		contaBlockchainOrigem: novaTransf.contaBlockchainOrigem,
		cnpjDestino: novaTransf.cnpjDestino,
		contaBlockchainDestino: novaTransf.contaBlockchainDestino,
		razaoSocialDestino: novaTransf.razaoSocialDestino,
		numeroSubcredito: novaTransf.numeroSubcredito,
		descricao: novaTransf.descricao,
		hashOperacao: novaTransf.hashOperacao,
		documentoDeSuporte: novaTransf.documentoDeSuporte,
		dataHora: dataAtual
	},

		function (err, pjSalva) {
			if (err) {
				console.log("Erro ao criar transf");
				console.log(err);
				res.sendStatus(500);
			}
			else {
				res.json({ sucesso: true });
			}
		});
});

// RESGATE
app.post('/api/resgate', function (req, res) {

	console.log("************* Cria resgate");

	let novaTransf = req.body;
	let dataAtual = new Date();

	Resgates.create({

		contaBlockchainOrigem: novaTransf.contaBlockchainOrigem,
		cnpjOrigem: novaTransf.cnpjOrigem,
		razaoSocialOrigem: novaTransf.razaoSocialOrigem,
		saldoOrigem: novaTransf.saldoOrigem,
		bancoOrigem: novaTransf.bancoOrigem,
		agenciaOrigem: novaTransf.agenciaOrigem,
		contaCorrenteOrigem: novaTransf.contaCorrenteOrigem,
		ehFornecedor: novaTransf.ehFornecedor,
		contaBlockchainBNDES: novaTransf.contaBlockchainBNDES,
		isLiquidado: false,
		hashOperacao: novaTransf.hashID,
		hashLiquidacao: 0,
		dataHora: dataAtual,
		comprovante: {
			nome: "",
			hash: ""
		}
	},

		function (err, pjResgata) {
			if (err) {
				console.log("Erro ao criar resgate");
				console.log(err);
				res.sendStatus(500);
			}
			else {
				res.json({ sucesso: true });
			}
		});
});

//LIBERAÇÃO
app.post('/api/liberacao', function (req, res) {

	let requisicao = req.body;
	let dataAtual = new Date();

	Liberacoes.create({
		contaBlockchainBNDES: requisicao.contaBlockchainBNDES,
		cnpjDestino: requisicao.cnpj,
		contaBlockchainDestino: requisicao.contaBlockchainCNPJ,
		numeroSubcredito: requisicao.numeroSubcreditoSelecionado,
		hashOperacao: requisicao.hashID,
		dataHora: dataAtual
	},

		function (err, pjLiberacao) {
			if (err) {
				console.log("Erro ao criar Liberação");
				console.log(err);
				res.sendStatus(500);
			}
			else {
				res.json({ sucesso: true });
			}
		});
});

//LIQUIDAÇÃO RESGATE
app.post('/api/liquida-resgate', function (req, res) {

	console.log("/api/liquida-resgate")

	let novaTransf = req.body

	Promise.props({
		resgate: Resgates.find({
			hashOperacao: novaTransf.hashID
		}).execAsync()
	})
		.then(function (result) {
			let resgate = result.resgate[0];

			resgate.isLiquidado = true
			resgate.hashLiquidacao = novaTransf.hashIDLiquidacao

			resgate.save(function (err, ResgateAlterado) {

				if (err) {
					console.log("Erro ao liquidar o resgate");
					res.sendStatus(500);
				} else {
					console.log("Alterou o resgate para liquidado");
					res.json(ResgateAlterado);
				}
			})
		})
		.catch(function (err) {
			console.log("Erro ao buscar os resgates por HashID");
		})
}) // fim do post

//BUSCA RESGATE NÃO LIQUIDADO POR HASH
app.post('/api/busca-resgate-nao-liquidado-por-hash', function (req, res) {
	console.log('/api/busca-resgate-nao-liquidado-por-hash')
	let requisicao = req.body

	Promise.props({
		resgate: Resgates.find({
			hashOperacao: requisicao.hashID
		}).execAsync()
	})
		.then(function (result) {
			let resgate = result.resgate[0];
			console.log("Retornando os dados do resgate=" + resgate);
			res.json(resgate);
		})
		.catch(function (err) {
			console.log("Erro ao buscar o resgate não liquidado por HashID");
			res.sendStatus(500);
		})
}) // fim do post

//BUSCA LIQUIDACAO DE RESGATE POR HASH
app.post('/api/busca-liquidacao-resgate-por-hash', function (req, res) {
	let requisicao = req.body
	console.log("/api/busca-liquidacao-resgate-por-hash :: req = " + req);
	console.log("/api/busca-liquidacao-resgate-por-hash :: requisicao = " + requisicao);
	console.log("/api/busca-liquidacao-resgate-por-hash :: requisicao.hashID = " + requisicao.hashID);
	console.log("/api/busca-liquidacao-resgate-por-hash :: requisicao.hashLiquidacao = " + requisicao.hashLiquidacao);

	Promise.props({
		resgate: Resgates.find({
			hashLiquidacao: requisicao.hashID
		}).execAsync()
	})
		.then(function (result) {
			let resgate = result.resgate[0];
			console.log("Retornando os dados do resgate=" + resgate);
			res.json(resgate);

		})
		.catch(function (err) {
			console.log("Erro ao buscar os resgates por HashID");
			res.sendStatus(500);
		})
}) // fim do post


//BUSCA TRANSFERENCIA POR HASH
app.post('/api/busca-transferencia-por-hash', function (req, res) {
	let requisicao = req.body;

	console.log("Buscar Tranferência pelo Hash: " + requisicao.hashID);

	Promise.props({
		transferencia: Transferencias.find({
			hashOperacao: requisicao.hashID
		}).execAsync()
	})
		.then(function (result) {
			let transf = result.transferencia[0];
			res.json(transf);
		})
		.catch(function (err) {
			console.log("Erro ao buscar a transferencia por hashID");
			res.sendStatus(500);
		});
});

//BUSCA LIBERAÇÃO POR HASH
app.post('/api/busca-liberacao-por-hash', function (req, res) {
	let requisicao = req.body;

	console.log("Buscar liberacao pelo hash: " + requisicao.hashID);

	Promise.props({
		liberacao: Liberacoes.find({
			hashOperacao: requisicao.hashID
		}).execAsync()
	})
		.then(function (result) {
			let lib = result.liberacao[0];
			res.json(lib);
		})
		.catch(function (rr) {
			console.log("Erro ao buscar a liberação por hashID");
			res.sendStatus(500);
		});
});

//ALTERAR OS DADOS BANCARIOS DO FORNECEDOR
app.post('/api/alterar-dados-bancarios-fornecedor', function (req, res) {
	let requisicao = req.body

	console.log("Contablockchain recebida " + requisicao.contaBlockchain)
	console.log("Dados Bancarios recebidos ")
	console.log(requisicao.dadosBancarios)

	Promise.props({
		pjs: PessoasJuridicas.find(
			{ 'contasFornecedor.contaBlockchain': requisicao.contaBlockchain }).execAsync()
	})
		.then(function (result) {

			let pjs = result.pjs;

			for (let i = 0; i < pjs[0].contasFornecedor.length; i++) {
				if (pjs[0].contasFornecedor[i].contaBlockchain == requisicao.contaBlockchain) {
					pjs[0].contasFornecedor[i].dadosBancarios = requisicao.dadosBancarios;
				}
			}

			pjs[0].save(function (err, pjAlterado) {

				if (err) {
					console.log("Erro ao alterar os dados bancarios do fornecedor");
					res.sendStatus(500);
				} else {
					console.log("Alterou os dados bancarios do Fornecedor");
					res.json(pjAlterado);
				}
			})

		})
		.catch(function (err) {
			console.log("Erro ao buscar os pjs por contaBlockchain");
			res.sendStatus(500);
		})
}) // fim do post


var store = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './uploads');
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + '-' + file.originalname);

	}
});

var DIR = './uploads/';
var upload = multer({ dest: DIR, storage: store }).single('file');

app.post('/api/upload', function (req, res, next) {
	upload(req, res, function (err) {
		if (err) {
			return res.status(501).json({ error: err });
		}
		console.log(req.file)
		console.log(__dirname + '/' + req.file.destination + '/' + req.filename)

		res.json({ filename: req.file.filename })
	});
});


app.post('/api/upload-liquidacao-resgate', function (req, res) {
	let requisicao = req.body

	console.log("Comprovante")
	console.log(requisicao.comprovante)
	console.log(requisicao.resgate.id)

	Promise.props({
		resgate: Resgates.findById(requisicao.resgate.id, function (err, result) {
			if (err) {
				console.log("Erro ao buscar pessoa juridica");
				res.sendStatus(500);
			}
			else {
				console.log(result)
				let resgate = result;

				var filepath = __dirname + '/uploads/' + requisicao.comprovante.nome

				var sha = crypto.createHash('sha256');

				var s = fs.ReadStream(filepath);
				s.on('data', function (d) {
					sha.update(d);
				});

				s.on('end', function () {
					var hash = sha.digest('hex');
					console.log("HASH: " + "0x" + hash);

					resgate.comprovante.nome = requisicao.comprovante.nome
					resgate.comprovante.hash = "0x" + hash

					console.log("Comprovante")
					console.log(resgate.comprovante)

					resgate.save(function (err, ResgateAlterado) {

						if (err) {
							console.log("Erro ao liquidar o resgate");
							res.sendStatus(500);
						} else {
							console.log("Alterou o resgate para liquidado");
							res.json(ResgateAlterado);
						}
					})

				});
			}
		})
	})
})


app.post('/api/download-liquidacao-resgate', function (req, res) {
	let filename = req.body.filename

	filepath = __dirname + '/uploads/' + filename;
	res.sendFile(filepath);
});

app.post('/api/calcular-hash', function (req, res) {
	let filename = req.body.filename

	var filepath = __dirname + '/uploads/' + filename

	var sha = crypto.createHash('sha256');

	var s = fs.ReadStream(filepath); 
	s.on('data', function (d) {
		sha.update(d);
	});

	s.on('end', function () {
		var hash = "0x" + sha.digest('hex');
		console.log("HASH: " + hash);

		res.json({ hash: hash })
	})
})


// listen (start app with node server.js) ======================================
app.listen(8080, "0.0.0.0");

let data = "\n" + new Date() + "\nApp listening on port 8080 ";
console.log(data);

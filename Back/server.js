// Set up
var express = require('express');
var app = express();                               // create our app w/ express
var mongoose = require('mongoose');                     // mongoose for mongodb
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
var cors = require('cors');
var Promise = require('bluebird');
var config = require('./config.json');
var sql = require("mssql");


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
	},
	subcreditos: [{
		numero: Number,
	}],
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

//Configuracao de acesso ao BD
let configAcessoBDPJ = config.infra.acesso_BD_PJ;
configAcessoBDPJ.password = process.env.BNC_BD_PJ_PASSWORD;
console.info("configAcessoBDPJ=");
console.info(configAcessoBDPJ);


var contrato_json_BNDESToken = require(config.infra.contrato_json_BNDESToken);
var contrato_json_BNDESRegistry = require(config.infra.contrato_json_BNDESRegistry);

var n = contrato_json_BNDESToken.networks;

console.log("config.infra.rede_blockchain (1=Main|4=Rinkeby|4447=local) = " + config.infra.rede_blockchain);

//ABI = contrato_json_BNDESToken['abi']

let addrContratoBNDESToken;
let addrContratoBNDESRegistry;
if (config.infra.rede_blockchain < 10) {  
	console.log ("config.infra.rede_blockchain=" + config.infra.rede_blockchain);
	addrContratoBNDESToken = config.infra.endereco_BNDESToken;
	addrContratoBNDESRegistry = config.infra.endereco_BNDESRegistry;
}
else { //TODO: testar localhost
	
	try {
		console.log ("config.infra.rede_blockchain>10 -> rede local=" + config.infra.rede_blockchain);
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
	addrContratoBNDESToken = n[config.infra.rede_blockchain].address;
	addrContratoBNDESRegistry = contrato_json_BNDESRegistry.networks[config.infra.rede_blockchain].address;
}

console.log("endereco do contrato BNDESToken=" + addrContratoBNDESToken);
console.log("endereco do contrato BNDESRegistry=" + addrContratoBNDESRegistry);


app.get('/api/abi', function (req, res) {
	res.json(contratoJson);
})

//recupera constantes front
app.post('/api/constantesFront', function (req, res) {
	res.json({ addrContratoBNDESToken: addrContratoBNDESToken, 
		addrContratoBNDESRegistry: addrContratoBNDESRegistry,
		blockchainNetwork: config.infra.rede_blockchain,
		abiBNDESToken: contrato_json_BNDESToken['abi'],
		abiBNDESRegistry: contrato_json_BNDESRegistry['abi']
	 });
});

console.log("operationAPIURL=" + config.infra.operationAPIURL);

app.post('/api/constantesFrontPJ', function (req, res) {
	console.log("operationAPIURL=" + config.infra.operationAPIURL);
	console.log("mockMongoClient=" + config.negocio.mockMongoClient)
	console.log("mockMongoPJ=" + config.negocio.mockMongoPJ)
	res.json({ operationAPIURL: config.infra.operationAPIURL,  
		mockMongoClient: config.negocio.mockMongoClient, 
		mockMongoPJ: config.negocio.mockMongoPJ});
});


//criei como post porque o cnpj estah salvo com o caracter '/'
app.post('/api/pj-por-cnpj-mock', buscaPJPorCnpjMock);

function buscaPJPorCnpjMock(req, res, next) {
	console.info("buscaPJPorCnpjMock");
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


app.post('/api/pj-por-cnpj', buscaPJPorCnpj);

	function buscaPJPorCnpj (req, res, next) {
		let cnpjRecebido = req.body.cnpj;

		let isNum = /^\d+$/.test(cnpjRecebido);

		if (!isNum) {			
			res.status(200).json({});
		}

		new sql.ConnectionPool(configAcessoBDPJ).connect().then(pool => {
			return pool.request()
								 .input('cnpj', sql.VarChar(14), cnpjRecebido)
								 .query(config.negocio.query_cnpj)
			
			}).then(result => {
				let rows = result.recordset

				if (!rows[0]) {
					res.status(200).json({});
					return;
				}

				let pj = 	
				{
					cnpj: rows[0]["CNPJ_EMPRESA"],
					dadosCadastrais: {
						razaoSocial: rows[0]["NOME_EMPRESARIAL"]
					}
				}

				console.log("pj do QSA");				
				console.log(pj);

				res.status(200).json(pj);				
				sql.close();


			}).catch(err => {
				console.log(err);
				res.status(500).send({ message: "${err}"})
				sql.close();
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


// listen (start app with node server.js) ======================================
app.listen(8080, "0.0.0.0");

let data = "\n" + new Date() + "\nApp listening on port 8080 ";
console.log(data);

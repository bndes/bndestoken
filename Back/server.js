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


var contratoJson = require(config.infra.contrato_json);

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
configAcessoBDPJ.SENHA = process.env.BNC_BD_PJ_PASSWORD;
console.info("configAcessoBDPJ=");
console.info(configAcessoBDPJ);



var n = contratoJson.networks;

console.log("config.infra.rede_blockchain (4=Rinkeby|4447=local) = " + config.infra.rede_blockchain);
	
ABI = contratoJson['abi']

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






app.get('/api/abi', function (req, res) {
	res.json(contratoJson);
})

//recupera constantes front
app.post('/api/constantesFront', function (req, res) {
	res.json({ addrContrato: addrContrato });
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
		console.info("buscaPJPorCnpj (sem mock)");		
		let cnpjRecebido = req.body.cnpj;
		console.info("cnpjRecebido:", cnpjRecebido);

		//TESTE
		/*
		let pj = 	
		{
			cnpj: 11111111111111,
			dadosCadastrais: {
				razaoSocial: "FAKE"
			}
		}
		res.json(pj);
		*/
		
		res.json({});
		return;
		//TESTE


		let isNum = /^\d+$/.test(cnpjRecebido);

		if (!isNum) {			
			return;
		}
	
		//TODO: fazer pool de conexoes para melhorar performance
    sql.connect(configAcessoBDPJ, function (err) {
    
				if (err) {
						console.err("Erro ao conectar com o SQL Server para buscar dados de empresa");
						console.err(err);
						res.json({});
						return;
				}

        var request = new sql.Request();
        request.query('select * from dbo.CAD_EMPRESA where cnpj = ${cnpjRecebido}', function (err, recordset) {
            
						if (err) console.log(err);
						console.log("recordset");
						console.log(recordset);

						if (!recordset[0]) {
							res.json({});
							return;
						}

						let pj = 	
						{
							cnpj: string,
							dadosCadastrais: {
								razaoSocial: string
							}
						}
					
						pj.cnpj = recordset[0]["CNPJ_EMPRESA"];
						pj.dadosCadastrais.razaoSocial = recordset[0]["NOME_EMPRESARIAL"];
						res.json(pj);
        });
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

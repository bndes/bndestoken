const { exec, execSync, fork } = require('child_process');

var reset = false;
var comFront = true, comBack = true, comBackTruffle = true, comBackMongoDB = true;

var isWindows = false;

var NOVA_JANELA = true;
var MESMA_JANELA = false;

process.argv.forEach(function (val, index, array) {
	if (val == "-reset")
		reset = true;
    if (val == "-b")
        comBack = false;
    if (val == "-t")
        comBackTruffle = false;
    if (val == "-m")
        comBackMongoDB = false;
    if (val == "-f")
        comFront = false;
    if (val == "-help") 
	{
        console.log("");
		console.log("Script to launch all modules of BNDES Token (blockchain, database, back end and front end");
        console.log("-t -> do not launch blockchain (Truffle)");
        console.log("-m -> do not launch database (MongoDB)");
        console.log("-b -> do not launch backend (NodeJS)");
        console.log("-f -> do not launch front end (Angular)");
		console.log("-reset -> reset data in blockchain (Truffle) and in database (MongoDB)");
		console.log("Please include a .\startLocal.json with the following parameters:");
		console.log("dbpath -> MongoDB -dbpath parameter");		
        console.log("");
		process.exit(0);
    }
});

function executaCmd(comando, newShell) {
    //Windows
    if (isWindows) {
		if (newShell) {
			comando = "start powershell -command " + comando
		}
		else {
			comando = "powershell -command " + comando
		}
    }
    
    console.log(" ");
    console.log("Running: " + comando);
    console.log(" ");

    exec(comando, (err, stdout, stderr) => {
        if (err) {
            console.log('Error: ' + comando);
        }
        // if (stdout) console.log(`stdout: ${stdout}`);
        // if (stderr) console.log(`stderr: ${stderr}`);
    });
}

function aguarde(segundos) {
    for (i = 1; i <= segundos; i++) {
        console.log(".");
        var futuro = Date.now() + 1000
        while (Date.now() < futuro);
    }
}

config = require('./startLocal.json');
dbpath = config.dbpath;
console.log("dbpath: " + dbpath);

console.log(" ");
console.log("---------------------------");
console.log("INICIANDO O TOKEN APP COM BLOCKCHAIN LOCAL ...");
console.log("(nova blockchain e BD):" + reset);
console.log("---------------------------");
console.log(" ");

if (process.platform === 'win32') {
    isWindows = true;
}
else
{
	console.log("------------------------------------------");
	console.log("ESSE SCRIPT SÓ ESTÁ FUNCIONANDO NO WINDOWS");
	console.log("------------------------------------------");
	process.exit(0);
}


if (comBackMongoDB) 
{	
	console.log("---------------------------");
	console.log("DISPARANDO MONGODB");
	console.log("---------------------------");
	executaCmd("mongod -dbpath " + dbpath, NOVA_JANELA);
	if (reset) 
	{
		aguarde(6);
		console.log("---------------------------");
		console.log("APAGANDO DADOS MONGODB");
		console.log("---------------------------");
		process.chdir("Infra\\BD");
        executaCmd("mongo bndescoin --eval 'db.dropDatabase()' >> ../log/token_BD.log", MESMA_JANELA);
        aguarde(4);
        executaCmd("mongoimport --db bndescoin --collection pessoasjuridicas --file PJ.json >> ../log/token_BD.log", MESMA_JANELA);
		process.chdir("..\\..");
	}
}

if (comBackTruffle)
{
	console.log("---------------------------");
	console.log("DISPARANDO TRUFFLE");
	console.log("---------------------------");
	aguarde(4);
	process.chdir("Back-Blockchain");	
	if (reset)
	{
		aguarde(2);
		console.log("---------------------------");
		console.log("APAGANDO A BLOCKCHAIN");
		console.log("---------------------------");
		executaCmd("truffle develop   > ../log/token_blockchain.log", MESMA_JANELA);
		aguarde(4);
		executaCmd("truffle migrate --reset   > ../log/token_blockchain_deploy.log", MESMA_JANELA);
		aguarde(4);
	}
	aguarde(2);
	executaCmd("truffle develop ", NOVA_JANELA);		
	aguarde(4);
	process.chdir("..");
	aguarde(2);
}

if ( comBack )
{
	console.log("---------------------------");
	console.log("DISPARANDO BACK (NODEJS)");
	console.log("---------------------------");
    process.chdir("Back");
	aguarde(2);
    executaCmd("node server.js  > ../log/token_back.log", NOVA_JANELA);
	aguarde(2);
    process.chdir("..");
}

if ( comFront )
{
	console.log("---------------------------");
	console.log("DISPARANDO FRONT");
	console.log("---------------------------");
    process.chdir("front");
    aguarde(2);
    executaCmd("npm start   > ../log/token_front.log", NOVA_JANELA);
	aguarde(2);
	process.chdir("..");
}

aguarde(6);

console.log("---------------------------");
console.log("FIM DO SCRIPT");
console.log("---------------------------");

process.exit(0);

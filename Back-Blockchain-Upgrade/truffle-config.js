module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!

  networks: {
    development: {
      host: "localhost",
      port: 9545,
      network_id: "*", // Match any network id
      gas: 7952388  // Gas limit used for deploys      
    },
    rinkeby: {
      host: "vrt1281", // Connect to geth on the specified
      port: 9545,
      from: "0xd636349f5d7e03037e0f224c9b1ac3ccf104f4a5", // default address to use for any transaction Truffle makes during migrations
      network_id: 4,
      gas: 6952388  // Gas limit used for deploys
    },
    ropsten:  {
      host: "localhost",  //geth --testnet --fast --rpc --rpcapi eth,net,web3,personal
      port:  8545,
      from: "0x5a2a2ba72133d6667a9abcc1bc882125904cb88a", // owner BNDESToken na Ropsten
      network_id: 3,
      gas:   4612388
    }
  }

};

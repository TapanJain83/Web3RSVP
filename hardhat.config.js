require('@nomiclabs/hardhat-waffle');
require('dotenv').config();

module.exports = {
  solidity: "0.8.9",
  networks: {
    rinkeby: {
      url: `${process.env.POKT_RINKEBY_URL}`,
      accounts: [`${process.env.RINKEBY_PRIVATE_KEY}`],
      gas: 2100000,
      gasPrice: 8000000000,
    }
  }
};
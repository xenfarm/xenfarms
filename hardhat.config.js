require("dotenv").config();
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      forking: {
        url: process.env.RPC_URL,
      },
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API,
  },
  gasReporter: {
    token: "ETH",
    currency: "USD",
    outputFile: "gas-report.txt",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
  solidity: {
    compilers: [
      {
        version: "0.6.12",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
};

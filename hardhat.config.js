/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.7.3",
  networks: {
    hardhat: {
      mining: {
        // auto: true,
        interval: 3000,
      },
    },
  },
};

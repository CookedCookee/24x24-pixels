# Pixels On Chain
A generalised on-chain 24x24 svg pixel generator, repository, and NFT collection.

### Use

Live dApp -> [Pixels On Chain](https://pixelsonchain.xyz)

Users can freely also fork the registry, to modify the draw and template functions, or the NFT contract to create their own collection.

### Registry
THe registry contract that contains core draw functions and template functionality.

Registry: [0x2f71bDd3ba0CD0040ed75f89a295C1F0118C1182](https://andromeda-explorer.metis.io/address/0x2f71bDd3ba0CD0040ed75f89a295C1F0118C1182)

### Open Edition NFT

THe NFT contract that conforms to the ERC721 standard. Minting is unbounded and mint cost is variable.
The image information is stored as an array of strings (colours), where the index corresponds to a pixel location.

Open Edition: [0x91676d961D839e1C3e9A4747317614eB25F4Ef87](https://andromeda-explorer.metis.io/address/0x91676d961D839e1C3e9A4747317614eB25F4Ef87)

### Test

Built using hardhat - follow this guide for assistance []()

Local testing via command `npx hardhat test ./test/pixels.js`

### Warning

Strongly advise against Ethereum mainnet deployment due to high gas usage, a rollup or alt L1 is advised
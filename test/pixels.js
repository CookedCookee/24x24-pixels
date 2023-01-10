const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");

describe("Pixels On Chain Testing", function () {

    //////////////////////
    //Deploy Environment//
    //////////////////////

    async function deployEnvironment() {
        //Signers
        const [owner, addy0, addy1] = await ethers.getSigners();

        //Deploy PixelsOnChain
        const Pixels = await ethers.getContractFactory("PixelsOnChain");
        const deployedPixelsOnChain = await Pixels.deploy();

        //Deploy PixelsOpenEdition
        const OpenEdition = await ethers.getContractFactory("PixelsOnChainOpenEdition");
        const deployedOpenEdition = await OpenEdition.deploy(owner.address, deployedPixelsOnChain.address);

        return { 
            owner,
            addy0,
            addy1,
            deployedPixelsOnChain,
            deployedOpenEdition
        };
    }

    ////////////////////////////
    //Pixels On Chain Registry//
    ////////////////////////////

    describe("Testing Create Template", () => {
        it("Successfully creates a template", async function () {

            const { owner, addy0, addy1, deployedPixelsOnChain } = await loadFixture(deployEnvironment);

            const name = 'My Template';
            const positions = [0, 1, 5];
            const colours = ["#000000", "#ffffff", "#000000"];

            const keyHash = ethers.utils.keccak256(ethers.utils.solidityPack(["string", "address"], [name, owner.address]));
        
            await deployedPixelsOnChain.createTemplate(name, positions, colours);
        
            const firstTemplateKey = await deployedPixelsOnChain.templateList(0);
            expect(firstTemplateKey).to.equal(keyHash);
        
            const template = await deployedPixelsOnChain.templates(keyHash);
            expect(template.name).to.equal(name);
            expect(template.author).to.equal(owner.address);

            //Hardhat won't recognise the arrays in the struct
            expect(await deployedPixelsOnChain.getTemplateColoursArray(keyHash)).to.eql(colours);
            expect(await deployedPixelsOnChain.getTemplatePositionsArray(keyHash)).to.eql([BigNumber.from(0), BigNumber.from(1), BigNumber.from(5)]);
        });
        it('Unsuccessfully creates a template that already exists', async function () {

            const { owner, addy0, addy1, deployedPixelsOnChain } = await loadFixture(deployEnvironment);

            const name = 'My Template';
            const positions = [0, 1, 5];
            const colours = ['#000000', '#ffffff', '#000000'];

            const keyHash = ethers.utils.keccak256(ethers.utils.solidityPack(["string", "address"], [name, owner.address]));
        
            await deployedPixelsOnChain.createTemplate(name, positions, colours);
        
            const firstTemplateKey = await deployedPixelsOnChain.templateList(0);
            expect(firstTemplateKey).to.equal(keyHash);

            const positions0 = [10, 11, 105];
            const colours0 = ['crimson', 'crimson', 'cornsilk'];
        
            await expect(deployedPixelsOnChain.createTemplate(name, positions0, colours0)).to.rejectedWith("Template already exists");
        });
        it('Unsuccessfully creates a template with no pixels', async function () {

            const { owner, addy0, addy1, deployedPixelsOnChain } = await loadFixture(deployEnvironment);

            const name = 'My Template';
            const positions = [];
            const colours = [];
        
            await expect(deployedPixelsOnChain.connect(addy0).createTemplate(name, positions, colours)).to.rejectedWith("Insuffient pixels");
        });
        it('Unsuccessfully creates a template with too many pixels', async function () {

            const { owner, addy0, addy1, deployedPixelsOnChain } = await loadFixture(deployEnvironment);

            const name = 'My Template';
            const positions = [];

            for (let i=0; i<600; i++) {
                positions.push(8);
            }

            const colours = [];
        
            await expect(deployedPixelsOnChain.connect(addy0).createTemplate(name, positions, colours)).to.rejectedWith("Too many pixels");
        });
        it('Unsuccessfully creates a template with colours and pixels array of unequal length', async function () {

            const { owner, addy0, addy1, deployedPixelsOnChain } = await loadFixture(deployEnvironment);

            const name = 'My Template';
            const positions = [99, 100, 101];
            const colours = ["cornsilk", "crimson"];
        
            await expect(deployedPixelsOnChain.connect(addy0).createTemplate(name, positions, colours)).to.rejectedWith("Positions and Colours array must be the same length");
        });
        it('Unsuccessfully creates a template with a pixel out of bounds', async function () {

            const { owner, addy0, addy1, deployedPixelsOnChain } = await loadFixture(deployEnvironment);

            const name = 'My Template';
            const positions = [99, 100, 700];
            const colours = ["cornsilk", "crimson", "cornsilk"];
        
            await expect(deployedPixelsOnChain.connect(addy0).createTemplate(name, positions, colours)).to.rejectedWith("Invalid pixel location in index #2");
        });
        it("Successfully emits event when a new template is created", async function () {

            const { owner, addy0, addy1, deployedPixelsOnChain } = await loadFixture(deployEnvironment);

            const name = 'My Template';
            const positions = [0, 1, 5];
            const colours = ["#000000", "#ffffff", "#000000"];

            const keyHash = ethers.utils.keccak256(ethers.utils.solidityPack(["string", "address"], [name, owner.address]));
        
            await expect(deployedPixelsOnChain.createTemplate(name, [0, 1, 5], ["#000000", "#ffffff", "#000000"])).to.emit(deployedPixelsOnChain, "templateCreated").withArgs(keyHash, owner.address);
        
        });
    });

    describe("Testing Delete Template", () => {
        it("Successfully deletes a template", async function () {
            const { owner, addy0, addy1, deployedPixelsOnChain } = await loadFixture(deployEnvironment);

            await deployedPixelsOnChain.connect(addy1).createTemplate("My Template", [0, 1, 5], ["#000000", "#ffffff", "#000000"]);

            const keyHash = ethers.utils.keccak256(ethers.utils.solidityPack(["string", "address"], ["My Template", addy1.address]));
            
            await deployedPixelsOnChain.connect(addy1).deleteTemplate(0, keyHash);

            const numberOfTemplates = await deployedPixelsOnChain.getTemplateListLength();
            const doesTemplateExist = await deployedPixelsOnChain.templateExists(keyHash);

            expect(numberOfTemplates).to.equal(0);
            expect(doesTemplateExist).to.equal(false);
        });
        it("Successfully deletes second template from three", async function () {
            const { owner, addy0, addy1, deployedPixelsOnChain } = await loadFixture(deployEnvironment);

            await deployedPixelsOnChain.connect(addy1).createTemplate("My Template", [0, 1, 5], ["#000000", "#ffffff", "#000000"]);
            await deployedPixelsOnChain.connect(addy0).createTemplate("My Template", [0, 1, 5], ["#000000", "#ffffff", "#000000"]);
            await deployedPixelsOnChain.createTemplate("My Template", [0, 1, 5], ["#000000", "#ffffff", "#000000"]);

            const keyHash0 = ethers.utils.keccak256(ethers.utils.solidityPack(["string", "address"], ["My Template", addy1.address]));
            const keyHash1 = ethers.utils.keccak256(ethers.utils.solidityPack(["string", "address"], ["My Template", addy0.address]));
            const keyHash2 = ethers.utils.keccak256(ethers.utils.solidityPack(["string", "address"], ["My Template", owner.address]));

            await deployedPixelsOnChain.connect(addy0).deleteTemplate(1, keyHash1);

            const numberOfTemplates = await deployedPixelsOnChain.getTemplateListLength();
            const doesTemplateExist = await deployedPixelsOnChain.templateExists(keyHash1);

            expect(numberOfTemplates).to.equal(2);
            expect(doesTemplateExist).to.equal(false);
        });
        it("Unsuccessfully deletes a template that doesn't exist", async function () {
            const { owner, addy0, addy1, deployedPixelsOnChain } = await loadFixture(deployEnvironment);

            await deployedPixelsOnChain.connect(addy1).createTemplate("My Template", [0, 1, 5], ["#000000", "#ffffff", "#000000"]);

            const keyHash = ethers.utils.keccak256(ethers.utils.solidityPack(["string", "address"], ["My TemplateS", addy1.address]));
            
            await expect(deployedPixelsOnChain.connect(addy1).deleteTemplate(0, keyHash)).to.rejectedWith("Template doesn't exist");
        });
        it("Unsuccessfully deletes a template with index out of bounds", async function () {
            const { owner, addy0, addy1, deployedPixelsOnChain } = await loadFixture(deployEnvironment);

            await deployedPixelsOnChain.connect(addy1).createTemplate("My Template", [0, 1, 5], ["#000000", "#ffffff", "#000000"]);
            await deployedPixelsOnChain.connect(addy0).createTemplate("My Template", [0, 1, 5], ["#000000", "#ffffff", "#000000"]);
            await deployedPixelsOnChain.createTemplate("My Template", [0, 1, 5], ["#000000", "#ffffff", "#000000"]);

            const keyHash0 = ethers.utils.keccak256(ethers.utils.solidityPack(["string", "address"], ["My Template", addy1.address]));
            const keyHash1 = ethers.utils.keccak256(ethers.utils.solidityPack(["string", "address"], ["My Template", addy0.address]));
            const keyHash2 = ethers.utils.keccak256(ethers.utils.solidityPack(["string", "address"], ["My Template", owner.address]));

            await expect(deployedPixelsOnChain.connect(addy0).deleteTemplate(3, keyHash1)).to.rejectedWith("Index out of bounds");
        });
        it("Unsuccessfully deletes a template with index that doesn't correspond to key hash", async function () {
            const { owner, addy0, addy1, deployedPixelsOnChain } = await loadFixture(deployEnvironment);

            await deployedPixelsOnChain.connect(addy1).createTemplate("My Template", [0, 1, 5], ["#000000", "#ffffff", "#000000"]);
            await deployedPixelsOnChain.connect(addy0).createTemplate("My Template", [0, 1, 5], ["#000000", "#ffffff", "#000000"]);
            await deployedPixelsOnChain.createTemplate("My Template", [0, 1, 5], ["#000000", "#ffffff", "#000000"]);

            const keyHash0 = ethers.utils.keccak256(ethers.utils.solidityPack(["string", "address"], ["My Template", addy1.address]));
            const keyHash1 = ethers.utils.keccak256(ethers.utils.solidityPack(["string", "address"], ["My Template", addy0.address]));
            const keyHash2 = ethers.utils.keccak256(ethers.utils.solidityPack(["string", "address"], ["My Template", owner.address]));

            await expect(deployedPixelsOnChain.connect(addy0).deleteTemplate(0, keyHash1)).to.rejectedWith("Index does not correspond to template");
        });
        it("Unsuccessfully deletes a template by non-author", async function () {
            const { owner, addy0, addy1, deployedPixelsOnChain } = await loadFixture(deployEnvironment);

            await deployedPixelsOnChain.connect(addy1).createTemplate("My Template", [0, 1, 5], ["#000000", "#ffffff", "#000000"]);
            await deployedPixelsOnChain.connect(addy0).createTemplate("My Template", [0, 1, 5], ["#000000", "#ffffff", "#000000"]);
            await deployedPixelsOnChain.createTemplate("My Template", [0, 1, 5], ["#000000", "#ffffff", "#000000"]);

            const keyHash0 = ethers.utils.keccak256(ethers.utils.solidityPack(["string", "address"], ["My Template", addy1.address]));
            const keyHash1 = ethers.utils.keccak256(ethers.utils.solidityPack(["string", "address"], ["My Template", addy0.address]));
            const keyHash2 = ethers.utils.keccak256(ethers.utils.solidityPack(["string", "address"], ["My Template", owner.address]));

            await expect(deployedPixelsOnChain.deleteTemplate(1, keyHash1)).to.rejectedWith("Only the author can delete this template");
        });
        it("Successfully emits event after template deletion", async function () {
            const { owner, addy0, addy1, deployedPixelsOnChain } = await loadFixture(deployEnvironment);

            await deployedPixelsOnChain.connect(addy1).createTemplate("My Template", [0, 1, 5], ["#000000", "#ffffff", "#000000"]);

            const keyHash = ethers.utils.keccak256(ethers.utils.solidityPack(["string", "address"], ["My Template", addy1.address]));
            
            await expect(deployedPixelsOnChain.connect(addy1).deleteTemplate(0, keyHash)).to.emit(deployedPixelsOnChain, "templateDeleted").withArgs(keyHash, addy1.address);
        });
    });

    describe("Testing Other Misc Registery Functions", () => {
        it("Unsuccessfully use overlayer on non-existant template", async function () {
            const { owner, addy0, addy1, deployedPixelsOnChain } = await loadFixture(deployEnvironment);

            await deployedPixelsOnChain.connect(addy1).createTemplate("My Template", [0, 1, 5], ["#000000", "#ffffff", "#000000"]);
            await deployedPixelsOnChain.connect(addy0).createTemplate("My Template", [0, 1, 5], ["#000000", "#ffffff", "#000000"]);
            await deployedPixelsOnChain.createTemplate("My Template", [0, 1, 5], ["#000000", "#ffffff", "#000000"]);

            const keyHash0 = ethers.utils.keccak256(ethers.utils.solidityPack(["string", "address"], ["My Template", addy1.address]));
            const keyHash1 = ethers.utils.keccak256(ethers.utils.solidityPack(["string", "address"], ["My Template", addy0.address]));
            const keyHash2 = ethers.utils.keccak256(ethers.utils.solidityPack(["string", "address"], ["My Template", owner.address]));
            const keyHash3 = ethers.utils.keccak256(ethers.utils.solidityPack(["string", "address"], ["My Template Doesn't exist", owner.address]));

            const monochrome = await deployedPixelsOnChain.getMonochromePixelsArray("crimson");

            await expect(deployedPixelsOnChain.overlayer(monochrome, [keyHash0, keyHash1, keyHash3])).to.rejectedWith('Template #2 does not exist');
        });
        it("Unsuccessfully call getTemplateColoursArray if template doesn't exist", async function () {
            const { owner, addy0, addy1, deployedPixelsOnChain } = await loadFixture(deployEnvironment);

            await deployedPixelsOnChain.connect(addy1).createTemplate("My Template", [0, 1, 5], ["#000000", "#ffffff", "#000000"]);

            const keyHash0 = ethers.utils.keccak256(ethers.utils.solidityPack(["string", "address"], ["My Template", addy1.address]));
            const keyHash1 = ethers.utils.keccak256(ethers.utils.solidityPack(["string", "address"], ["My Template Doesn't exist", owner.address]));
            
            await expect(deployedPixelsOnChain.getTemplateColoursArray(keyHash1)).to.rejectedWith("Template doesn't exist");
        });
        it("Unsuccessfully call getTemplatePositionsArray if template doesn't exist", async function () {
            const { owner, addy0, addy1, deployedPixelsOnChain } = await loadFixture(deployEnvironment);

            await deployedPixelsOnChain.connect(addy1).createTemplate("My Template", [0, 1, 5], ["#000000", "#ffffff", "#000000"]);

            const keyHash0 = ethers.utils.keccak256(ethers.utils.solidityPack(["string", "address"], ["My Template", addy1.address]));
            const keyHash1 = ethers.utils.keccak256(ethers.utils.solidityPack(["string", "address"], ["My Template Doesn't exist", owner.address]));
            
            await expect(deployedPixelsOnChain.getTemplatePositionsArray(keyHash1)).to.rejectedWith("Template doesn't exist");
        });
    });

    ///////////////////////////
    //Pixels Open Edition NFT//
    ///////////////////////////

    describe("Testing Open Edition", () => {
        it("All constructor variables are correct", async function () {
            const { owner, addy0, addy1, deployedPixelsOnChain, deployedOpenEdition } = await loadFixture(deployEnvironment);
            
            const ownerOf = await deployedOpenEdition.owner();
            const pixelsOnChain = await deployedOpenEdition.pixelsOnChain();
            const fee = await deployedOpenEdition.fee();
            const nonce = await deployedOpenEdition.nonce();

            expect(ownerOf).to.equal(owner.address);
            expect(pixelsOnChain).to.equal(deployedPixelsOnChain.address);
            expect(fee).to.equal(BigInt(0.1e18));
            expect(nonce).to.equal(0);
        });
        it("Successfully mint an NFT", async function () {
            const { owner, addy0, addy1, deployedPixelsOnChain, deployedOpenEdition } = await loadFixture(deployEnvironment);

            const monochrome = await deployedPixelsOnChain.getMonochromePixelsArray("crimson");
            const memo = "Timmy was here";
            
            await deployedOpenEdition.connect(addy0).mint(monochrome, memo, {value: ethers.utils.parseEther("0.1")});

            const nonce = await deployedOpenEdition.nonce();
            const minterOf0 = await deployedOpenEdition.minter(0);
            const memoOf0 = await deployedOpenEdition.memo(0);

            expect(nonce).to.equal(1);
            expect(minterOf0).to.equal(addy0.address);
            expect(memoOf0).to.equal(memo);

            //Once more hardhat being annoying
            const pixelsOf0 = await deployedOpenEdition.getEntirePixelsArray(0);
            expect(pixelsOf0).to.eql(monochrome);

            const balanceOf = await ethers.provider.getBalance(deployedOpenEdition.address);
            expect(balanceOf).to.equal(BigInt(0.1e18));

            const OwnerOf0 = await deployedOpenEdition.ownerOf(0);
            expect(OwnerOf0).to.equal(addy0.address);
        });
        it("Unsuccessfully mint an NFT with insufficient payment", async function () {
            const { owner, addy0, addy1, deployedPixelsOnChain, deployedOpenEdition } = await loadFixture(deployEnvironment);

            const monochrome = await deployedPixelsOnChain.getMonochromePixelsArray("crimson");
            const memo = "Timmy was here";
            
            await expect(deployedOpenEdition.connect(addy0).mint(monochrome, memo, {value: ethers.utils.parseEther("0.0001")})).to.rejectedWith("Insufficient fee paid");
        });
        it("Unsuccessfully mint an NFT with too long of a memo", async function () {
            const { owner, addy0, addy1, deployedPixelsOnChain, deployedOpenEdition } = await loadFixture(deployEnvironment);

            const monochrome = await deployedPixelsOnChain.getMonochromePixelsArray("crimson");
            const memo = "Timmy was here, and here, and here, and here, and here, and here, and here, and here, and here, and here, and here, and here, and here, and here, and here, and here, and here,";
            
            await expect(deployedOpenEdition.connect(addy0).mint(monochrome, memo, {value: ethers.utils.parseEther("0.1")})).to.rejectedWith("Memo is too long");
        });
        it("Owner successfully withdraws ETH", async function () {
            const { owner, addy0, addy1, deployedPixelsOnChain, deployedOpenEdition } = await loadFixture(deployEnvironment);

            const monochrome = await deployedPixelsOnChain.getMonochromePixelsArray("crimson");
            const memo = "Timmy was here";
            
            await deployedOpenEdition.connect(addy0).mint(monochrome, memo, {value: ethers.utils.parseEther("0.1")});
            await deployedOpenEdition.connect(addy1).mint(monochrome, memo, {value: ethers.utils.parseEther("0.1")});

            const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);

            const sentTXN = await deployedOpenEdition.withdraw();

            const receipt = await sentTXN.wait();
            const cumulativeGasUsed = receipt.cumulativeGasUsed;
            const effectiveGasPrice = receipt.effectiveGasPrice;
            const ETHpaid = BigInt(cumulativeGasUsed) * BigInt(effectiveGasPrice);

            const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);

            const balanceOf = await ethers.provider.getBalance(deployedOpenEdition.address);
            expect(balanceOf).to.equal(0);

            expect(BigInt(ownerBalanceAfter) + BigInt(ETHpaid) - BigInt(ownerBalanceBefore)).to.equal(BigInt(0.2e18));
        });
        it("Non-0wner unsuccessfully withdraws ETH", async function () {
            const { owner, addy0, addy1, deployedPixelsOnChain, deployedOpenEdition } = await loadFixture(deployEnvironment);

            const monochrome = await deployedPixelsOnChain.getMonochromePixelsArray("crimson");
            const memo = "Timmy was here";
            
            await deployedOpenEdition.connect(addy0).mint(monochrome, memo, {value: ethers.utils.parseEther("0.1")});

            await expect(deployedOpenEdition.connect(addy0).withdraw()).to.rejectedWith("Ownable: caller is not the owner");
        });
        it("Owner successfully changes fee", async function () {
            const { owner, addy0, addy1, deployedPixelsOnChain, deployedOpenEdition } = await loadFixture(deployEnvironment);

            const fee = await deployedOpenEdition.fee();
            expect(fee).to.equal(BigInt(0.1e18));

            await deployedOpenEdition.changeFee(BigInt(0.2e18));

            const fee0 = await deployedOpenEdition.fee();
            expect(fee0).to.equal(BigInt(0.2e18));

            const monochrome = await deployedPixelsOnChain.getMonochromePixelsArray("crimson");
            const memo = "Timmy was here";
            
            await expect(deployedOpenEdition.connect(addy0).mint(monochrome, memo, {value: ethers.utils.parseEther("0.1")})).to.rejectedWith("Insufficient fee paid");
        });
        it("Owner unsuccessfully changes fee to be too high", async function () {
            const { owner, addy0, addy1, deployedPixelsOnChain, deployedOpenEdition } = await loadFixture(deployEnvironment);

            const fee = await deployedOpenEdition.fee();
            expect(fee).to.equal(BigInt(0.1e18));

            await expect(deployedOpenEdition.changeFee(BigInt(2e18))).to.rejectedWith("Fee may not exceed 1 Metis");
        });
        it("Non-owner unsuccessfully changes fee", async function () {
            const { owner, addy0, addy1, deployedPixelsOnChain, deployedOpenEdition } = await loadFixture(deployEnvironment);

            const fee = await deployedOpenEdition.fee();
            expect(fee).to.equal(BigInt(0.1e18));

            await expect(deployedOpenEdition.connect(addy0).changeFee(BigInt(0.2e18))).to.rejectedWith("Ownable: caller is not the owner");
        });
        it("Successfully emits event after minting of an NFT", async function () {
            const { owner, addy0, addy1, deployedPixelsOnChain, deployedOpenEdition } = await loadFixture(deployEnvironment);

            const monochrome = await deployedPixelsOnChain.getMonochromePixelsArray("crimson");
            const memo = "Timmy was here";
            
            await expect(deployedOpenEdition.connect(addy0).mint(monochrome, memo, {value: ethers.utils.parseEther("0.1")})).to.emit(deployedOpenEdition, "Minted").withArgs(0);
        });
        it("Successfully emits event after withdrawal of ETH", async function () {
            const { owner, addy0, addy1, deployedPixelsOnChain, deployedOpenEdition } = await loadFixture(deployEnvironment);

            const monochrome = await deployedPixelsOnChain.getMonochromePixelsArray("crimson");
            const memo = "Timmy was here";
            
            await deployedOpenEdition.connect(addy0).mint(monochrome, memo, {value: ethers.utils.parseEther("0.1")});

            await expect(deployedOpenEdition.withdraw()).to.emit(deployedOpenEdition, "WithdrawMetis").withArgs(BigInt(0.1e18));
        });
        it("Successfully emits event after fee update", async function () {
            const { owner, addy0, addy1, deployedPixelsOnChain, deployedOpenEdition } = await loadFixture(deployEnvironment);

            await expect(deployedOpenEdition.changeFee(BigInt(0.2e18))).to.emit(deployedOpenEdition, "UpdatedFee").withArgs(BigInt(0.2e18));
        });
    });
    
    /////////////
    //Gas Usage//
    /////////////

    describe("Testing Gas Usage", () => {
        it("Gas for creating a template with 10 pixels", async function () {
            const { owner, addy0, addy1, deployedPixelsOnChain, deployedOpenEdition } = await loadFixture(deployEnvironment);

            const name = 'My Template';
            const positions = [0, 1, 5, 7, 9, 10, 11, 17, 90, 400];
            const colours = ["#000000", "#ffffff", "#000000", "#000000", "#ffffff", "#000000", "#000000", "#ffffff", "#000000", "#000000"];

            const sentTXN = await deployedPixelsOnChain.createTemplate(name, positions, colours);

            const receipt = await sentTXN.wait();
            const cumulativeGasUsed = receipt.cumulativeGasUsed;
            const effectiveGasPrice = receipt.effectiveGasPrice;
            const ETHpaid = BigInt(cumulativeGasUsed) * BigInt(effectiveGasPrice);

            console.log('Cumulative Gas Used to create template with ten pixels:', BigInt(cumulativeGasUsed));
        });
        it("Gas for minting", async function () {
            const { owner, addy0, addy1, deployedPixelsOnChain, deployedOpenEdition } = await loadFixture(deployEnvironment);

            const monochrome = await deployedPixelsOnChain.getMonochromePixelsArray("crimson");
            const memo = "Timmy was here";
            
            const sentTXN = await deployedOpenEdition.connect(addy0).mint(monochrome, memo, {value: ethers.utils.parseEther("0.1")});

            const receipt = await sentTXN.wait();
            const cumulativeGasUsed = receipt.cumulativeGasUsed;
            const effectiveGasPrice = receipt.effectiveGasPrice;
            const ETHpaid = BigInt(cumulativeGasUsed) * BigInt(effectiveGasPrice);

            //This is why it's being deployed on a rollup and not mainnet!
            console.log('Cumulative Gas Used to Mint an NFT:', BigInt(cumulativeGasUsed));
        });
    });
});
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

        return { 
            owner,
            addy0,
            addy1,
            deployedPixelsOnChain
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
        
            await deployedPixelsOnChain.createTemplate(name, [0, 1, 5], ["#000000", "#ffffff", "#000000"]);
        
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

    //delete template

    

    ///////////////////////////
    //Pixels Open Edition NFT//
    ///////////////////////////

    /*
    describe("Testing Open Edition", () => {
        it("further testing", async function () {

            
        });
    });
    */
});
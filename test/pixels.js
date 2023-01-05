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
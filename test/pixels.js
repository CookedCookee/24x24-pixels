const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { ethers } = require("hardhat");
const { keccak256 } = require("ethers/lib/utils");

describe("Pixels Testing", function () {

    //////////////////////
    //Deploy Environment//
    //////////////////////

    async function deployEnvironment() {
        //Signers
        const [owner, addy0, addy1] = await ethers.getSigners();

        //Deploy Pixels
        const Pixels = await ethers.getContractFactory("FiveHundredAndSeventySixPixels");
        const deployedPixels = await Pixels.deploy();

        return { 
            owner,
            addy0,
            addy1,
            deployedPixels
        };
    }

    //////////////////////////////////////
    //Just mucking around for the moment//
    //////////////////////////////////////

    describe("Testing basic stuff", () => {

        /*
        
        it("initial testing", async function () {

            const { owner, addy0, addy1, deployedPixels } = await loadFixture(deployEnvironment);

            let input = ["crimson", "crimson", "crimson", "#983F3F", "crimson", "crimson", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "blue", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "orange", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "black", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk", "crimson", "cornsilk"]

            const image = await deployedPixels.draw(input, true);

            console.log(image);
        }); */
        it("further testing", async function () {

            const { owner, addy0, addy1, deployedPixels } = await loadFixture(deployEnvironment);

            const monochrome = await deployedPixels.getMonochromePixelsArray("orange");

            await deployedPixels.createTemplate("first", [16, 17, 18, 490, 560, 90], ["cornsilk", "cornsilk", "cornsilk", "cornsilk", "cornsilk", "cornsilk"]);

            await deployedPixels.createTemplate("second", [90], ["blue"]);

            const key0 = await deployedPixels.userTemplates(owner.address, 0);

            const key1 = await deployedPixels.userTemplates(owner.address, 1);

            const overlayed = await deployedPixels.overlayer(monochrome, [key0, key1]);

            const image = await deployedPixels.draw(overlayed, true);

            console.log(image);
        });
    });
});
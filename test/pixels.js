const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { ethers } = require("hardhat");

describe("Pixels Testing", function () {

    //////////////////////
    //Deploy Environment//
    //////////////////////

    async function deployEnvironment() {
        //Signers
        const [owner, addy0, addy1] = await ethers.getSigners();

        //Deploy Pixels
        const Pixels = await ethers.getContractFactory("pixels");
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
        
        it("initial testing", async function () {

            const { owner, addy0, addy1, deployedPixels } = await loadFixture(deployEnvironment);

        });
    });

});
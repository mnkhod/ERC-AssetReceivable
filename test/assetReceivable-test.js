const { expect } = require("chai");
const { ethers } = require("hardhat");
const { parse18,format18 } = require("./helpers");

describe("AssetReceivable Test", function () {

  beforeEach(async function () {
    this.accounts = await ethers.getSigners();
    this.odko = this.accounts[0];
    this.tumruu = this.accounts[1];
    this.bataa = this.accounts[3];
    this.amaraa = this.accounts[4];

    this.MockContract = await ethers.getContractFactory("MockContract",this.odko);
    this.mockContract = await this.MockContract.deploy();
    await this.mockContract.deployed();

    this.MockNft = await ethers.getContractFactory("MockNft",this.tumruu);
    this.mockNft = await this.MockNft.deploy("MockNFT","MNFT");
    await this.mockNft.deployed();

    this.MockToken = await ethers.getContractFactory("MockToken",this.bataa);
    this.mockToken = await this.MockToken.deploy("MockToken","MTKN",18);
    await this.mockToken.deployed();

    // sending token to mockContract
    await this.mockToken.connect(this.bataa).mint(this.bataa.address,parse18(100))
    await this.mockToken.connect(this.bataa).transfer(this.mockContract.address,parse18(100));

    // sending coin to mockContract
    await this.odko.sendTransaction({ to: this.mockContract.address, value: parse18(500) })

    // sending nft to mockContract
    await this.mockNft.connect(this.tumruu).mint(this.tumruu.address);
    await this.mockNft.connect(this.tumruu).transferFrom(this.tumruu.address,this.mockContract.address,0);
  });

  it("Flow Test", async function () {
    expect(await this.mockContract.getRecieveOwnership()).to.equal(this.odko.address);

    expect(await this.mockToken.balanceOf(this.mockContract.address)).to.equal(parse18(100));
    expect(await this.mockNft.balanceOf(this.mockContract.address)).to.equal(1);
    expect(await this.mockNft.ownerOf(0)).to.equal(this.mockContract.address);
    expect(await ethers.provider.getBalance(this.mockContract.address)).to.equal(parse18(500));

    // Rescue Token
    await this.mockContract.rescueToken(this.mockToken.address,this.amaraa.address,parse18(100))
    expect(await this.mockToken.balanceOf(this.amaraa.address)).to.equal(parse18(100));

    // Rescue Coin
    await this.mockContract.rescueCoin(this.amaraa.address,parse18(500))
    expect(await ethers.provider.getBalance(this.amaraa.address)).to.equal(parse18(10500));

    // Rescue NFT
    await this.mockContract.rescueNft(this.mockNft.address,this.mockContract.address,this.amaraa.address,0)
    expect(await this.mockNft.balanceOf(this.mockContract.address)).to.equal(0);
    expect(await this.mockNft.ownerOf(0)).to.equal(this.amaraa.address);
  });

});

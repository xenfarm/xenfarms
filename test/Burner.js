const { expect } = require("chai");
const { ethers } = require("hardhat");
const UniswapV2Router02Artifact = require("@uniswap/v2-periphery/build/UniswapV2Router02.json");

describe("Burner", () => {
  before(async () => {
    const [owner] = await ethers.getSigners();

    this.owner = owner;

    const unirouter = "0x7a250d5630b4cf539739df2c5dacb4c659f2488d";

    const ZENToken = await ethers.getContractFactory("ZENToken");
    const weth = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    this.weth = ZENToken.attach(weth);

    this.zen = await ZENToken.deploy();
    await this.zen.deployed();
    this.xen = await ZENToken.deploy();
    await this.xen.deployed();
    const Burner = await ethers.getContractFactory("Burner");
    this.burner = await Burner.deploy(
      unirouter,
      this.zen.address,
      this.xen.address
    );
    await this.burner.deployed();

    await this.xen.mint(owner.address, ethers.utils.parseEther("200"));
    await this.zen.mint(owner.address, ethers.utils.parseEther("200"));

    const UniswapV2Router02 = await ethers.getContractFactory(
      UniswapV2Router02Artifact.abi,
      UniswapV2Router02Artifact.bytecode
    );
    this.router = UniswapV2Router02.attach(unirouter);

    await this.zen.approve(unirouter, ethers.utils.parseEther("100000"));
    await this.xen.approve(unirouter, ethers.utils.parseEther("100000"));

    // Create ZEN the pool 100/1
    await this.router.addLiquidityETH(
      this.zen.address,
      ethers.utils.parseEther("100"),
      ethers.utils.parseEther("100"),
      ethers.utils.parseEther("1"),
      owner.address,
      Date.now() + 100,
      { value: ethers.utils.parseEther("1") }
    );

    // Create XEN the pool 100/1
    await this.router.addLiquidityETH(
      this.xen.address,
      ethers.utils.parseEther("100"),
      ethers.utils.parseEther("100"),
      ethers.utils.parseEther("1"),
      owner.address,
      Date.now() + 100,
      { value: ethers.utils.parseEther("1") }
    );
  });

  it("should burn tokens correctly", async () => {
    await this.zen.transfer(this.burner.address, ethers.utils.parseEther("1"));
    const burnerBalance = await this.zen.balanceOf(this.burner.address);
    expect(burnerBalance).to.eq(ethers.utils.parseEther("1"));

    // Init Burn
    await this.burner.burn();

    // Should sell 50 ZEN to WETH and reward the caller with 10% of the rewards
    const callerWethBalance = await this.weth.balanceOf(this.owner.address);
    expect(callerWethBalance).to.eq(
      ethers.utils.parseEther("0.000987158034397061")
    );

    const burnerBalanceAfterBurn = await this.zen.balanceOf(
      this.burner.address
    );
    expect(burnerBalanceAfterBurn).to.eq(0);
  });
});

const { expect } = require("chai");
const { ethers } = require("hardhat");
const UniswapV2Router02Artifact = require("@uniswap/v2-periphery/build/UniswapV2Router02.json");
const UniswapV2FactoryArtifact = require("@uniswap/v2-core/build/UniswapV2Factory.json");

describe("Masterchef", () => {
  before(async () => {
    const [owner] = await ethers.getSigners();

    this.owner = owner;

    const unirouter = "0x7a250d5630b4cf539739df2c5dacb4c659f2488d";
    const unifactory = "0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f";

    const ZENToken = await ethers.getContractFactory("ZENToken");
    const weth = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    this.weth = ZENToken.attach(weth);

    this.zen = await ZENToken.deploy();
    await this.zen.deployed();
    this.xen = await ZENToken.deploy();
    await this.xen.deployed();

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

    const UniswapV2Factory = await ethers.getContractFactory(
      UniswapV2FactoryArtifact.abi,
      UniswapV2FactoryArtifact.bytecode
    );
    this.factory = UniswapV2Factory.attach(unifactory);

    const xenEthUNIv2Pool = await this.factory.getPair(
      this.xen.address,
      this.weth.address
    );
    const zenXenUNIv2Pool = await this.factory.getPair(
      this.zen.address,
      this.xen.address
    );
    const zenEthUNIv2Pool = await this.factory.getPair(
      this.zen.address,
      this.weth.address
    );

    const currBlock = await ethers.provider.getBlockNumber();

    const Masterchef = await ethers.getContractFactory("MasterChef");
    this.masterchef = await Masterchef.deploy(
      this.zen.address,
      this.xen.address,
      unirouter,
      currBlock + 1000,
      xenEthUNIv2Pool,
      zenXenUNIv2Pool,
      zenEthUNIv2Pool
    );
  });

  it("should deploy", async () => {});
});

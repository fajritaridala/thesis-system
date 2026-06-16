import { network } from "hardhat";

const { ethers } = await network.create();

const toeflRecord = await ethers.deployContract("TOEFLRecord");
await toeflRecord.waitForDeployment();

console.log(`TOEFLRecord deployed to: ${await toeflRecord.getAddress()}`);

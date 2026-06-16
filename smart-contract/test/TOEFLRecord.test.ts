import { expect } from 'chai';
import { network } from 'hardhat';

const { ethers, networkHelpers } = await network.create();

describe('TOEFLRecord', function () {
  // --- Fixtures ---

  async function deployFixture() {
    const [owner, nonOwner] = await ethers.getSigners();
    const toeflRecord = await ethers.deployContract('TOEFLRecord');
    return { toeflRecord, owner, nonOwner };
  }

  // --- Test data helpers ---

  const sampleHash = ethers.keccak256(ethers.toUtf8Bytes('toefl-result-001'));
  const sampleCid = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG';

  const anotherHash = ethers.keccak256(ethers.toUtf8Bytes('toefl-result-002'));
  const anotherCid = 'QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX';

  // --- Deployment ---

  describe('Deployment', function () {
    it('should deploy successfully', async function () {
      const { toeflRecord } = await networkHelpers.loadFixture(deployFixture);
      expect(await toeflRecord.getAddress()).to.be.properAddress;
    });

    it('should set deployer as owner', async function () {
      const { toeflRecord, owner } =
        await networkHelpers.loadFixture(deployFixture);
      expect(await toeflRecord.owner()).to.equal(owner.address);
    });
  });

  // --- store() ---

  describe('store()', function () {
    it('should store a new record', async function () {
      const { toeflRecord } = await networkHelpers.loadFixture(deployFixture);

      await toeflRecord.store(sampleHash, sampleCid);

      expect(await toeflRecord.getRecord(sampleHash)).to.equal(sampleCid);
    });

    it('should emit RecordStored event with correct parameters', async function () {
      const { toeflRecord, owner } =
        await networkHelpers.loadFixture(deployFixture);

      await expect(toeflRecord.store(sampleHash, sampleCid))
        .to.emit(toeflRecord, 'RecordStored')
        .withArgs(owner.address, sampleHash, sampleCid);
    });

    it('should store multiple different records', async function () {
      const { toeflRecord } = await networkHelpers.loadFixture(deployFixture);

      await toeflRecord.store(sampleHash, sampleCid);
      await toeflRecord.store(anotherHash, anotherCid);

      expect(await toeflRecord.getRecord(sampleHash)).to.equal(sampleCid);
      expect(await toeflRecord.getRecord(anotherHash)).to.equal(anotherCid);
    });

    it('should revert with RecordAlreadyExists when storing duplicate hash', async function () {
      const { toeflRecord } = await networkHelpers.loadFixture(deployFixture);

      await toeflRecord.store(sampleHash, sampleCid);

      await expect(toeflRecord.store(sampleHash, 'QmDifferentCid'))
        .to.be.revertedWithCustomError(toeflRecord, 'RecordAlreadyExists')
        .withArgs(sampleHash);
    });

    it('should revert when called by non-owner', async function () {
      const { toeflRecord, nonOwner } =
        await networkHelpers.loadFixture(deployFixture);

      await expect(toeflRecord.connect(nonOwner).store(sampleHash, sampleCid))
        .to.be.revertedWithCustomError(
          toeflRecord,
          'OwnableUnauthorizedAccount',
        )
        .withArgs(nonOwner.address);
    });
  });

  // --- getRecord() ---

  describe('getRecord()', function () {
    it('should return CID for existing record', async function () {
      const { toeflRecord } = await networkHelpers.loadFixture(deployFixture);

      await toeflRecord.store(sampleHash, sampleCid);

      expect(await toeflRecord.getRecord(sampleHash)).to.equal(sampleCid);
    });

    it('should return empty string for non-existing record', async function () {
      const { toeflRecord } = await networkHelpers.loadFixture(deployFixture);

      expect(await toeflRecord.getRecord(sampleHash)).to.equal('');
    });
  });

  // --- exists() ---

  describe('exists()', function () {
    it('should return true for existing record', async function () {
      const { toeflRecord } = await networkHelpers.loadFixture(deployFixture);

      await toeflRecord.store(sampleHash, sampleCid);

      expect(await toeflRecord.exists(sampleHash)).to.be.true;
    });

    it('should return false for non-existing record', async function () {
      const { toeflRecord } = await networkHelpers.loadFixture(deployFixture);

      expect(await toeflRecord.exists(sampleHash)).to.be.false;
    });
  });

  // --- Access Control ---

  describe('Access Control', function () {
    it('owner should be able to transfer ownership', async function () {
      const { toeflRecord, nonOwner } =
        await networkHelpers.loadFixture(deployFixture);

      await toeflRecord.transferOwnership(nonOwner.address);

      expect(await toeflRecord.owner()).to.equal(nonOwner.address);
    });

    it('new owner should be able to store after ownership transfer', async function () {
      const { toeflRecord, nonOwner } =
        await networkHelpers.loadFixture(deployFixture);

      await toeflRecord.transferOwnership(nonOwner.address);
      await toeflRecord.connect(nonOwner).store(sampleHash, sampleCid);

      expect(await toeflRecord.getRecord(sampleHash)).to.equal(sampleCid);
    });

    it('previous owner should not be able to store after ownership transfer', async function () {
      const { toeflRecord, owner, nonOwner } =
        await networkHelpers.loadFixture(deployFixture);

      await toeflRecord.transferOwnership(nonOwner.address);

      await expect(toeflRecord.store(sampleHash, sampleCid))
        .to.be.revertedWithCustomError(
          toeflRecord,
          'OwnableUnauthorizedAccount',
        )
        .withArgs(owner.address);
    });
  });
});

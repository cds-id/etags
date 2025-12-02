import { expect } from 'chai';
import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ETagRegistry } from '../typechain-types';

describe('ETagRegistry', function () {
  // Test fixtures
  async function deployETagRegistryFixture() {
    const [owner, operator, user1, user2] = await ethers.getSigners();

    const ETagRegistry = await ethers.getContractFactory('ETagRegistry');
    const registry = (await ETagRegistry.deploy()) as unknown as ETagRegistry;

    // Generate sample tag data
    const tagId1 = ethers.keccak256(ethers.toUtf8Bytes('TAG-001'));
    const tagId2 = ethers.keccak256(ethers.toUtf8Bytes('TAG-002'));
    const hash1 = ethers.keccak256(ethers.toUtf8Bytes('product-metadata-1'));
    const hash2 = ethers.keccak256(ethers.toUtf8Bytes('product-metadata-2'));
    const metadataURI1 = 'ipfs://QmTest1234567890';
    const metadataURI2 = 'ipfs://QmTest0987654321';

    return {
      registry,
      owner,
      operator,
      user1,
      user2,
      tagId1,
      tagId2,
      hash1,
      hash2,
      metadataURI1,
      metadataURI2,
    };
  }

  describe('Deployment', function () {
    it('Should set the deployer as admin', async function () {
      const { registry, owner } = await loadFixture(deployETagRegistryFixture);

      const ADMIN_ROLE = await registry.ADMIN_ROLE();
      expect(await registry.hasRole(ADMIN_ROLE, owner.address)).to.be.true;
    });

    it('Should set the deployer as operator', async function () {
      const { registry, owner } = await loadFixture(deployETagRegistryFixture);

      const OPERATOR_ROLE = await registry.OPERATOR_ROLE();
      expect(await registry.hasRole(OPERATOR_ROLE, owner.address)).to.be.true;
    });

    it('Should start with zero total tags', async function () {
      const { registry } = await loadFixture(deployETagRegistryFixture);

      expect(await registry.totalTags()).to.equal(0);
    });
  });

  describe('Tag Creation', function () {
    it('Should create a new tag successfully', async function () {
      const { registry, tagId1, hash1, metadataURI1 } = await loadFixture(
        deployETagRegistryFixture
      );

      await expect(registry.createTag(tagId1, hash1, metadataURI1)).to.emit(
        registry,
        'TagCreated'
      );

      expect(await registry.totalTags()).to.equal(1);
    });

    it('Should store tag data correctly', async function () {
      const { registry, owner, tagId1, hash1, metadataURI1 } =
        await loadFixture(deployETagRegistryFixture);

      await registry.createTag(tagId1, hash1, metadataURI1);

      const tag = await registry.tags(tagId1);
      expect(tag.hash).to.equal(hash1);
      expect(tag.creator).to.equal(owner.address);
      expect(tag.metadataURI).to.equal(metadataURI1);
      expect(tag.status).to.equal(0); // CREATED
      expect(tag.exists).to.be.true;
    });

    it('Should reject duplicate tag IDs', async function () {
      const { registry, tagId1, hash1, hash2, metadataURI1, metadataURI2 } =
        await loadFixture(deployETagRegistryFixture);

      await registry.createTag(tagId1, hash1, metadataURI1);

      await expect(
        registry.createTag(tagId1, hash2, metadataURI2)
      ).to.be.revertedWithCustomError(registry, 'TagAlreadyExists');
    });

    it('Should reject duplicate hashes', async function () {
      const { registry, tagId1, tagId2, hash1, metadataURI1, metadataURI2 } =
        await loadFixture(deployETagRegistryFixture);

      await registry.createTag(tagId1, hash1, metadataURI1);

      await expect(
        registry.createTag(tagId2, hash1, metadataURI2)
      ).to.be.revertedWithCustomError(registry, 'HashAlreadyRegistered');
    });

    it('Should reject empty metadata URI', async function () {
      const { registry, tagId1, hash1 } = await loadFixture(
        deployETagRegistryFixture
      );

      await expect(
        registry.createTag(tagId1, hash1, '')
      ).to.be.revertedWithCustomError(registry, 'InvalidMetadataURI');
    });

    it('Should reject non-operator creating tags', async function () {
      const { registry, user1, tagId1, hash1, metadataURI1 } =
        await loadFixture(deployETagRegistryFixture);

      await expect(
        registry.connect(user1).createTag(tagId1, hash1, metadataURI1)
      ).to.be.reverted;
    });
  });

  describe('Batch Tag Creation', function () {
    it('Should create multiple tags in batch', async function () {
      const {
        registry,
        tagId1,
        tagId2,
        hash1,
        hash2,
        metadataURI1,
        metadataURI2,
      } = await loadFixture(deployETagRegistryFixture);

      await registry.createTagBatch(
        [tagId1, tagId2],
        [hash1, hash2],
        [metadataURI1, metadataURI2]
      );

      expect(await registry.totalTags()).to.equal(2);

      const tag1 = await registry.tags(tagId1);
      const tag2 = await registry.tags(tagId2);

      expect(tag1.exists).to.be.true;
      expect(tag2.exists).to.be.true;
    });

    it('Should reject batch with mismatched array lengths', async function () {
      const { registry, tagId1, tagId2, hash1, metadataURI1 } =
        await loadFixture(deployETagRegistryFixture);

      await expect(
        registry.createTagBatch([tagId1, tagId2], [hash1], [metadataURI1])
      ).to.be.revertedWith('Array mismatch');
    });

    it('Should reject batch larger than 50', async function () {
      const { registry } = await loadFixture(deployETagRegistryFixture);

      const tagIds: string[] = [];
      const hashes: string[] = [];
      const metadataURIs: string[] = [];

      for (let i = 0; i < 51; i++) {
        tagIds.push(ethers.keccak256(ethers.toUtf8Bytes(`TAG-${i}`)));
        hashes.push(ethers.keccak256(ethers.toUtf8Bytes(`hash-${i}`)));
        metadataURIs.push(`ipfs://QmTest${i}`);
      }

      await expect(
        registry.createTagBatch(tagIds, hashes, metadataURIs)
      ).to.be.revertedWith('Batch too large');
    });
  });

  describe('Tag Validation', function () {
    it('Should validate existing tag by ID', async function () {
      const { registry, tagId1, hash1, metadataURI1 } = await loadFixture(
        deployETagRegistryFixture
      );

      await registry.createTag(tagId1, hash1, metadataURI1);

      const [isValid, hash, metadataURI, status, createdAt] =
        await registry.validateTag(tagId1);

      expect(isValid).to.be.true;
      expect(hash).to.equal(hash1);
      expect(metadataURI).to.equal(metadataURI1);
      expect(status).to.equal(0); // CREATED
      expect(createdAt).to.be.gt(0);
    });

    it('Should validate existing tag by hash', async function () {
      const { registry, tagId1, hash1, metadataURI1 } = await loadFixture(
        deployETagRegistryFixture
      );

      await registry.createTag(tagId1, hash1, metadataURI1);

      const [isValid, returnedTagId, metadataURI, status, createdAt] =
        await registry.validateByHash(hash1);

      expect(isValid).to.be.true;
      expect(returnedTagId).to.equal(tagId1);
      expect(metadataURI).to.equal(metadataURI1);
      expect(status).to.equal(0);
      expect(createdAt).to.be.gt(0);
    });

    it('Should return invalid for non-existent tag', async function () {
      const { registry, tagId1 } = await loadFixture(deployETagRegistryFixture);

      const [isValid, hash, metadataURI, status, createdAt] =
        await registry.validateTag(tagId1);

      expect(isValid).to.be.false;
      expect(hash).to.equal(ethers.ZeroHash);
      expect(metadataURI).to.equal('');
      expect(status).to.equal(0);
      expect(createdAt).to.equal(0);
    });

    it('Should check tag existence by hash', async function () {
      const { registry, tagId1, hash1, hash2, metadataURI1 } =
        await loadFixture(deployETagRegistryFixture);

      expect(await registry.tagExistsByHash(hash1)).to.be.false;

      await registry.createTag(tagId1, hash1, metadataURI1);

      expect(await registry.tagExistsByHash(hash1)).to.be.true;
      expect(await registry.tagExistsByHash(hash2)).to.be.false;
    });
  });

  describe('Status Management', function () {
    it('Should update tag status', async function () {
      const { registry, tagId1, hash1, metadataURI1 } = await loadFixture(
        deployETagRegistryFixture
      );

      await registry.createTag(tagId1, hash1, metadataURI1);

      // Update to DISTRIBUTED (1)
      await expect(registry.updateStatus(tagId1, 1)).to.emit(
        registry,
        'TagStatusChanged'
      );

      const tag = await registry.tags(tagId1);
      expect(tag.status).to.equal(1);
    });

    it('Should allow status progression through lifecycle', async function () {
      const { registry, tagId1, hash1, metadataURI1 } = await loadFixture(
        deployETagRegistryFixture
      );

      await registry.createTag(tagId1, hash1, metadataURI1);

      // CREATED -> DISTRIBUTED
      await registry.updateStatus(tagId1, 1);
      expect((await registry.tags(tagId1)).status).to.equal(1);

      // DISTRIBUTED -> CLAIMED
      await registry.updateStatus(tagId1, 2);
      expect((await registry.tags(tagId1)).status).to.equal(2);

      // CLAIMED -> TRANSFERRED
      await registry.updateStatus(tagId1, 3);
      expect((await registry.tags(tagId1)).status).to.equal(3);
    });

    it('Should reject using updateStatus for REVOKED', async function () {
      const { registry, tagId1, hash1, metadataURI1 } = await loadFixture(
        deployETagRegistryFixture
      );

      await registry.createTag(tagId1, hash1, metadataURI1);

      await expect(registry.updateStatus(tagId1, 5)).to.be.revertedWith(
        'Use revokeTag'
      );
    });

    it('Should reject status update for non-existent tag', async function () {
      const { registry, tagId1 } = await loadFixture(deployETagRegistryFixture);

      await expect(
        registry.updateStatus(tagId1, 1)
      ).to.be.revertedWithCustomError(registry, 'TagNotFound');
    });
  });

  describe('Tag Revocation', function () {
    it('Should revoke tag with reason', async function () {
      const { registry, tagId1, hash1, metadataURI1 } = await loadFixture(
        deployETagRegistryFixture
      );

      await registry.createTag(tagId1, hash1, metadataURI1);

      const reason = 'Counterfeit detected';
      await expect(registry.revokeTag(tagId1, reason)).to.emit(
        registry,
        'TagRevoked'
      );

      const tag = await registry.tags(tagId1);
      expect(tag.status).to.equal(5); // REVOKED
    });

    it('Should mark revoked tag as invalid', async function () {
      const { registry, tagId1, hash1, metadataURI1 } = await loadFixture(
        deployETagRegistryFixture
      );

      await registry.createTag(tagId1, hash1, metadataURI1);
      await registry.revokeTag(tagId1, 'Counterfeit');

      const [isValid] = await registry.validateTag(tagId1);
      expect(isValid).to.be.false;
    });

    it('Should mark flagged tag as invalid', async function () {
      const { registry, tagId1, hash1, metadataURI1 } = await loadFixture(
        deployETagRegistryFixture
      );

      await registry.createTag(tagId1, hash1, metadataURI1);
      await registry.updateStatus(tagId1, 4); // FLAGGED

      const [isValid] = await registry.validateTag(tagId1);
      expect(isValid).to.be.false;
    });

    it('Should reject revocation by non-admin', async function () {
      const { registry, owner, operator, tagId1, hash1, metadataURI1 } =
        await loadFixture(deployETagRegistryFixture);

      // Grant operator role but not admin
      await registry.grantOperator(operator.address);

      await registry.createTag(tagId1, hash1, metadataURI1);

      await expect(registry.connect(operator).revokeTag(tagId1, 'Reason')).to.be
        .reverted;
    });
  });

  describe('Access Control', function () {
    it('Should grant operator role', async function () {
      const { registry, operator } = await loadFixture(
        deployETagRegistryFixture
      );

      await registry.grantOperator(operator.address);

      const OPERATOR_ROLE = await registry.OPERATOR_ROLE();
      expect(await registry.hasRole(OPERATOR_ROLE, operator.address)).to.be
        .true;
    });

    it('Should revoke operator role', async function () {
      const { registry, operator } = await loadFixture(
        deployETagRegistryFixture
      );

      await registry.grantOperator(operator.address);
      await registry.revokeOperator(operator.address);

      const OPERATOR_ROLE = await registry.OPERATOR_ROLE();
      expect(await registry.hasRole(OPERATOR_ROLE, operator.address)).to.be
        .false;
    });

    it('Should allow operator to create tags after role grant', async function () {
      const { registry, operator, tagId1, hash1, metadataURI1 } =
        await loadFixture(deployETagRegistryFixture);

      await registry.grantOperator(operator.address);

      await expect(
        registry.connect(operator).createTag(tagId1, hash1, metadataURI1)
      ).to.not.be.reverted;
    });
  });

  describe('Pausable', function () {
    it('Should pause contract', async function () {
      const { registry } = await loadFixture(deployETagRegistryFixture);

      await registry.pause();
      expect(await registry.paused()).to.be.true;
    });

    it('Should unpause contract', async function () {
      const { registry } = await loadFixture(deployETagRegistryFixture);

      await registry.pause();
      await registry.unpause();
      expect(await registry.paused()).to.be.false;
    });

    it('Should reject tag creation when paused', async function () {
      const { registry, tagId1, hash1, metadataURI1 } = await loadFixture(
        deployETagRegistryFixture
      );

      await registry.pause();

      await expect(
        registry.createTag(tagId1, hash1, metadataURI1)
      ).to.be.revertedWith('Pausable: paused');
    });

    it('Should reject pause by non-admin', async function () {
      const { registry, user1 } = await loadFixture(deployETagRegistryFixture);

      await expect(registry.connect(user1).pause()).to.be.reverted;
    });
  });

  describe('Gas Optimization', function () {
    it('Should efficiently create single tag', async function () {
      const { registry, tagId1, hash1, metadataURI1 } = await loadFixture(
        deployETagRegistryFixture
      );

      const tx = await registry.createTag(tagId1, hash1, metadataURI1);
      const receipt = await tx.wait();

      // Gas should be reasonable (under 200k)
      expect(receipt?.gasUsed).to.be.lt(200000);
    });

    it('Should efficiently create batch tags', async function () {
      const { registry } = await loadFixture(deployETagRegistryFixture);

      const tagIds: string[] = [];
      const hashes: string[] = [];
      const metadataURIs: string[] = [];

      for (let i = 0; i < 10; i++) {
        tagIds.push(ethers.keccak256(ethers.toUtf8Bytes(`TAG-${i}`)));
        hashes.push(ethers.keccak256(ethers.toUtf8Bytes(`hash-${i}`)));
        metadataURIs.push(`ipfs://QmTest${i}`);
      }

      const tx = await registry.createTagBatch(tagIds, hashes, metadataURIs);
      const receipt = await tx.wait();

      // Gas per tag should be reasonable (under 150k per tag for batch)
      const gasPerTag = Number(receipt?.gasUsed) / 10;
      expect(gasPerTag).to.be.lt(150000);
    });
  });
});

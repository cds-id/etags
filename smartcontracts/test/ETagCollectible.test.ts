import { expect } from 'chai';
import { ethers } from 'hardhat';
import type { ETagCollectible } from '../typechain-types';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

describe('ETagCollectible', function () {
  let collectible: ETagCollectible;
  let owner: SignerWithAddress;
  let minter: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes('ADMIN_ROLE'));
  const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes('MINTER_ROLE'));

  beforeEach(async function () {
    [owner, minter, user1, user2] = await ethers.getSigners();

    const ETagCollectibleFactory =
      await ethers.getContractFactory('ETagCollectible');
    const deployed = await ETagCollectibleFactory.deploy();
    await deployed.waitForDeployment();
    collectible = deployed as unknown as ETagCollectible;

    // Grant minter role to minter address
    await collectible.grantMinter(minter.address);
  });

  describe('Deployment', function () {
    it('Should set the correct name and symbol', async function () {
      expect(await collectible.name()).to.equal('Etags Collectible');
      expect(await collectible.symbol()).to.equal('ETAGC');
    });

    it('Should grant admin and minter roles to deployer', async function () {
      expect(await collectible.hasRole(ADMIN_ROLE, owner.address)).to.be.true;
      expect(await collectible.hasRole(MINTER_ROLE, owner.address)).to.be.true;
    });

    it('Should start with zero total supply', async function () {
      expect(await collectible.totalSupply()).to.equal(0);
    });
  });

  describe('Minting', function () {
    const tagCode = 'TAG-ABC123';
    const tokenURI = 'https://r2.example.com/nfts/TAG-ABC123/1/metadata.json';

    it('Should mint NFT to user', async function () {
      const tx = await collectible
        .connect(minter)
        .mintTo(user1.address, tagCode, tokenURI);
      const receipt = await tx.wait();

      expect(await collectible.ownerOf(1)).to.equal(user1.address);
      expect(await collectible.tokenURI(1)).to.equal(tokenURI);
      expect(await collectible.totalSupply()).to.equal(1);
    });

    it('Should emit CollectibleMinted event', async function () {
      const tagCodeHash = ethers.keccak256(ethers.toUtf8Bytes(tagCode));

      await expect(
        collectible.connect(minter).mintTo(user1.address, tagCode, tokenURI)
      )
        .to.emit(collectible, 'CollectibleMinted')
        .withArgs(1, tagCodeHash, tagCode, user1.address, tokenURI);
    });

    it('Should prevent minting same tag twice', async function () {
      await collectible
        .connect(minter)
        .mintTo(user1.address, tagCode, tokenURI);

      await expect(
        collectible.connect(minter).mintTo(user2.address, tagCode, tokenURI)
      ).to.be.revertedWithCustomError(collectible, 'TagAlreadyMinted');
    });

    it('Should revert for zero address', async function () {
      await expect(
        collectible
          .connect(minter)
          .mintTo(ethers.ZeroAddress, tagCode, tokenURI)
      ).to.be.revertedWithCustomError(collectible, 'InvalidAddress');
    });

    it('Should revert for empty tag code', async function () {
      await expect(
        collectible.connect(minter).mintTo(user1.address, '', tokenURI)
      ).to.be.revertedWithCustomError(collectible, 'InvalidTagCode');
    });

    it('Should revert for empty token URI', async function () {
      await expect(
        collectible.connect(minter).mintTo(user1.address, tagCode, '')
      ).to.be.revertedWithCustomError(collectible, 'InvalidTokenURI');
    });

    it('Should reject non-minter', async function () {
      await expect(
        collectible.connect(user1).mintTo(user1.address, tagCode, tokenURI)
      ).to.be.reverted;
    });
  });

  describe('Tag Lookup', function () {
    const tagCode = 'TAG-XYZ789';
    const tokenURI = 'https://r2.example.com/nfts/TAG-XYZ789/1/metadata.json';

    beforeEach(async function () {
      await collectible
        .connect(minter)
        .mintTo(user1.address, tagCode, tokenURI);
    });

    it('Should return token ID for tag code', async function () {
      expect(await collectible.getTokenByTag(tagCode)).to.equal(1);
    });

    it('Should return 0 for unminted tag', async function () {
      expect(await collectible.getTokenByTag('TAG-UNKNOWN')).to.equal(0);
    });

    it('Should check if tag is minted', async function () {
      expect(await collectible.isTagMinted(tagCode)).to.be.true;
      expect(await collectible.isTagMinted('TAG-UNKNOWN')).to.be.false;
    });

    it('Should return tag hash for token ID', async function () {
      const tagCodeHash = ethers.keccak256(ethers.toUtf8Bytes(tagCode));
      expect(await collectible.getTagByToken(1)).to.equal(tagCodeHash);
    });

    it('Should revert for invalid token ID', async function () {
      await expect(collectible.getTagByToken(0)).to.be.revertedWithCustomError(
        collectible,
        'TokenNotFound'
      );
      await expect(
        collectible.getTagByToken(999)
      ).to.be.revertedWithCustomError(collectible, 'TokenNotFound');
    });
  });

  describe('Access Control', function () {
    it('Should allow admin to grant minter role', async function () {
      await collectible.grantMinter(user1.address);
      expect(await collectible.hasRole(MINTER_ROLE, user1.address)).to.be.true;
    });

    it('Should allow admin to revoke minter role', async function () {
      await collectible.grantMinter(user1.address);
      await collectible.revokeMinter(user1.address);
      expect(await collectible.hasRole(MINTER_ROLE, user1.address)).to.be.false;
    });

    it('Should reject non-admin from granting roles', async function () {
      await expect(collectible.connect(user1).grantMinter(user2.address)).to.be
        .reverted;
    });
  });

  describe('Pausable', function () {
    const tagCode = 'TAG-PAUSE1';
    const tokenURI = 'https://r2.example.com/nfts/TAG-PAUSE1/1/metadata.json';

    it('Should allow admin to pause', async function () {
      await collectible.pause();
      expect(await collectible.paused()).to.be.true;
    });

    it('Should allow admin to unpause', async function () {
      await collectible.pause();
      await collectible.unpause();
      expect(await collectible.paused()).to.be.false;
    });

    it('Should prevent minting when paused', async function () {
      await collectible.pause();

      await expect(
        collectible.connect(minter).mintTo(user1.address, tagCode, tokenURI)
      ).to.be.revertedWith('Pausable: paused');
    });

    it('Should allow minting after unpause', async function () {
      await collectible.pause();
      await collectible.unpause();

      await expect(
        collectible.connect(minter).mintTo(user1.address, tagCode, tokenURI)
      ).to.not.be.reverted;
    });

    it('Should reject non-admin from pausing', async function () {
      await expect(collectible.connect(user1).pause()).to.be.reverted;
    });
  });

  describe('ERC721 Standard', function () {
    const tagCode = 'TAG-ERC721';
    const tokenURI = 'https://r2.example.com/nfts/TAG-ERC721/1/metadata.json';

    beforeEach(async function () {
      await collectible
        .connect(minter)
        .mintTo(user1.address, tagCode, tokenURI);
    });

    it('Should support ERC721 interface', async function () {
      // ERC721 interface ID
      expect(await collectible.supportsInterface('0x80ac58cd')).to.be.true;
    });

    it('Should support ERC721Metadata interface', async function () {
      // ERC721Metadata interface ID
      expect(await collectible.supportsInterface('0x5b5e139f')).to.be.true;
    });

    it('Should support AccessControl interface', async function () {
      // AccessControl interface ID
      expect(await collectible.supportsInterface('0x7965db0b')).to.be.true;
    });

    it('Should allow transfer by owner', async function () {
      await collectible
        .connect(user1)
        .transferFrom(user1.address, user2.address, 1);
      expect(await collectible.ownerOf(1)).to.equal(user2.address);
    });

    it('Should allow approval and transferFrom', async function () {
      await collectible.connect(user1).approve(user2.address, 1);
      await collectible
        .connect(user2)
        .transferFrom(user1.address, user2.address, 1);
      expect(await collectible.ownerOf(1)).to.equal(user2.address);
    });
  });

  describe('Multiple Mints', function () {
    it('Should handle multiple mints correctly', async function () {
      const tags = ['TAG-001', 'TAG-002', 'TAG-003'];
      const baseURI = 'https://r2.example.com/nfts/';

      for (let i = 0; i < tags.length; i++) {
        await collectible
          .connect(minter)
          .mintTo(user1.address, tags[i], `${baseURI}${tags[i]}/metadata.json`);
      }

      expect(await collectible.totalSupply()).to.equal(3);
      expect(await collectible.balanceOf(user1.address)).to.equal(3);

      for (let i = 0; i < tags.length; i++) {
        expect(await collectible.getTokenByTag(tags[i])).to.equal(i + 1);
        expect(await collectible.isTagMinted(tags[i])).to.be.true;
      }
    });

    it('Should mint to different users', async function () {
      await collectible
        .connect(minter)
        .mintTo(user1.address, 'TAG-A', 'https://example.com/a');
      await collectible
        .connect(minter)
        .mintTo(user2.address, 'TAG-B', 'https://example.com/b');

      expect(await collectible.ownerOf(1)).to.equal(user1.address);
      expect(await collectible.ownerOf(2)).to.equal(user2.address);
      expect(await collectible.balanceOf(user1.address)).to.equal(1);
      expect(await collectible.balanceOf(user2.address)).to.equal(1);
    });
  });
});

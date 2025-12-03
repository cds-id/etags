import { ethers } from 'hardhat';
import * as dotenv from 'dotenv';

// Load environment variables from parent directory
dotenv.config({ path: '../.env' });

async function main() {
  console.log('Deploying ETagCollectible...\n');

  const [deployer] = await ethers.getSigners();
  console.log('Deployer account:', deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log('Deployer balance:', ethers.formatEther(balance), 'ETH');

  // Check for custom owner address from .env
  const ownerAddress = process.env.CONTRACT_OWNER || deployer.address;
  const isCustomOwner =
    ownerAddress.toLowerCase() !== deployer.address.toLowerCase();

  if (isCustomOwner) {
    console.log('\nCustom owner specified:', ownerAddress);
    console.log('Roles will be transferred after deployment.');
  }

  // Deploy contract
  console.log('\nDeploying contract...');
  const ETagCollectible = await ethers.getContractFactory('ETagCollectible');
  const collectible = await ETagCollectible.deploy();

  await collectible.waitForDeployment();

  const contractAddress = await collectible.getAddress();
  console.log('ETagCollectible deployed to:', contractAddress);

  // Wait for a few block confirmations before interacting
  console.log('\nWaiting for block confirmations...');
  await collectible.deploymentTransaction()?.wait(3);

  // Role constants
  const DEFAULT_ADMIN_ROLE = ethers.ZeroHash;
  const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes('ADMIN_ROLE'));
  const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes('MINTER_ROLE'));

  // If custom owner, transfer all roles
  if (isCustomOwner) {
    console.log('\nTransferring roles to owner...');

    // Grant all roles to owner
    console.log('- Granting DEFAULT_ADMIN_ROLE to owner...');
    await collectible.grantRole(DEFAULT_ADMIN_ROLE, ownerAddress);

    console.log('- Granting ADMIN_ROLE to owner...');
    await collectible.grantRole(ADMIN_ROLE, ownerAddress);

    console.log('- Granting MINTER_ROLE to owner...');
    await collectible.grantRole(MINTER_ROLE, ownerAddress);

    // Renounce deployer roles (owner should do this after verifying)
    console.log(
      '\nNote: Deployer still has roles. Owner should revoke deployer roles after verification.'
    );
  }

  // Verify roles
  console.log('\nRole verification:');
  console.log(
    '- Deployer has DEFAULT_ADMIN_ROLE:',
    await collectible.hasRole(DEFAULT_ADMIN_ROLE, deployer.address)
  );
  console.log(
    '- Deployer has ADMIN_ROLE:',
    await collectible.hasRole(ADMIN_ROLE, deployer.address)
  );
  console.log(
    '- Deployer has MINTER_ROLE:',
    await collectible.hasRole(MINTER_ROLE, deployer.address)
  );

  if (isCustomOwner) {
    console.log(
      '- Owner has DEFAULT_ADMIN_ROLE:',
      await collectible.hasRole(DEFAULT_ADMIN_ROLE, ownerAddress)
    );
    console.log(
      '- Owner has ADMIN_ROLE:',
      await collectible.hasRole(ADMIN_ROLE, ownerAddress)
    );
    console.log(
      '- Owner has MINTER_ROLE:',
      await collectible.hasRole(MINTER_ROLE, ownerAddress)
    );
  }

  // Contract details
  console.log('\nContract details:');
  console.log('- Name:', await collectible.name());
  console.log('- Symbol:', await collectible.symbol());
  console.log('- Total Supply:', (await collectible.totalSupply()).toString());

  console.log('\n=== DEPLOYMENT COMPLETE ===');
  console.log('Contract Address:', contractAddress);
  console.log('Deployer:', deployer.address);
  if (isCustomOwner) {
    console.log('Owner:', ownerAddress);
  }

  console.log('\nAdd this to your .env file:');
  console.log(`NFT_CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=${contractAddress}`);

  console.log('\nTo verify on BaseScan, run:');
  console.log(`npx hardhat verify --network baseSepolia ${contractAddress}`);

  if (isCustomOwner) {
    console.log('\n=== IMPORTANT ===');
    console.log('After verification, the owner should revoke deployer roles:');
    console.log(`1. Call revokeRole(ADMIN_ROLE, ${deployer.address})`);
    console.log(`2. Call revokeRole(MINTER_ROLE, ${deployer.address})`);
    console.log(`3. Call revokeRole(DEFAULT_ADMIN_ROLE, ${deployer.address})`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

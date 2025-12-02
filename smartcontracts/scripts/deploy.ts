import { ethers } from 'hardhat';

async function main() {
  console.log('🚀 Deploying ETagRegistry...\n');

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log('Deployer address:', deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log('Deployer balance:', ethers.formatEther(balance), 'ETH\n');

  // Deploy contract
  const ETagRegistry = await ethers.getContractFactory('ETagRegistry');
  const registry = await ETagRegistry.deploy();

  await registry.waitForDeployment();

  const contractAddress = await registry.getAddress();
  console.log('✅ ETagRegistry deployed to:', contractAddress);

  // Verify roles
  const ADMIN_ROLE = await registry.ADMIN_ROLE();
  const OPERATOR_ROLE = await registry.OPERATOR_ROLE();

  console.log('\n📋 Contract Info:');
  console.log('  - ADMIN_ROLE:', ADMIN_ROLE);
  console.log('  - OPERATOR_ROLE:', OPERATOR_ROLE);
  console.log(
    '  - Deployer has ADMIN_ROLE:',
    await registry.hasRole(ADMIN_ROLE, deployer.address)
  );
  console.log(
    '  - Deployer has OPERATOR_ROLE:',
    await registry.hasRole(OPERATOR_ROLE, deployer.address)
  );

  // Log deployment info for verification
  console.log('\n📝 For verification, run:');
  console.log(`npx hardhat verify --network baseSepolia ${contractAddress}`);

  // Save deployment info
  console.log('\n💾 Add to .env:');
  console.log(`CONTRACT_ADDRESS=${contractAddress}`);

  return contractAddress;
}

main()
  .then((address) => {
    console.log('\n✨ Deployment completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });

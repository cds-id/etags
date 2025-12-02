import { ethers } from 'hardhat';

/**
 * Example script for interacting with deployed ETagRegistry
 * Usage: npx hardhat run scripts/interact.ts --network localhost
 */
async function main() {
  // Get contract address from env or use localhost default
  const contractAddress = process.env.CONTRACT_ADDRESS || '';

  if (!contractAddress) {
    console.error('❌ CONTRACT_ADDRESS not set in environment');
    console.log('Run: export CONTRACT_ADDRESS=<deployed_address>');
    process.exit(1);
  }

  console.log('📡 Connecting to ETagRegistry at:', contractAddress);

  // Get signer
  const [signer] = await ethers.getSigners();
  console.log('Using account:', signer.address);

  // Connect to contract
  const registry = await ethers.getContractAt(
    'ETagRegistry',
    contractAddress,
    signer
  );

  // Get contract info
  console.log('\n📊 Contract Stats:');
  console.log('  - Total Tags:', (await registry.totalTags()).toString());
  console.log('  - Paused:', await registry.paused());

  // Example: Create a test tag
  console.log('\n🏷️  Creating test tag...');

  const tagId = ethers.keccak256(ethers.toUtf8Bytes(`TAG-TEST-${Date.now()}`));
  const hash = ethers.keccak256(
    ethers.toUtf8Bytes(`product-test-${Date.now()}`)
  );
  const metadataURI = 'ipfs://QmTestMetadata';

  try {
    const tx = await registry.createTag(tagId, hash, metadataURI);
    console.log('  Transaction hash:', tx.hash);

    const receipt = await tx.wait();
    console.log('  ✅ Tag created in block:', receipt?.blockNumber);
    console.log('  Gas used:', receipt?.gasUsed.toString());

    // Validate the created tag
    console.log('\n🔍 Validating tag...');
    const [isValid, returnedHash, uri, status, createdAt] =
      await registry.validateTag(tagId);
    console.log('  - Is Valid:', isValid);
    console.log('  - Hash:', returnedHash);
    console.log('  - Metadata URI:', uri);
    console.log(
      '  - Status:',
      [
        'CREATED',
        'DISTRIBUTED',
        'CLAIMED',
        'TRANSFERRED',
        'FLAGGED',
        'REVOKED',
      ][Number(status)]
    );
    console.log(
      '  - Created At:',
      new Date(Number(createdAt) * 1000).toISOString()
    );

    // Update status
    console.log('\n📝 Updating status to DISTRIBUTED...');
    const updateTx = await registry.updateStatus(tagId, 1);
    await updateTx.wait();
    console.log('  ✅ Status updated');

    // Validate again
    const [, , , newStatus] = await registry.validateTag(tagId);
    console.log(
      '  - New Status:',
      [
        'CREATED',
        'DISTRIBUTED',
        'CLAIMED',
        'TRANSFERRED',
        'FLAGGED',
        'REVOKED',
      ][Number(newStatus)]
    );
  } catch (error: any) {
    if (error.message.includes('TagAlreadyExists')) {
      console.log(
        '  ⚠️  Tag already exists (this is expected if running multiple times)'
      );
    } else {
      throw error;
    }
  }

  console.log('\n✨ Interaction completed!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

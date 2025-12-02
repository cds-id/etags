// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title ETagRegistry
 * @dev Simplified registry for E-Tags blockchain tamper detection
 * @notice Tags created off-chain, validated on-chain
 */
contract ETagRegistry is AccessControl, Pausable {

    // ============ ROLES ============
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    // ============ ENUMS ============
    enum TagStatus {
        CREATED,        // 0 - Just created
        DISTRIBUTED,    // 1 - Sent to retail
        CLAIMED,        // 2 - First owner claimed
        TRANSFERRED,    // 3 - Ownership transferred
        FLAGGED,        // 4 - Flagged for investigation
        REVOKED         // 5 - Revoked (counterfeit)
    }

    // ============ STRUCTS ============
    struct ETag {
        bytes32 hash;           // Product metadata hash
        address creator;        // Who created this tag
        uint256 createdAt;      // Creation timestamp
        string metadataURI;     // IPFS/off-chain reference
        TagStatus status;       // Current status
        bool exists;            // Existence flag
    }

    // ============ STATE ============
    mapping(bytes32 => ETag) public tags;
    mapping(bytes32 => bytes32) public hashToTagId;
    uint256 public totalTags;

    // ============ EVENTS ============
    event TagCreated(bytes32 indexed tagId, bytes32 indexed hash, string metadataURI, uint256 timestamp);
    event TagStatusChanged(bytes32 indexed tagId, TagStatus oldStatus, TagStatus newStatus, uint256 timestamp);
    event TagRevoked(bytes32 indexed tagId, string reason, uint256 timestamp);

    // ============ ERRORS ============
    error TagAlreadyExists(bytes32 tagId);
    error TagNotFound(bytes32 tagId);
    error HashAlreadyRegistered(bytes32 hash);
    error InvalidMetadataURI();

    // ============ MODIFIERS ============
    modifier tagExists(bytes32 tagId) {
        if (!tags[tagId].exists) revert TagNotFound(tagId);
        _;
    }

    // ============ CONSTRUCTOR ============
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
    }

    // ============ TAG CREATION (Off-chain triggered) ============

    /**
     * @dev Create a new E-Tag (Operator/Admin only)
     */
    function createTag(
        bytes32 tagId,
        bytes32 hash,
        string calldata metadataURI
    ) external onlyRole(OPERATOR_ROLE) whenNotPaused {
        if (tags[tagId].exists) revert TagAlreadyExists(tagId);
        if (hashToTagId[hash] != bytes32(0)) revert HashAlreadyRegistered(hash);
        if (bytes(metadataURI).length == 0) revert InvalidMetadataURI();

        tags[tagId] = ETag({
            hash: hash,
            creator: msg.sender,
            createdAt: block.timestamp,
            metadataURI: metadataURI,
            status: TagStatus.CREATED,
            exists: true
        });

        hashToTagId[hash] = tagId;
        totalTags++;

        emit TagCreated(tagId, hash, metadataURI, block.timestamp);
    }

    /**
     * @dev Batch create tags
     */
    function createTagBatch(
        bytes32[] calldata tagIds,
        bytes32[] calldata hashes,
        string[] calldata metadataURIs
    ) external onlyRole(OPERATOR_ROLE) whenNotPaused {
        require(tagIds.length == hashes.length && hashes.length == metadataURIs.length, "Array mismatch");
        require(tagIds.length <= 50, "Batch too large");

        for (uint256 i = 0; i < tagIds.length; i++) {
            if (!tags[tagIds[i]].exists && hashToTagId[hashes[i]] == bytes32(0) && bytes(metadataURIs[i]).length > 0) {
                tags[tagIds[i]] = ETag({
                    hash: hashes[i],
                    creator: msg.sender,
                    createdAt: block.timestamp,
                    metadataURI: metadataURIs[i],
                    status: TagStatus.CREATED,
                    exists: true
                });
                hashToTagId[hashes[i]] = tagIds[i];
                emit TagCreated(tagIds[i], hashes[i], metadataURIs[i], block.timestamp);
            }
        }
        totalTags += tagIds.length;
    }

    // ============ VALIDATION (Read-only) ============

    /**
     * @dev Validate tag by ID
     */
    function validateTag(bytes32 tagId) external view returns (
        bool isValid,
        bytes32 hash,
        string memory metadataURI,
        TagStatus status,
        uint256 createdAt
    ) {
        if (!tags[tagId].exists) {
            return (false, bytes32(0), "", TagStatus.CREATED, 0);
        }

        ETag storage tag = tags[tagId];
        isValid = (tag.status != TagStatus.REVOKED && tag.status != TagStatus.FLAGGED);

        return (isValid, tag.hash, tag.metadataURI, tag.status, tag.createdAt);
    }

    /**
     * @dev Validate tag by hash
     */
    function validateByHash(bytes32 hash) external view returns (
        bool isValid,
        bytes32 tagId,
        string memory metadataURI,
        TagStatus status,
        uint256 createdAt
    ) {
        tagId = hashToTagId[hash];
        if (tagId == bytes32(0)) {
            return (false, bytes32(0), "", TagStatus.CREATED, 0);
        }

        ETag storage tag = tags[tagId];
        isValid = (tag.status != TagStatus.REVOKED && tag.status != TagStatus.FLAGGED);

        return (isValid, tagId, tag.metadataURI, tag.status, tag.createdAt);
    }

    /**
     * @dev Check if tag exists
     */
    function tagExistsByHash(bytes32 hash) external view returns (bool) {
        return hashToTagId[hash] != bytes32(0);
    }

    // ============ STATUS MANAGEMENT ============

    /**
     * @dev Update tag status
     */
    function updateStatus(bytes32 tagId, TagStatus newStatus) external onlyRole(OPERATOR_ROLE) tagExists(tagId) {
        require(newStatus != TagStatus.REVOKED, "Use revokeTag");

        TagStatus oldStatus = tags[tagId].status;
        tags[tagId].status = newStatus;

        emit TagStatusChanged(tagId, oldStatus, newStatus, block.timestamp);
    }

    /**
     * @dev Revoke tag (Admin only)
     */
    function revokeTag(bytes32 tagId, string calldata reason) external onlyRole(ADMIN_ROLE) tagExists(tagId) {
        TagStatus oldStatus = tags[tagId].status;
        tags[tagId].status = TagStatus.REVOKED;

        emit TagRevoked(tagId, reason, block.timestamp);
        emit TagStatusChanged(tagId, oldStatus, TagStatus.REVOKED, block.timestamp);
    }

    // ============ ADMIN ============

    function pause() external onlyRole(ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(ADMIN_ROLE) { _unpause(); }

    function grantOperator(address account) external onlyRole(ADMIN_ROLE) {
        _grantRole(OPERATOR_ROLE, account);
    }

    function revokeOperator(address account) external onlyRole(ADMIN_ROLE) {
        _revokeRole(OPERATOR_ROLE, account);
    }
}

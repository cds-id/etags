// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title ETagCollectible
 * @dev ERC721 NFT for first-hand tag claimers
 * @notice Minted when users claim tags as first-hand owners on Web3 browsers
 */
contract ETagCollectible is ERC721, ERC721URIStorage, AccessControl, Pausable {
    // ============ ROLES ============
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    // ============ STATE ============
    uint256 private _nextTokenId;

    // Mapping from tag code hash to token ID (one NFT per tag)
    mapping(bytes32 => uint256) public tagToToken;

    // Mapping from token ID to tag code hash (reverse lookup)
    mapping(uint256 => bytes32) public tokenToTag;

    // Track if a tag has been minted
    mapping(bytes32 => bool) public tagMinted;

    // ============ EVENTS ============
    event CollectibleMinted(
        uint256 indexed tokenId,
        bytes32 indexed tagCodeHash,
        string tagCode,
        address indexed owner,
        string tokenURI
    );

    // ============ ERRORS ============
    error TagAlreadyMinted(string tagCode);
    error InvalidAddress();
    error InvalidTagCode();
    error InvalidTokenURI();
    error TokenNotFound(uint256 tokenId);

    // ============ CONSTRUCTOR ============
    constructor() ERC721("Etags Collectible", "ETAGC") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);

        // Start token IDs at 1
        _nextTokenId = 1;
    }

    // ============ MINTING ============

    /**
     * @dev Mint a new collectible NFT for a first-hand tag claimer
     * @param to Address to mint the NFT to
     * @param tagCode The tag code string (e.g., "TAG-ABC123")
     * @param uri The token URI pointing to metadata JSON on R2
     * @return tokenId The ID of the minted token
     */
    function mintTo(
        address to,
        string calldata tagCode,
        string calldata uri
    ) external onlyRole(MINTER_ROLE) whenNotPaused returns (uint256) {
        if (to == address(0)) revert InvalidAddress();
        if (bytes(tagCode).length == 0) revert InvalidTagCode();
        if (bytes(uri).length == 0) revert InvalidTokenURI();

        bytes32 tagCodeHash = keccak256(abi.encodePacked(tagCode));

        if (tagMinted[tagCodeHash]) revert TagAlreadyMinted(tagCode);

        uint256 tokenId = _nextTokenId++;

        // Record mappings
        tagToToken[tagCodeHash] = tokenId;
        tokenToTag[tokenId] = tagCodeHash;
        tagMinted[tagCodeHash] = true;

        // Mint the token
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        emit CollectibleMinted(tokenId, tagCodeHash, tagCode, to, uri);

        return tokenId;
    }

    // ============ VIEWS ============

    /**
     * @dev Get token ID for a tag code
     * @param tagCode The tag code string
     * @return tokenId The token ID (0 if not minted)
     */
    function getTokenByTag(string calldata tagCode) external view returns (uint256) {
        bytes32 tagCodeHash = keccak256(abi.encodePacked(tagCode));
        return tagToToken[tagCodeHash];
    }

    /**
     * @dev Check if a tag has been minted
     * @param tagCode The tag code string
     * @return bool True if the tag has an NFT
     */
    function isTagMinted(string calldata tagCode) external view returns (bool) {
        bytes32 tagCodeHash = keccak256(abi.encodePacked(tagCode));
        return tagMinted[tagCodeHash];
    }

    /**
     * @dev Get the tag code hash for a token
     * @param tokenId The token ID
     * @return bytes32 The tag code hash
     */
    function getTagByToken(uint256 tokenId) external view returns (bytes32) {
        if (tokenId == 0 || tokenId >= _nextTokenId) revert TokenNotFound(tokenId);
        return tokenToTag[tokenId];
    }

    /**
     * @dev Get the total number of minted tokens
     * @return uint256 Total supply
     */
    function totalSupply() external view returns (uint256) {
        return _nextTokenId - 1;
    }

    // ============ ADMIN ============

    /**
     * @dev Pause minting
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause minting
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Grant minter role to an address
     * @param account Address to grant role to
     */
    function grantMinter(address account) external onlyRole(ADMIN_ROLE) {
        _grantRole(MINTER_ROLE, account);
    }

    /**
     * @dev Revoke minter role from an address
     * @param account Address to revoke role from
     */
    function revokeMinter(address account) external onlyRole(ADMIN_ROLE) {
        _revokeRole(MINTER_ROLE, account);
    }

    // ============ OVERRIDES ============

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }
}

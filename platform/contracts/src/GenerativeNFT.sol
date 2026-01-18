// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

/**
 * @title GenerativeNFT
 * @notice Base contract for generative art NFTs with on-chain randomness
 * @dev Designed for custom platforms - not tied to Art Blocks or fxhash
 */
contract GenerativeNFT is ERC721, ERC2981, Ownable {
    using Strings for uint256;

    // =========================================================================
    // STATE
    // =========================================================================

    /// @notice Project configuration
    struct Project {
        string name;
        string description;
        string artistName;
        string script;          // On-chain script (can be empty if using scriptURI)
        string scriptURI;       // IPFS/Arweave URI for script
        string scriptType;      // "p5js", "threejs", "vanilla", etc.
        uint256 maxSupply;
        uint256 mintPrice;
        bool paused;
        bool locked;            // Once locked, script cannot change
    }

    /// @notice Token seed data
    struct TokenSeed {
        bytes32 hash;           // Deterministic seed for this token
        uint256 projectId;
        uint256 tokenNumber;    // Token number within project (1-indexed)
    }

    /// @notice Projects by ID
    mapping(uint256 => Project) public projects;
    uint256 public projectCount;

    /// @notice Token seeds
    mapping(uint256 => TokenSeed) public tokenSeeds;

    /// @notice Tokens minted per project
    mapping(uint256 => uint256) public projectMintCount;

    /// @notice Base URI for metadata
    string public baseTokenURI;

    /// @notice Contract-level metadata URI
    string public contractURI;

    // =========================================================================
    // EVENTS
    // =========================================================================

    event ProjectCreated(uint256 indexed projectId, string name, address artist);
    event ProjectUpdated(uint256 indexed projectId);
    event ProjectLocked(uint256 indexed projectId);
    event TokenMinted(uint256 indexed tokenId, uint256 indexed projectId, bytes32 hash);

    // =========================================================================
    // ERRORS
    // =========================================================================

    error ProjectNotFound();
    error ProjectPaused();
    error ProjectLocked();
    error ProjectSoldOut();
    error InsufficientPayment();
    error InvalidProject();

    // =========================================================================
    // CONSTRUCTOR
    // =========================================================================

    constructor(
        string memory name_,
        string memory symbol_,
        string memory baseURI_,
        address royaltyReceiver,
        uint96 royaltyBps
    ) ERC721(name_, symbol_) Ownable(msg.sender) {
        baseTokenURI = baseURI_;
        _setDefaultRoyalty(royaltyReceiver, royaltyBps);
    }

    // =========================================================================
    // PROJECT MANAGEMENT
    // =========================================================================

    /**
     * @notice Create a new generative art project
     */
    function createProject(
        string calldata name_,
        string calldata description_,
        string calldata artistName_,
        string calldata script_,
        string calldata scriptURI_,
        string calldata scriptType_,
        uint256 maxSupply_,
        uint256 mintPrice_
    ) external onlyOwner returns (uint256 projectId) {
        projectId = projectCount++;

        projects[projectId] = Project({
            name: name_,
            description: description_,
            artistName: artistName_,
            script: script_,
            scriptURI: scriptURI_,
            scriptType: scriptType_,
            maxSupply: maxSupply_,
            mintPrice: mintPrice_,
            paused: false,
            locked: false
        });

        emit ProjectCreated(projectId, name_, msg.sender);
    }

    /**
     * @notice Update project (only if not locked)
     */
    function updateProject(
        uint256 projectId,
        string calldata script_,
        string calldata scriptURI_
    ) external onlyOwner {
        if (projectId >= projectCount) revert ProjectNotFound();
        if (projects[projectId].locked) revert ProjectLocked();

        projects[projectId].script = script_;
        projects[projectId].scriptURI = scriptURI_;

        emit ProjectUpdated(projectId);
    }

    /**
     * @notice Lock project (irreversible - script becomes immutable)
     */
    function lockProject(uint256 projectId) external onlyOwner {
        if (projectId >= projectCount) revert ProjectNotFound();
        projects[projectId].locked = true;
        emit ProjectLocked(projectId);
    }

    /**
     * @notice Pause/unpause minting for a project
     */
    function setPaused(uint256 projectId, bool paused_) external onlyOwner {
        if (projectId >= projectCount) revert ProjectNotFound();
        projects[projectId].paused = paused_;
    }

    // =========================================================================
    // MINTING
    // =========================================================================

    /**
     * @notice Mint a token from a project
     */
    function mint(uint256 projectId) external payable returns (uint256 tokenId) {
        if (projectId >= projectCount) revert ProjectNotFound();

        Project storage project = projects[projectId];
        if (project.paused) revert ProjectPaused();
        if (projectMintCount[projectId] >= project.maxSupply) revert ProjectSoldOut();
        if (msg.value < project.mintPrice) revert InsufficientPayment();

        uint256 tokenNumber = ++projectMintCount[projectId];
        tokenId = _computeTokenId(projectId, tokenNumber);

        // Generate deterministic hash from block data and token info
        bytes32 hash = keccak256(
            abi.encodePacked(
                blockhash(block.number - 1),
                block.timestamp,
                msg.sender,
                tokenId
            )
        );

        tokenSeeds[tokenId] = TokenSeed({
            hash: hash,
            projectId: projectId,
            tokenNumber: tokenNumber
        });

        _mint(msg.sender, tokenId);

        emit TokenMinted(tokenId, projectId, hash);
    }

    /**
     * @notice Batch mint multiple tokens
     */
    function mintBatch(uint256 projectId, uint256 quantity) external payable {
        if (projectId >= projectCount) revert ProjectNotFound();

        Project storage project = projects[projectId];
        if (project.paused) revert ProjectPaused();
        if (projectMintCount[projectId] + quantity > project.maxSupply) revert ProjectSoldOut();
        if (msg.value < project.mintPrice * quantity) revert InsufficientPayment();

        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenNumber = ++projectMintCount[projectId];
            uint256 tokenId = _computeTokenId(projectId, tokenNumber);

            bytes32 hash = keccak256(
                abi.encodePacked(
                    blockhash(block.number - 1),
                    block.timestamp,
                    msg.sender,
                    tokenId,
                    i
                )
            );

            tokenSeeds[tokenId] = TokenSeed({
                hash: hash,
                projectId: projectId,
                tokenNumber: tokenNumber
            });

            _mint(msg.sender, tokenId);

            emit TokenMinted(tokenId, projectId, hash);
        }
    }

    // =========================================================================
    // TOKEN UTILITIES
    // =========================================================================

    /**
     * @notice Compute token ID from project and token number
     * @dev Token ID = projectId * 1_000_000 + tokenNumber
     */
    function _computeTokenId(uint256 projectId, uint256 tokenNumber) internal pure returns (uint256) {
        return projectId * 1_000_000 + tokenNumber;
    }

    /**
     * @notice Get the hash for a token (used for rendering)
     */
    function getTokenHash(uint256 tokenId) external view returns (bytes32) {
        return tokenSeeds[tokenId].hash;
    }

    /**
     * @notice Get the hash as a hex string (for JavaScript injection)
     */
    function getTokenHashString(uint256 tokenId) external view returns (string memory) {
        bytes32 hash = tokenSeeds[tokenId].hash;
        return _toHexString(hash);
    }

    /**
     * @notice Get full token data for rendering
     */
    function getTokenData(uint256 tokenId) external view returns (
        bytes32 hash,
        uint256 projectId,
        uint256 tokenNumber,
        string memory script,
        string memory scriptURI,
        string memory scriptType
    ) {
        TokenSeed memory seed = tokenSeeds[tokenId];
        Project memory project = projects[seed.projectId];

        return (
            seed.hash,
            seed.projectId,
            seed.tokenNumber,
            project.script,
            project.scriptURI,
            project.scriptType
        );
    }

    // =========================================================================
    // METADATA
    // =========================================================================

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);

        // If baseTokenURI is set, use external metadata server
        if (bytes(baseTokenURI).length > 0) {
            return string(abi.encodePacked(baseTokenURI, tokenId.toString()));
        }

        // Otherwise, generate on-chain metadata
        TokenSeed memory seed = tokenSeeds[tokenId];
        Project memory project = projects[seed.projectId];

        string memory json = string(abi.encodePacked(
            '{"name":"', project.name, ' #', seed.tokenNumber.toString(), '",',
            '"description":"', project.description, '",',
            '"artist":"', project.artistName, '",',
            '"hash":"', _toHexString(seed.hash), '",',
            '"project_id":', seed.projectId.toString(), ',',
            '"token_number":', seed.tokenNumber.toString(),
            '}'
        ));

        return string(abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(bytes(json))
        ));
    }

    function setBaseURI(string calldata baseURI_) external onlyOwner {
        baseTokenURI = baseURI_;
    }

    function setContractURI(string calldata contractURI_) external onlyOwner {
        contractURI = contractURI_;
    }

    // =========================================================================
    // WITHDRAWALS
    // =========================================================================

    function withdraw() external onlyOwner {
        (bool success, ) = payable(owner()).call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }

    // =========================================================================
    // INTERFACE SUPPORT
    // =========================================================================

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // =========================================================================
    // INTERNAL HELPERS
    // =========================================================================

    function _toHexString(bytes32 data) internal pure returns (string memory) {
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(66);
        str[0] = '0';
        str[1] = 'x';
        for (uint256 i = 0; i < 32; i++) {
            str[2 + i * 2] = alphabet[uint8(data[i] >> 4)];
            str[3 + i * 2] = alphabet[uint8(data[i] & 0x0f)];
        }
        return string(str);
    }
}

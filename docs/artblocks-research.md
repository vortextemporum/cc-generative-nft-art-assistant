# Art Blocks Deep Research: Smart Contracts, APIs & Analysis Methods

## Overview

Art Blocks is a platform for creating and collecting generative art on the Ethereum blockchain. Artists deploy on-chain generative algorithms that create unique artworks at mint time, using a pseudo-random hash as the seed for each piece.

---

## 1. Smart Contract Architecture

### Core Contracts (Flagship)

Art Blocks uses a versioned contract architecture:

| Version | Contract Address | Notes |
|---------|------------------|-------|
| **V0** | `0x059edd72cd353df5106d2b9cc5ab83a52287ac3a` | Projects 0-3 (e.g., Chromie Squiggle, Genesis) |
| **V1** | `0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270` | Projects 4 onwards (main flagship) |
| **V3** | `0x99a9b7c1116f9ceeb1652de04d5969cce509b069` | Latest GenArt721CoreV3 |

### V3 Contract Architecture

The latest V3 contracts are the most advanced and modular:

```
┌──────────────────────────────────────────────────────────────┐
│                    GenArt721CoreV3                            │
│  (ERC-721 NFT contract managing metadata, scripts, hashes)   │
└─────────────────────────┬────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────────┐
│ Admin ACL     │ │ Randomizer    │ │ Core Registry     │
│ Contract      │ │ Contract      │ │ Contract          │
└───────────────┘ └───────────────┘ └───────────────────┘
                          │
                          ▼
                ┌───────────────────┐
                │ MinterFilter V2   │
                │ (Shared Suite)    │
                └─────────┬─────────┘
                          │
    ┌─────────┬───────────┼───────────┬─────────┐
    ▼         ▼           ▼           ▼         ▼
┌───────┐ ┌───────┐ ┌──────────┐ ┌────────┐ ┌──────┐
│SetPrce│ │Merkle │ │DA-Exp    │ │Holder  │ │RAM   │
│V5     │ │V5     │ │Settlement│ │V4      │ │      │
└───────┘ └───────┘ └──────────┘ └────────┘ └──────┘
```

### Key V3 Contract Addresses

| Contract | Mainnet Address |
|----------|-----------------|
| MinterFilterV2 (Flagship) | `0xa2ccfE293bc2CDD78D8166a82D1e18cD2148122b` |
| Shared Randomizer | `0x13178A7a8A1A9460dBE39f7eCcEbD91B31752b91` |
| GenArt721CoreV3 (Studio) | `0x99a9b7c1116f9ceeb1652de04d5969cce509b069` |

### Contract Types

1. **GenArt721CoreV3** - Standard on-chain generative art
2. **GenArt721CoreV3_Engine** - For Engine partners (v3.1.0)
3. **GenArt721CoreV3_Engine_Flex** - Allows external assets (IPFS, Arweave)

---

## 2. Minter Suite (Latest)

The Shared Minter Suite is a collection of modular minting contracts:

### Available Minters (V5 Series - Latest)

| Minter Type | Description |
|-------------|-------------|
| `MinterSetPriceV5` | Fixed price ETH sales |
| `MinterSetPriceERC20V5` | Fixed price ERC-20 token sales |
| `MinterSetPriceMerkleV5` | Allowlist minting with Merkle proofs |
| `MinterSetPriceHolderV4` | Token-gated minting (NFT holders only) |
| `MinterDALinV5` | Linear Dutch Auction |
| `MinterDAExpV5` | Exponential Dutch Auction |
| `MinterDAExpSettlementV3` | DA with Settlement (all pay lowest price) |
| `MinterSetPricePolyptychV5` | Multi-panel artwork minting |
| **Ranked Auction Minter (RAM)** | Bid-based ranked auction |
| **Serial English Auction (SEA)** | Sequential English auctions |

### Ranked Auction Minter (RAM)

The RAM allows collectors to submit bids for limited tokens:
- Highest bidders win tokens
- Losing bidders get refunds
- All winners pay the **lowest winning bid** price
- Fully on-chain, non-custodial

---

## 3. APIs for Fetching & Analyzing Projects

### Token API

Get metadata for any Art Blocks token:

```
# Flagship
https://token.artblocks.io/{tokenID}

# Engine (requires contract address)
https://token.artblocks.io/{contractAddress}/{tokenID}

# Example
https://token.artblocks.io/0
```

### Generator API (Live View)

Get an iframe-able live view of the generative art:

```
# Flagship
https://generator.artblocks.io/{tokenID}

# Engine
https://generator.artblocks.io/{contractAddress}/{tokenID}
```

### Media API (Static Renders)

```
# Standard
https://media.artblocks.io/{tokenID}.png

# HD Renders
https://media.artblocks.io/hd/{tokenID}.png

# Thumbnails
https://media.artblocks.io/thumb/{tokenID}.png
```

---

## 4. The Graph Subgraph (On-Chain Data)

Art Blocks uses The Graph's decentralized network for indexing on-chain data.

### Subgraph Endpoints

| Network | Endpoint |
|---------|----------|
| **Ethereum Mainnet** | `https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/6bR1oVsRUUs6czNiB6W7NNenTXtVfNd5iSiwvS4QbRPB` |
| **Arbitrum One** | `https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/5WwGsBwJ2hVBpc3DphX4VHVMsoPnRkVkuZF4HTArZjCm` |
| **Sepolia Testnet** | `https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/9G5q5avz4X8GZ8UEGdu197433nSWSCsFa2eo6vHNBooc` |

---

## 5. GraphQL Queries for Project Analysis

### Get All Projects by Artist

```graphql
{
  projects(
    where: {
      artistName_contains_nocase: "Tyler Hobbs"
      contract_in: [
        "0x059edd72cd353df5106d2b9cc5ab83a52287ac3a"
        "0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270"
      ]
    }
    first: 100
  ) {
    id
    projectId
    name
    artistName
    artistAddress
    invocations
    maxInvocations
    script
    scriptTypeAndVersion
    license
    paused
    active
    complete
    createdAt
  }
}
```

### Get All Art Blocks Projects with Details

```graphql
{
  projects(
    where: {
      contract_in: [
        "0x059edd72cd353df5106d2b9cc5ab83a52287ac3a"
        "0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270"
        "0x99a9b7c1116f9ceeb1652de04d5969cce509b069"
      ]
    }
    first: 500
    orderBy: projectId
    orderDirection: desc
  ) {
    id
    projectId
    name
    artistName
    artistAddress
    invocations
    maxInvocations
    pricePerTokenInWei
    currencySymbol
    scriptTypeAndVersion
    aspectRatio
    description
    license
    website
    createdAt
  }
}
```

### Get Project Script (On-Chain Algorithm)

```graphql
{
  project(id: "0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270-78") {
    name
    artistName
    script
    scriptTypeAndVersion
    aspectRatio
  }
}
```

### Get Token Owners for a Project

```graphql
{
  tokens(
    where: { 
      project: "0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270-78"
    }
    first: 1000
  ) {
    id
    tokenId
    hash
    owner {
      id
    }
    createdAt
    transactionHash
  }
}
```

### Get Minter Configuration

```graphql
{
  project(id: "0x99a9b7c1116f9ceeb1652de04d5969cce509b069-404") {
    id
    name
    minterConfiguration {
      id
      priceIsConfigured
      currencySymbol
      currencyAddress
      basePrice
      maxInvocations
      extraMinterDetails
      minter {
        id
        type
        extraMinterDetails
      }
    }
  }
}
```

### Get Recently Minted Tokens

```graphql
{
  tokens(
    first: 50
    orderBy: createdAt
    orderDirection: desc
    where: {
      contract_in: [
        "0x059edd72cd353df5106d2b9cc5ab83a52287ac3a"
        "0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270"
      ]
    }
  ) {
    id
    tokenId
    hash
    createdAt
    transactionHash
    owner {
      id
    }
    project {
      name
      artistName
      projectId
    }
  }
}
```

---

## 6. Hasura GraphQL API (Off-Chain + On-Chain)

For richer data including off-chain metadata:

| Chain | Environment | URL |
|-------|-------------|-----|
| Ethereum | Production | `https://data.artblocks.io/v1/graphql` |
| Arbitrum | Production | `https://ab-prod-arbitrum.hasura.app/v1/graphql` |
| Base | Production | `https://ab-prod-base.hasura.app/v1/graphql` |

### Interactive Playground
`https://cloud.hasura.io/public/graphiql?endpoint=https://data.artblocks.io/v1/graphql`

---

## 7. Node.js Package for Art Blocks

### Installation

```bash
npm install artblocks
```

### Usage

```javascript
import ArtBlocks from 'artblocks';

// Initialize for mainnet
const artblocks = new ArtBlocks("thegraph", "mainnet");

// Get all project names
const projects = await artblocks.projects();
// Returns: [{ id: 0, name: 'Chromie Squiggle' }, ...]

// Get project details
const project = await artblocks.project(0);

// Get token details
const token = await artblocks.token(0);
// Returns: { project_id, project_name, token_id, token_invocation, token_hash }

// Custom GraphQL query
const query = `{
  projects(
    first: 5,
    orderBy: projectId,
    orderDirection: desc,
    where: { curationStatus: "curated" }
  ) {
    projectId
    name
    artistName
    curationStatus
  }
}`;
const result = await artblocks.custom(query);
```

---

## 8. Direct Contract Interaction (ethers.js)

```javascript
import { ethers } from 'ethers';

const GENART721_ABI = [
  "function projectDetails(uint256) view returns (string name, string artistName, string description, string website, string license)",
  "function projectTokenInfo(uint256) view returns (address, uint256 pricePerTokenInWei, uint256 invocations, uint256 maxInvocations, bool active, address, uint256, uint256 currencyDecimals)",
  "function projectScriptInfo(uint256) view returns (string scriptTypeAndVersion, string aspectRatio, uint256 scriptCount)",
  "function projectScriptByIndex(uint256 projectId, uint256 index) view returns (string)",
  "function tokenIdToHash(uint256) view returns (bytes32)",
  "function ownerOf(uint256) view returns (address)"
];

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const contract = new ethers.Contract(
  "0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270",
  GENART721_ABI,
  provider
);

// Get project details
const details = await contract.projectDetails(78); // Fidenza
console.log(details.name, details.artistName);

// Get full script
const scriptInfo = await contract.projectScriptInfo(78);
let fullScript = '';
for (let i = 0; i < scriptInfo.scriptCount; i++) {
  fullScript += await contract.projectScriptByIndex(78, i);
}

// Get token hash
const hash = await contract.tokenIdToHash(78000001);
```

---

## 9. Analysis Script Example

```javascript
// Full analysis script for Art Blocks projects
import { GraphQLClient, gql } from 'graphql-request';

const SUBGRAPH_URL = 'https://gateway-arbitrum.network.thegraph.com/api/YOUR_API_KEY/subgraphs/id/6bR1oVsRUUs6czNiB6W7NNenTXtVfNd5iSiwvS4QbRPB';
const client = new GraphQLClient(SUBGRAPH_URL);

// Get all projects by a specific artist
async function getProjectsByArtist(artistName) {
  const query = gql`
    query GetArtistProjects($artistName: String!) {
      projects(
        where: { artistName_contains_nocase: $artistName }
        first: 100
        orderBy: createdAt
        orderDirection: desc
      ) {
        id
        projectId
        name
        artistName
        artistAddress
        invocations
        maxInvocations
        scriptTypeAndVersion
        aspectRatio
        license
        complete
        paused
        createdAt
        updatedAt
      }
    }
  `;
  
  return client.request(query, { artistName });
}

// Get all tokens for a project
async function getProjectTokens(projectId, contractAddress) {
  const fullProjectId = `${contractAddress}-${projectId}`;
  const query = gql`
    query GetProjectTokens($projectId: String!) {
      tokens(
        where: { project: $projectId }
        first: 1000
        orderBy: tokenId
      ) {
        id
        tokenId
        hash
        owner { id }
        createdAt
        transactionHash
      }
    }
  `;
  
  return client.request(query, { projectId: fullProjectId });
}

// Get project statistics
async function getProjectStats(projectId, contractAddress) {
  const fullProjectId = `${contractAddress}-${projectId}`;
  const query = gql`
    query GetProjectStats($projectId: String!) {
      project(id: $projectId) {
        name
        artistName
        invocations
        maxInvocations
        pricePerTokenInWei
        currencySymbol
        complete
        script
        scriptTypeAndVersion
        owners {
          id
          count
        }
      }
    }
  `;
  
  return client.request(query, { projectId: fullProjectId });
}

// Example usage
const artistProjects = await getProjectsByArtist("Tyler Hobbs");
console.log(`Found ${artistProjects.projects.length} projects`);

for (const project of artistProjects.projects) {
  console.log(`${project.name} - ${project.invocations}/${project.maxInvocations} minted`);
}
```

---

## 10. Resources

### Official Documentation
- Docs: https://docs.artblocks.io
- API Docs: https://docs.artblocks.io/public-api-docs/
- Wiki: https://artblocks.wiki

### GitHub Repositories
- Contracts: https://github.com/ArtBlocks/artblocks-contracts
- Subgraph: https://github.com/ArtBlocks/artblocks-subgraph
- Node Package: https://github.com/ArtBlocks/node-artblocks
- Docs: https://github.com/ArtBlocks/artblocks-docs

### NPM Package
```bash
npm install @artblocks/contracts
npm install artblocks
```

### Etherscan Verified Contracts
- V0: https://etherscan.io/address/0x059edd72cd353df5106d2b9cc5ab83a52287ac3a#code
- V1: https://etherscan.io/address/0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270#code
- V3: https://etherscan.io/address/0x99a9b7c1116f9ceeb1652de04d5969cce509b069#code

---

## Summary

Art Blocks provides a rich ecosystem for programmatic access:

1. **Subgraph** - Best for on-chain data queries (projects, tokens, owners)
2. **Hasura API** - Best for combined on-chain + off-chain data
3. **Token/Generator/Media APIs** - Best for display and metadata
4. **Direct Contract Calls** - Best for real-time data and script extraction
5. **node-artblocks** - Best for quick Node.js integration

For analysis, start with the subgraph queries to explore projects and artists, then use direct contract calls to extract the actual generative scripts stored on-chain.

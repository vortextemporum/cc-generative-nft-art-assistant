# Datasets

This directory contains all raw datasets fetched from generative art platforms.

## Dataset Files

| File | Size | Projects | Source | Description |
|------|------|----------|--------|-------------|
| `fxhash-dataset.json` | 465MB | 27,430 | [fxhash.xyz](https://fxhash.xyz) | Tezos generative art platform |
| `artblocks-dataset.json` | 31MB | 908 | [artblocks.io](https://artblocks.io) | Ethereum curated generative art |
| `dwitter-dataset.json` | 3MB | 5,000 | [dwitter.net](https://dwitter.net) | 140-character JavaScript demos |
| `highlight-dataset.json` | 846KB | 6 | [highlight.xyz](https://highlight.xyz) | Multi-chain generative collections |

## Dataset Schemas

### Art Blocks (`artblocks-dataset.json`)

```json
{
  "projects": [
    {
      "id": "0x...-123",
      "project_id": "123",
      "name": "Project Name",
      "artist_name": "Artist",
      "description": "...",
      "script": "// full p5.js/three.js code...",
      "script_type_and_version": "p5js@1.0.0",
      "invocations": 500,
      "max_invocations": 1000,
      "license": "CC BY-NC 4.0",
      "aspect_ratio": 1.0
    }
  ]
}
```

### fxhash (`fxhash-dataset.json`)

```json
{
  "projects": [
    {
      "id": "123",
      "name": "Project Name",
      "author": { "id": "tz1...", "name": "Artist" },
      "description": "...",
      "generativeUri": "ipfs://Qm...",
      "tags": ["generative", "p5js", "abstract"],
      "supply": 256,
      "balance": 0,
      "mintOpensAt": "2023-01-01T00:00:00Z",
      "script": "// code if fetched with --with-scripts"
    }
  ]
}
```

### Dwitter (`dwitter-dataset.json`)

```json
{
  "platform": "dwitter.net",
  "stats": {
    "total": 5000,
    "unique_authors": 372,
    "total_likes": 42257,
    "avg_code_length": 95
  },
  "dweets": [
    {
      "id": 12345,
      "code": "for(i=99;i--;)x.fillRect(i*9,i*9,9,9)",
      "author": "username",
      "posted": "2023-01-01T00:00:00Z",
      "likes": 42,
      "link": "https://www.dwitter.net/d/12345",
      "code_length": 38,
      "uses_time": true,
      "uses_sin_cos": true
    }
  ]
}
```

### Highlight (`highlight-dataset.json`)

```json
{
  "platform": "highlight.xyz",
  "collections": [
    {
      "id": "base:0x...",
      "chain": "base",
      "contract_address": "0x...",
      "contract_name": "Collection Name",
      "total_supply": 100,
      "code_type": "arweave",
      "code": {
        "index.html": "<!DOCTYPE html>...",
        "sketch.js": "// p5.js code...",
        "hl-gen.js": "// Highlight framework..."
      },
      "sample_tokens": [...],
      "all_attributes": [...]
    }
  ]
}
```

## Fetching New Data

```bash
# Art Blocks (metadata only, fast)
node scripts/artblocks-fetcher.js

# Art Blocks with full scripts
node scripts/artblocks-fetcher.js --with-scripts

# fxhash (metadata only)
node scripts/fxhash-fetcher.js

# fxhash with scripts from IPFS (slow)
node scripts/fxhash-fetcher.js --with-scripts

# Dwitter (public API, no auth)
node scripts/dwitter-fetcher.js --limit 5000

# Highlight (requires Alchemy API key)
ALCHEMY_API_KEY=xxx node scripts/highlight-fetcher.js
```

## Processing Datasets

The `processed/` directory contains transformed datasets optimized for AI training:

```bash
# Process all datasets into training formats
node scripts/process-dataset.js data/artblocks-dataset.json data/fxhash-dataset.json
```

This generates:
- `processed/training-examples.json` - Instruction-response pairs
- `processed/rag-documents.json` - Searchable document chunks
- `processed/code-examples.json` - Curated code samples
- `processed/system-knowledge.json` - Aggregated statistics

## Platform Details

### Art Blocks
- **Chain**: Ethereum
- **API**: Hasura GraphQL (`data.artblocks.io/v1/graphql`)
- **Scripts**: Stored on-chain, fetched via API
- **Framework**: p5.js, Three.js, custom JS

### fxhash
- **Chain**: Tezos
- **API**: GraphQL (`api.fxhash.xyz/graphql`)
- **Scripts**: Stored on IPFS
- **Framework**: fxhash SDK with `fxrand()` for deterministic randomness

### Dwitter
- **Type**: Code golf / demos
- **API**: REST (`dwitter.net/api/dweets/`)
- **Constraint**: 140 characters max
- **Variables**: `c` (canvas), `x` (context), `t` (time), `S` (Math.sin), `C` (Math.cos)

### Highlight
- **Chain**: Ethereum, Base, Arbitrum, Optimism, etc.
- **API**: Alchemy NFT API + Arweave
- **Scripts**: Stored on Arweave or on-chain (base64)
- **Framework**: hl-gen.js with `hl.tx.hash` for randomness

## Stats Summary

| Platform | Projects | Artists | With Code | Primary Framework |
|----------|----------|---------|-----------|-------------------|
| fxhash | 27,430 | 4,593 | 27,430 | p5.js, custom |
| Art Blocks | 908 | 447 | 908 | p5.js, Three.js |
| Dwitter | 5,000 | 372 | 5,000 | Vanilla JS (140 chars) |
| Highlight | 6 | 6 | 4 | p5.js, Three.js |
| **Total** | **33,344** | **~5,400** | **33,342** | - |

## Notes

- fxhash dataset is large (465MB) due to 27k+ projects
- Art Blocks scripts require `tokenData.hash` for deterministic output
- fxhash scripts require `fxrand()` for deterministic output
- Dwitter demos use a fixed canvas size (1920x1080) and time variable `t`
- Highlight uses `hl.tx.hash` derived from mint transaction

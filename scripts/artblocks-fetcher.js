#!/usr/bin/env node

/**
 * Art Blocks Complete Dataset Fetcher v2
 * 
 * Fetches ALL Art Blocks projects with full metadata and scripts.
 * Auto-discovers schema fields to handle API changes.
 * 
 * Usage:
 *   node artblocks-fetcher.js                    # Metadata only (fast)
 *   node artblocks-fetcher.js --with-scripts     # Include full scripts
 *   node artblocks-fetcher.js --output data.json # Custom output file
 */

const fs = require('fs');
const https = require('https');

const HASURA_ENDPOINT = "https://data.artblocks.io/v1/graphql";
const DEFAULT_OUTPUT = "artblocks-dataset.json";

// ============================================================================
// HTTP HELPER
// ============================================================================

function queryHasura(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query, variables });
    
    const url = new URL(HASURA_ENDPOINT);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.errors) {
            reject(new Error(JSON.stringify(json.errors, null, 2)));
          } else {
            resolve(json.data);
          }
        } catch (e) {
          reject(new Error(`Parse error: ${e.message}\nResponse: ${data.slice(0, 500)}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// SCHEMA INTROSPECTION
// ============================================================================

async function getSchemaFields() {
  console.log("Introspecting schema...");
  
  const introspectionQuery = `
    query IntrospectProjectsMetadata {
      __type(name: "projects_metadata") {
        fields {
          name
          type {
            name
            kind
            ofType {
              name
              kind
            }
          }
        }
      }
    }
  `;
  
  try {
    const result = await queryHasura(introspectionQuery);
    const fields = result.__type?.fields || [];
    console.log(`Found ${fields.length} fields in projects_metadata`);
    return fields.map(f => f.name);
  } catch (e) {
    console.log("Introspection failed, using fallback fields");
    return null;
  }
}

// ============================================================================
// MAIN FETCH
// ============================================================================

async function fetchAllProjects(includeScripts = false) {
  console.log("=".repeat(60));
  console.log("ART BLOCKS DATASET FETCHER v2");
  console.log("=".repeat(60));
  console.log(`Endpoint: ${HASURA_ENDPOINT}`);
  console.log(`Include scripts: ${includeScripts}`);
  console.log("");

  // Get available fields
  const availableFields = await getSchemaFields();
  
  // Build query with safe fields (avoiding nested/complex types initially)
  const safeScalarFields = [
    'id',
    'project_id', 
    'name',
    'artist_name',
    'description',
    'website',
    'license',
    'aspect_ratio',
    'render_delay',
    'contract_address',
    'start_datetime',
    'complete',
    'active',
    'paused',
    'invocations',
    'max_invocations',
    'royalty_percentage',
    'vertical_name',
    'script',
    'script_json',
    'dependency',
    'script_type_and_version',
    'script_type_and_version_override',
    'primary_render_type',
    'preview_render_type',
    'price_per_token_in_wei',
    'currency_symbol',
    'currency_address',
    'minter_address',
    'artist_address',
    'additional_payee',
    'additional_payee_percentage',
    'curation_status',
    'heritage_curation_status',
    'is_flagship',
    'charitable_giving_details',
    'creative_credit',
    'link',
    'series',
    'external_asset_dependencies',
    'open_sea_slug',
  ];
  
  // Filter to only fields that exist
  let fieldsToQuery = safeScalarFields;
  if (availableFields) {
    fieldsToQuery = safeScalarFields.filter(f => availableFields.includes(f));
    console.log(`Using ${fieldsToQuery.length} available fields`);
  }
  
  // Remove script fields for initial fetch if not requested
  if (!includeScripts) {
    fieldsToQuery = fieldsToQuery.filter(f => !['script', 'script_json'].includes(f));
  }

  const PROJECTS_QUERY = `
    query GetAllProjects($limit: Int!, $offset: Int!) {
      projects_metadata(
        limit: $limit, 
        offset: $offset,
        order_by: {project_id: asc}
      ) {
        ${fieldsToQuery.join('\n        ')}
      }
    }
  `;

  console.log("\nQuery fields:", fieldsToQuery.slice(0, 10).join(', '), '...');
  console.log("");

  const allProjects = [];
  const batchSize = 100;
  let offset = 0;
  
  console.log("Fetching projects...");
  
  while (true) {
    process.stdout.write(`  Batch at offset ${offset}... `);
    
    try {
      const result = await queryHasura(PROJECTS_QUERY, {
        limit: batchSize,
        offset: offset
      });
      
      const projects = result.projects_metadata || [];
      
      if (projects.length === 0) {
        console.log("done (no more projects)");
        break;
      }
      
      allProjects.push(...projects);
      console.log(`got ${projects.length} (total: ${allProjects.length})`);
      
      offset += batchSize;
      await sleep(100);
      
    } catch (e) {
      console.log(`ERROR: ${e.message.slice(0, 200)}`);
      
      // If we got some projects, continue; otherwise fail
      if (allProjects.length > 0) {
        console.log("Continuing with partial data...");
        break;
      } else {
        throw e;
      }
    }
  }
  
  console.log(`\n✓ Fetched ${allProjects.length} projects\n`);

  // Fetch scripts separately if requested but not included in main query
  if (includeScripts && !fieldsToQuery.includes('script')) {
    console.log("Fetching scripts separately...");
    
    const SCRIPT_QUERY = `
      query GetScript($id: String!) {
        projects_metadata_by_pk(id: $id) {
          script
          script_json
          dependency
        }
      }
    `;
    
    let scriptsLoaded = 0;
    
    for (let i = 0; i < allProjects.length; i++) {
      try {
        const result = await queryHasura(SCRIPT_QUERY, { id: allProjects[i].id });
        const p = result.projects_metadata_by_pk;
        if (p) {
          allProjects[i].script = p.script;
          allProjects[i].script_json = p.script_json;
          allProjects[i].dependency = p.dependency;
          if (p.script) scriptsLoaded++;
        }
      } catch (e) {
        // Skip individual failures
      }
      
      if ((i + 1) % 50 === 0) {
        console.log(`  Progress: ${i + 1}/${allProjects.length} (${scriptsLoaded} scripts)`);
      }
      
      await sleep(30);
    }
    
    console.log(`\n✓ Loaded ${scriptsLoaded} scripts\n`);
  }

  return allProjects;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const includeScripts = args.includes('--with-scripts') || args.includes('-s');
  
  let outputFile = DEFAULT_OUTPUT;
  const outputIdx = args.findIndex(a => a === '--output' || a === '-o');
  if (outputIdx !== -1 && args[outputIdx + 1]) {
    outputFile = args[outputIdx + 1];
  }

  try {
    const projects = await fetchAllProjects(includeScripts);
    
    if (projects.length === 0) {
      console.error("No projects fetched!");
      process.exit(1);
    }
    
    const dataset = {
      metadata: {
        source: "Art Blocks",
        api: HASURA_ENDPOINT,
        fetched_at: new Date().toISOString(),
        total_projects: projects.length,
        projects_with_scripts: projects.filter(p => p.script).length,
        fields: Object.keys(projects[0] || {})
      },
      projects: projects
    };
    
    console.log("Saving to " + outputFile + "...");
    
    const json = JSON.stringify(dataset, null, 2);
    fs.writeFileSync(outputFile, json);
    
    const sizeMB = (Buffer.byteLength(json) / 1024 / 1024).toFixed(2);
    
    console.log("");
    console.log("=".repeat(60));
    console.log("COMPLETE");
    console.log("=".repeat(60));
    console.log(`Output: ${outputFile}`);
    console.log(`Size: ${sizeMB} MB`);
    console.log(`Projects: ${projects.length}`);
    console.log(`With scripts: ${projects.filter(p => p.script).length}`);
    console.log(`Fields: ${Object.keys(projects[0] || {}).length}`);
    console.log("");
    
    // Show sample
    console.log("Sample project:");
    const sample = projects[0];
    console.log(`  Name: ${sample.name}`);
    console.log(`  Artist: ${sample.artist_name}`);
    console.log(`  ID: ${sample.project_id}`);
    
  } catch (e) {
    console.error("\nFatal error:", e.message);
    process.exit(1);
  }
}

main();

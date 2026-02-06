/**
 * Basic Usage Example
 * 
 * This example shows how to use OpenClaw Pro's Knowledge Graph
 * as a library in your own application.
 * 
 * Run with: npx tsx examples/basic-usage.ts
 */

import { KnowledgeGraph } from '../packages/core/src/knowledge-graph/knowledge-graph.js';

async function main() {
  console.log('🦅 OpenClaw Pro - Basic Usage Example\n');

  // 1. Create and initialize the knowledge graph
  console.log('1. Initializing Knowledge Graph...');
  const kg = new KnowledgeGraph('./data/example-kg');
  await kg.initialize();
  console.log('   ✅ Knowledge Graph ready\n');

  // 2. Add some knowledge nodes
  console.log('2. Adding knowledge nodes...');
  
  await kg.addNode({
    id: 'company_info',
    type: 'entity',
    content: 'Acme Corp is a technology company founded in 2020. They specialize in AI solutions.',
    metadata: { category: 'company', importance: 'high' }
  });

  await kg.addNode({
    id: 'product_info',
    type: 'concept',
    content: 'Acme AI Assistant is a virtual assistant that helps with customer support and internal queries.',
    metadata: { category: 'product', importance: 'high' }
  });

  await kg.addNode({
    id: 'pricing_info',
    type: 'fact',
    content: 'Acme AI Assistant pricing: Free tier (100 queries/month), Pro ($49/month), Enterprise (custom).',
    metadata: { category: 'pricing', importance: 'medium' }
  });

  console.log('   ✅ Added 3 knowledge nodes\n');

  // 3. Query the knowledge graph
  console.log('3. Querying knowledge graph...\n');

  const queries = [
    'What is Acme Corp?',
    'Tell me about pricing',
    'What products do they have?'
  ];

  for (const query of queries) {
    console.log(`   Query: "${query}"`);
    const results = await kg.queryNodes(query, { limit: 2 });
    
    if (results.length > 0) {
      console.log(`   Found ${results.length} result(s):`);
      results.forEach((node, i) => {
        const preview = node.content?.substring(0, 80) + '...';
        console.log(`     ${i + 1}. [${node.type}] ${preview}`);
      });
    } else {
      console.log('   No results found');
    }
    console.log('');
  }

  // 4. Get a specific node
  console.log('4. Getting specific node by ID...');
  const node = await kg.getNode('company_info');
  if (node) {
    console.log(`   Found: ${node.content}\n`);
  }

  // 5. Clean up
  console.log('5. Closing knowledge graph...');
  await kg.close();
  console.log('   ✅ Done!\n');

  console.log('🎉 Example complete! Check ./data/example-kg for the stored data.');
}

main().catch(console.error);

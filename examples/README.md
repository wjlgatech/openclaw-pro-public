# Examples

This directory contains example code for using OpenClaw Pro.

## Running Examples

First, make sure you've built the project:

```bash
npm install
npm run build
```

Then run any example with:

```bash
npx tsx examples/<example-name>.ts
```

## Available Examples

### basic-usage.ts

Demonstrates core Knowledge Graph functionality:

- Creating and initializing a knowledge graph
- Adding nodes with different types
- Querying nodes with natural language
- Retrieving nodes by ID

```bash
npx tsx examples/basic-usage.ts
```

## Adding Your Own Examples

Feel free to create new examples! Follow the existing pattern:

1. Create a new `.ts` file in this directory
2. Import from `../packages/core/src/...`
3. Add a description comment at the top
4. Include a `main()` function with clear console output

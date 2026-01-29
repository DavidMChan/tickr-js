# Tickr.cc JavaScript Client

<p align="center">
  <img width="64" height="64" src="https://tickr.cc/favicon.svg" alt="Tickr.cc favicon" />
</p>

<p align="center">
  <b>Simple, Shareable, Powerful Counters for Anything.</b>
</p>

<p align="center">
  <img alt="npm" src="https://img.shields.io/npm/v/tickr-js?color=4f46e5&label=npm&logo=npm&logoColor=white">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-8b5cf6">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-Included-blue?logo=typescript&logoColor=white">
  <img alt="API Key Auth" src="https://img.shields.io/badge/Auth-API%20Key%20Only-purple?logo=keybase&logoColor=white">
  <img alt="Private Counters" src="https://img.shields.io/badge/Private%20Counters-Supported-4f46e5">
  <img alt="Read Only" src="https://img.shields.io/badge/Read%20Only%20Counters-Supported-8b5cf6">
  <img alt="Made with Love" src="https://img.shields.io/badge/Made%20with-%E2%9D%A4-purple">
</p>

A JavaScript/TypeScript client library for interacting with the Tickr.cc API (counters service).

---

## Features
- Fetch all your counters (requires authentication)
- Create a new counter (requires authentication)
- Fetch a public counter by slug
- Increment a counter (public or private, depending on API config)
- Update a counter (requires authentication and ownership)
- Delete a counter (requires authentication and ownership)
- Supports API key authentication (recommended; JWT is deprecated)
- Supports `is_private` and `is_readonly` counter properties
- Fully typed with TypeScript definitions

## Installation

```bash
npm install tickr-js
# or
yarn add tickr-js
```

## Usage

```typescript
import { TickrClient } from 'tickr-js';

// Create a client instance (API key is recommended for authenticated endpoints)
// You can get your API key from the Tickr API docs page: https://tickr.cc/api-docs
// Note: Pass the base URL first (default: https://tickr.cc), then the API Key.
const client = new TickrClient("https://tickr.cc", "YOUR_API_KEY");

// For public-only access, you can instantiate without arguments:
// const publicClient = new TickrClient();

async function main() {
  // Fetch all counters (authenticated)
  const counters = await client.getCounters();
  console.log(counters);

  // Create a new counter (authenticated, with privacy/read-only options)
  const newCounter = await client.createCounter({
    name: "My Counter",
    initial_value: 10,
    is_private: true,
    is_readonly: false
  });
  console.log("Created:", newCounter);

  // Fetch a public counter by slug
  const publicCounter = await client.getCounter("abc123xyz");
  console.log("Fetched:", publicCounter);

  // Increment a counter (public or private)
  const updatedCounter = await client.incrementCounter("abc123xyz", 2);
  console.log("Incremented:", updatedCounter);

  // Update a counter (authenticated, owner only)
  const updated = await client.updateCounter("abc123xyz", {
    name: "Renamed",
    current_value: 42,
    is_private: false
  });
  console.log("Updated:", updated);

  // Delete a counter (authenticated, owner only)
  await client.deleteCounter("abc123xyz");
  console.log("Deleted");
}

main();
```

## Authentication
For authenticated endpoints, obtain an API key from your Tickr.cc dashboard and pass it to the client constructor. Public endpoints do not require authentication.

> **Note:** JWT authentication is deprecated. Use API keys for all new integrations.

## Counter Properties
- `is_private`: If `true`, only authorized users can increment the counter.
- `is_readonly`: If `true`, the counter cannot be incremented by anyone on the website, but can be incremented via the API.

These properties are always included in returned counter objects.

## License
MIT

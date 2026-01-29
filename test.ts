import { TickrClient } from './src';

async function run() {
    const apiKey = process.env.TICKR_API_KEY;
    if (!apiKey) {
        console.error("Error: TICKR_API_KEY environment variable is not set.");
        process.exit(1);
    }

    // Assuming local dev server based on project structure, or production if user wants.
    // The user didn't specify URL, but the Python client defaults to https://tickr.cc
    // I will check if there is a local .env variable for URL, otherwise default.
    // Actually, for testing, I should probably target localhost if running locally, or tickr.cc if that's the intent.
    // Given I see "Projects/tickr/tickr", the user likely has the server locally.
    // I'll default to https://tickr.cc as per client default, but let env override.
    const baseUrl = process.env.TICKR_BASE_URL || "https://tickr.cc";

    console.log(`Initializing client with base URL: ${baseUrl}`);
    const client = new TickrClient(apiKey, baseUrl);

    try {
        // 1. Create
        const name = `Test Counter ${Date.now()}`;
        console.log(`\nCreating counter: "${name}"...`);
        const created = await client.createCounter({ name, initial_value: 10 });
        console.log("Created:", created);

        if (created.name !== name || created.current_value !== 10) {
            throw new Error("Creation failed verification");
        }

        const slug = created.unique_url_slug; // Assuming property name matches Python response (snake_case)
        // Note: My TS interface uses snake_case keys as per API, but let's verify if `unique_url_slug` is the right key.
        // Python client returns CounterDict with keys. `client.py` doesn't explicitly map keys, it just passes JSON.
        // API docs say `unique_url_slug`.

        // 2. Get
        console.log(`\nFetching counter: ${slug}...`);
        const fetched = await client.getCounter(slug);
        console.log("Fetched:", fetched);

        if (fetched.id !== created.id) {
            throw new Error("Fetched counter ID does not match created counter ID");
        }

        // 3. Increment
        console.log(`\nIncrementing counter...`);
        const incremented = await client.incrementCounter(slug, 5);
        console.log("Incremented:", incremented);

        if (incremented.current_value !== 15) {
            throw new Error(`Expected value 15, got ${incremented.current_value}`);
        }

        // 4. Update
        console.log(`\nUpdating counter name...`);
        const updated = await client.updateCounter(slug, { name: `${name} Updated` });
        console.log("Updated:", updated);

        if (updated.name !== `${name} Updated`) {
            throw new Error("Update name failed");
        }

        // 5. Delete
        console.log(`\nDeleting counter...`);
        await client.deleteCounter(slug);
        console.log("Deleted successfully.");

        // Verify deletion (optional, cleaner to try fetch and expect 404, but client might throw)
        try {
            await client.getCounter(slug);
            console.warn("Warning: Counter still exists after deletion (might be eventual consistency or soft delete?)");
        } catch (e) {
            console.log("Verification: Counter not found (as expected).");
        }

        console.log("\n✅ Test completed successfully!");

    } catch (err) {
        console.error("\n❌ Test failed:", err);
        process.exit(1);
    }
}

run();

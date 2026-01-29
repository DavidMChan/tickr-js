export interface Counter {
    slug: string;
    name: string;
    current_value: number;
    initial_value: number;
    is_private: boolean;
    is_readonly: boolean;
    owner_id: string;
    created_at: string;
    updated_at: string;
    [key: string]: any;
}

export interface CreateCounterArgs {
    name: string;
    initial_value?: number;
    is_private?: boolean;
    is_readonly?: boolean;
}

export interface UpdateCounterArgs {
    name?: string;
    current_value?: number;
    is_private?: boolean;
    is_readonly?: boolean;
}

export class TickrClient {
    private baseUrl: string;
    private apiKey?: string;

    constructor(apiKey?: string, baseUrl: string = "https://tickr.cc") {
        this.baseUrl = baseUrl.replace(/\/$/, "");
        this.apiKey = apiKey;
    }

    private get headers(): Record<string, string> {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };
        if (this.apiKey) {
            headers["Authorization"] = `Bearer ${this.apiKey}`;
        }
        return headers;
    }

    private async fetch<T>(path: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.baseUrl}${path}`;
        const response = await fetch(url, {
            ...options,
            headers: {
                ...this.headers,
                ...options.headers,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Tickr API Error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        // Handle empty responses (e.g. DELETE)
        if (response.status === 204) {
            return {} as T;
        }

        try {
            return await response.json() as T;
        } catch (e) {
            // Fallback for non-JSON responses
            return {} as T;
        }
    }

    private ensureFlags(counter: any): Counter {
        if (typeof counter === 'object' && counter !== null) {
            if (counter.is_private === undefined) counter.is_private = false;
            if (counter.is_readonly === undefined) counter.is_readonly = false;
            return counter as Counter;
        }
        return { is_private: false, is_readonly: false } as Counter;
    }

    /**
     * Create a new counter (authenticated).
     */
    async createCounter(args: CreateCounterArgs): Promise<Counter> {
        const { name, initial_value = 0, is_private, is_readonly } = args;
        const body: any = { name, initial_value };
        if (is_private !== undefined) body.is_private = is_private;
        if (is_readonly !== undefined) body.is_readonly = is_readonly;

        const result = await this.fetch<any>("/api/counters", {
            method: "POST",
            body: JSON.stringify(body),
        });
        return this.ensureFlags(result);
    }

    /**
     * Fetch a public counter by slug.
     */
    async getCounter(slug: string): Promise<Counter> {
        const result = await this.fetch<any>(`/api/counters/${slug}`, {
            method: "GET",
        });
        return this.ensureFlags(result);
    }

    /**
     * Fetch all counters for the authenticated user.
     */
    async getCounters(): Promise<Counter[]> {
        const result = await this.fetch<any>("/api/counters", {
            method: "GET",
        });

        if (Array.isArray(result)) {
            return result.map(c => this.ensureFlags(c));
        }
        return [this.ensureFlags(result)];
    }

    /**
     * Increment a counter by a given value (public or private).
     */
    async incrementCounter(slug: string, incrementBy: number = 1): Promise<Counter> {
        const result = await this.fetch<any>(`/api/counters/${slug}/increment`, {
            method: "POST",
            body: JSON.stringify({ increment_by: incrementBy }),
        });
        return this.ensureFlags(result);
    }

    /**
     * Update a counter's name, value, privacy, or readonly status (authenticated, owner only).
     */
    async updateCounter(slug: string, args: UpdateCounterArgs): Promise<Counter> {
        const body: any = {};
        if (args.name !== undefined) body.name = args.name;
        if (args.current_value !== undefined) body.current_value = args.current_value;
        if (args.is_private !== undefined) body.is_private = args.is_private;
        if (args.is_readonly !== undefined) body.is_readonly = args.is_readonly;

        if (Object.keys(body).length === 0) {
            throw new Error("At least one field must be provided to update.");
        }

        const result = await this.fetch<any>(`/api/counters/${slug}`, {
            method: "PUT",
            body: JSON.stringify(body),
        });
        return this.ensureFlags(result);
    }

    /**
     * Delete a counter (authenticated, owner only).
     */
    async deleteCounter(slug: string): Promise<void> {
        await this.fetch(`/api/counters/${slug}`, {
            method: "DELETE",
        });
    }
}

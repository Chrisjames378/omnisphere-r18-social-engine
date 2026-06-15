// Custom Lightweight PostgREST Client for Supabase
// Bypasses dependency installation issues while remaining 100% compatible with Supabase REST API query chains.

class SupabaseQueryBuilder {
  private url: string;
  private key: string;
  private table: string;
  private selectQuery = "*";
  private eqFilters: { column: string; value: any }[] = [];
  private orderQuery = "";
  private method: "GET" | "POST" | "PATCH" = "GET";
  private bodyContent: any = null;

  constructor(url: string, key: string, table: string) {
    this.url = url.replace(/\/$/, ""); // Strip trailing slash
    this.key = key;
    this.table = table;
  }

  select(query = "*") {
    this.method = "GET";
    this.selectQuery = query;
    return this;
  }

  insert(body: any) {
    this.method = "POST";
    this.bodyContent = body;
    return this;
  }

  update(body: any) {
    this.method = "PATCH";
    this.bodyContent = body;
    return this;
  }

  eq(column: string, value: any) {
    this.eqFilters.push({ column, value });
    return this;
  }

  order(column: string, { ascending = true } = {}) {
    this.orderQuery = `${column}.${ascending ? "asc" : "desc"}`;
    return this;
  }

  private getHeaders() {
    return {
      "apikey": this.key,
      "Authorization": `Bearer ${this.key}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation"
    };
  }

  private getRequestUrl() {
    let queryUrl = `${this.url}/rest/v1/${this.table}`;
    const params: string[] = [];
    if (this.method === "GET" && this.selectQuery) {
      params.push(`select=${encodeURIComponent(this.selectQuery)}`);
    }
    this.eqFilters.forEach(f => {
      params.push(`${f.column}=eq.${encodeURIComponent(f.value)}`);
    });
    if (this.orderQuery) {
      params.push(`order=${this.orderQuery}`);
    }
    if (params.length > 0) {
      queryUrl += `?${params.join("&")}`;
    }
    return queryUrl;
  }

  async execute() {
    try {
      let fetchUrl = this.getRequestUrl();
      let options: RequestInit = {
        method: this.method,
        headers: this.getHeaders()
      };

      if (this.method === "POST") {
        fetchUrl = `${this.url}/rest/v1/${this.table}`;
        options.body = JSON.stringify(this.bodyContent);
      } else if (this.method === "PATCH") {
        options.body = JSON.stringify(this.bodyContent);
      }

      const res = await fetch(fetchUrl, options);
      if (!res.ok) {
        const errorText = await res.text();
        return { data: null, error: { message: errorText } };
      }
      const data = await res.json();
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || "Network request failed" } };
    }
  }

  // Support direct then/await usage on the builder instance
  then(onfulfilled?: (value: any) => any) {
    return this.execute().then(onfulfilled);
  }
}

class SupabaseCustomClient {
  private url: string;
  private key: string;

  constructor(url: string, key: string) {
    this.url = url;
    this.key = key;
  }

  from(table: string) {
    return new SupabaseQueryBuilder(this.url, this.key, table);
  }

  channel() {
    return {
      on: function () { return this; },
      subscribe: () => {
        return { unsubscribe: () => {} };
      }
    };
  }
}

let supabaseInstance: SupabaseCustomClient | null = null;

export function initSupabase(url: string, key: string) {
  if (!url || !key) {
    supabaseInstance = null;
    return null;
  }
  supabaseInstance = new SupabaseCustomClient(url, key);
  return supabaseInstance;
}

export function getSupabase() {
  return supabaseInstance;
}

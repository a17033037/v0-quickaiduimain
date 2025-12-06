interface SupabaseQueryBuilder {
  select: (columns?: string) => SupabaseQueryBuilder
  insert: (data: any) => SupabaseQueryBuilder
  update: (data: any) => SupabaseQueryBuilder
  eq: (column: string, value: any) => SupabaseQueryBuilder
  order: (column: string, options?: { ascending?: boolean }) => SupabaseQueryBuilder
  single: () => SupabaseQueryBuilder
  execute: () => Promise<{ data: any; error: any }>
}

class NativeSupabaseClient {
  private url: string
  private apiKey: string
  private table = ""
  private selectColumns = "*"
  private filters: string[] = []
  private orderBy = ""
  private isSingle = false
  private method = "GET"
  private body: any = null

  constructor(url: string, apiKey: string) {
    this.url = url
    this.apiKey = apiKey
  }

  from(table: string) {
    const builder = new NativeSupabaseClient(this.url, this.apiKey)
    builder.table = table
    return builder
  }

  select(columns = "*") {
    this.selectColumns = columns
    this.method = "GET"
    return this
  }

  insert(data: any) {
    this.method = "POST"
    this.body = data
    this.selectColumns = "*"
    return this
  }

  update(data: any) {
    this.method = "PATCH"
    this.body = data
    return this
  }

  eq(column: string, value: any) {
    this.filters.push(`${column}=eq.${value}`)
    return this
  }

  order(column: string, options?: { ascending?: boolean }) {
    const direction = options?.ascending === false ? "desc" : "asc"
    this.orderBy = `&order=${column}.${direction}`
    return this
  }

  single() {
    this.isSingle = true
    return this
  }

  async execute(): Promise<{ data: any; error: any }> {
    try {
      const filterQuery = this.filters.length > 0 ? `?${this.filters.join("&")}` : ""
      const selectQuery =
        this.method === "GET" && this.selectColumns ? `?select=${this.selectColumns}${this.orderBy}` : this.orderBy
      const url = `${this.url}/rest/v1/${this.table}${filterQuery || selectQuery}`

      const headers: Record<string, string> = {
        apikey: this.apiKey,
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      }

      if (this.method === "POST") {
        headers["Prefer"] = "return=representation"
      }

      const options: RequestInit = {
        method: this.method,
        headers,
      }

      if (this.body) {
        options.body = JSON.stringify(this.body)
      }

      const response = await fetch(url, options)
      const data = await response.json()

      if (!response.ok) {
        return { data: null, error: data }
      }

      return { data: this.isSingle ? data[0] : data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }
}

// Automatically execute when methods chain ends
const handler: ProxyHandler<NativeSupabaseClient> = {
  get(target, prop) {
    const value = (target as any)[prop]
    if (typeof value === "function") {
      return (...args: any[]) => {
        const result = value.apply(target, args)
        if (result instanceof NativeSupabaseClient) {
          return new Proxy(result, handler)
        }
        return result
      }
    }
    return value
  },
}

export function createNativeClient(url: string, apiKey: string) {
  return new Proxy(new NativeSupabaseClient(url, apiKey), handler)
}

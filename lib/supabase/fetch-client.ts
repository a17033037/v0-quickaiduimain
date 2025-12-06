// Direct fetch-based Supabase client (no npm package needed)
// SERVER-SIDE ONLY - Do not import in client components

function getSupabaseCredentials() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return { supabaseUrl, supabaseKey }
}

export async function supabaseQuery<T = any>(
  table: string,
  options: {
    select?: string
    filter?: { column: string; value: any }[]
    order?: { column: string; ascending?: boolean }
    limit?: number
  } = {},
): Promise<{ data: T[] | null; error: any }> {
  try {
    const { supabaseUrl, supabaseKey } = getSupabaseCredentials()
    const select = options.select || "*"
    let url = `${supabaseUrl}/rest/v1/${table}?select=${select}`

    // Add filters
    if (options.filter) {
      options.filter.forEach(({ column, value }) => {
        url += `&${column}=eq.${value}`
      })
    }

    // Add ordering
    if (options.order) {
      const direction = options.order.ascending === false ? "desc" : "asc"
      url += `&order=${options.order.column}.${direction}`
    }

    // Add limit
    if (options.limit) {
      url += `&limit=${options.limit}`
    }

    const response = await fetch(url, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return { data, error: null }
  } catch (error) {
    console.error("[v0] Supabase query error:", error)
    return { data: null, error }
  }
}

export async function supabaseInsert<T = any>(table: string, data: any): Promise<{ data: T | null; error: any }> {
  try {
    const { supabaseUrl, supabaseKey } = getSupabaseCredentials()
    const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return { data: result[0] || result, error: null }
  } catch (error) {
    console.error("[v0] Supabase insert error:", error)
    return { data: null, error }
  }
}

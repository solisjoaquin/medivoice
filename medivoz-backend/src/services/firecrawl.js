export async function scrapeUrl(url) {
  const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`,
    },
    body: JSON.stringify({
      url,
      formats: ['markdown'],
      onlyMainContent: true,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Firecrawl error: ${err}`)
  }

  const data = await response.json()
  return data.data?.markdown || ''
}

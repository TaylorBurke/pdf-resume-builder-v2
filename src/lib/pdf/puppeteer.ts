import type { Browser } from 'puppeteer'

let browserPromise: Promise<Browser> | null = null

async function getBrowser(): Promise<Browser> {
  if (browserPromise) return browserPromise

  browserPromise = (async () => {
    if (process.env.VERCEL) {
      const chromium = await import('@sparticuz/chromium')
      const puppeteer = await import('puppeteer-core')
      return puppeteer.default.launch({
        args: chromium.default.args,
        executablePath: await chromium.default.executablePath(),
        headless: true,
      })
    }

    const puppeteer = await import('puppeteer')
    return puppeteer.default.launch({ headless: true })
  })()

  return browserPromise
}

export async function generatePdf(html: string): Promise<Buffer> {
  const browser = await getBrowser()
  const page = await browser.newPage()

  try {
    await page.setContent(html, { waitUntil: 'networkidle0' })
    const pdf = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    })
    return pdf as Buffer
  } finally {
    await page.close()
  }
}

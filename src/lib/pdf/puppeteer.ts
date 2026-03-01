import type { Browser } from 'puppeteer-core'

export async function generatePdf(html: string): Promise<Uint8Array> {
  let browser: Browser

  if (process.env.VERCEL) {
    const chromium = (await import('@sparticuz/chromium')).default
    const puppeteer = (await import('puppeteer-core')).default
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: 'shell',
    })
  } else {
    const puppeteer = (await import('puppeteer')).default
    browser = await puppeteer.launch({ headless: true }) as unknown as Browser
  }

  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    const pdf = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    })
    await page.close()
    return pdf
  } finally {
    await browser.close()
  }
}

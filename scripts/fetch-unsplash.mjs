import { createWriteStream, mkdirSync } from "fs"
import { pipeline } from "stream/promises"
import { get as httpsGet } from "https"

const KEY = "JljrgCgZ5LYP5e6HhZhKEJbpNIdJg55zjrvTUH1uG28"

const NEIGHBORHOODS = [
  { slug: "alfama",         query: "Alfama Lisbon neighbourhood street" },
  { slug: "shimokitazawa",  query: "Shimokitazawa Tokyo alley" },
  { slug: "roma-norte",     query: "Roma Norte Mexico City street neighbourhood" },
  { slug: "croix-rousse",   query: "Croix-Rousse Lyon street" },
  { slug: "sacred-valley",  query: "Sacred Valley Peru Andean village" },
  { slug: "yeonnam-dong",   query: "Yeonnam-dong Seoul neighbourhood cafe" },
  { slug: "pigneto",        query: "Pigneto Rome neighbourhood street" },
  { slug: "hauz-khas",      query: "Hauz Khas Delhi neighbourhood" },
  { slug: "le-marais",      query: "Le Marais Paris street neighbourhood" },
  { slug: "williamsburg",   query: "Williamsburg Brooklyn New York street" },
  { slug: "fushimi",        query: "Fushimi Inari Kyoto torii gates" },
  { slug: "paarel",         query: "Paarl Cape Town winelands vineyard" },
]

const SITE_PHOTOS = [
  { slug: "hero-bali",     query: "Bali rice terraces landscape",           orientation: "landscape" },
  { slug: "alentejo",      query: "Alentejo Portugal countryside village",  orientation: "landscape" },
  { slug: "kyoto",         query: "Kyoto Japan traditional street",         orientation: "landscape" },
  { slug: "marrakech",     query: "Marrakech Morocco medina rooftop",       orientation: "landscape" },
  { slug: "sacred-valley-hero", query: "Sacred Valley Peru mountains",     orientation: "landscape" },
]

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    httpsGet(url, { headers: { Authorization: `Client-ID ${KEY}` } }, (res) => {
      let data = ""
      res.on("data", (c) => (data += c))
      res.on("end", () => resolve(JSON.parse(data)))
      res.on("error", reject)
    }).on("error", reject)
  })
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest)
    httpsGet(url, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        httpsGet(res.headers.location, (res2) => {
          pipeline(res2, file).then(resolve).catch(reject)
        }).on("error", reject)
      } else {
        pipeline(res, file).then(resolve).catch(reject)
      }
    }).on("error", reject)
  })
}

async function fetchPhoto(query, orientation = "portrait") {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=3&orientation=${orientation}&content_filter=high`
  const data = await fetchJson(url)
  if (!data.results?.length) throw new Error(`No results for: ${query}`)
  return data.results[0]
}

mkdirSync("public/neighborhoods", { recursive: true })

console.log("Fetching neighborhood photos…")
for (const n of NEIGHBORHOODS) {
  try {
    const photo = await fetchPhoto(n.query, "portrait")
    const imgUrl = photo.urls.regular
    const dest = `public/neighborhoods/${n.slug}.jpg`
    await downloadFile(imgUrl, dest)
    console.log(`✓  ${n.slug}  (${photo.user.name} on Unsplash)`)
  } catch (e) {
    console.error(`✗  ${n.slug}: ${e.message}`)
  }
}

console.log("\nFetching site hero/destination photos…")
for (const p of SITE_PHOTOS) {
  try {
    const photo = await fetchPhoto(p.query, p.orientation)
    const imgUrl = photo.urls.full
    const dest = `public/${p.slug}.jpg`
    await downloadFile(imgUrl, dest)
    console.log(`✓  ${p.slug}  (${photo.user.name} on Unsplash)`)
  } catch (e) {
    console.error(`✗  ${p.slug}: ${e.message}`)
  }
}

console.log("\nDone.")

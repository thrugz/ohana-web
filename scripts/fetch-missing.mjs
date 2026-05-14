import { createWriteStream, mkdirSync } from "fs"
import { pipeline } from "stream/promises"
import { get as httpsGet } from "https"

const KEY = "JljrgCgZ5LYP5e6HhZhKEJbpNIdJg55zjrvTUH1uG28"

const MISSING = [
  { slug: "roma-norte",   query: "Mexico City Condesa colonia street" },
  { slug: "yeonnam-dong", query: "Seoul Korea street neighbourhood alley" },
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
    function doGet(u) {
      httpsGet(u, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          doGet(res.headers.location)
        } else {
          pipeline(res, file).then(resolve).catch(reject)
        }
      }).on("error", reject)
    }
    doGet(url)
  })
}

mkdirSync("public/neighborhoods", { recursive: true })

for (const n of MISSING) {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(n.query)}&per_page=3&orientation=portrait&content_filter=high`
  const data = await fetchJson(url)
  if (!data.results?.length) { console.error(`✗ ${n.slug}: still no results`); continue }
  const photo = data.results[0]
  await downloadFile(photo.urls.regular, `public/neighborhoods/${n.slug}.jpg`)
  console.log(`✓  ${n.slug}  (${photo.user.name})`)
}

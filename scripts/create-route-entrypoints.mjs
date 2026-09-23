import { copyFile, mkdir } from 'node:fs/promises'
import { siteRoutes } from '../src/siteRoutes.js'

const output = new URL('../dist/', import.meta.url)
const index = new URL('index.html', output)

for (const { path } of siteRoutes) {
  if (path === '/') continue
  const directory = new URL(`${path.slice(1)}/`, output)
  await mkdir(directory, { recursive: true })
  await copyFile(index, new URL('index.html', directory))
}

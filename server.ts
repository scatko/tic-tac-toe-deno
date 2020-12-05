import { serve } from "https://deno.land/std/http/server.ts"
import { serveFile } from "https://deno.land/std/http/file_server.ts"

// Bundling client
const CLIENT_MOUNT_PATH = "client/app.ts"
const CLIENT_SRC_PATH = "client/src"
const DIST_PATH = "dist"
const CLIENT_DIST_PATH = `${DIST_PATH}/bundle.js`
const INDEX_SOURCE_PATH = "client/index.html"
const INDEX_DIST_PATH = `${DIST_PATH}/index.html`
const NOT_FOUND_SOURCE_PATH = "client/404.html"
const NOT_FOUND_DIST_PATH = `${DIST_PATH}/404.html`
const STYLE_SOURCE_PATH = "client/src/app.css"
const STYLE_DIST_PATH = `${DIST_PATH}/style.css`

async function dirExists(path: string) {
  try {
    const stats = await Deno.lstat(path)
    return stats && stats.isDirectory
  } catch (error) {
    if (error && error instanceof Deno.errors.NotFound) {
      return false
    } else {
      throw error
    }
  }
}

async function build() {
  const [diagnostics, emit] = await Deno.bundle(CLIENT_MOUNT_PATH)
  await Deno.remove(DIST_PATH, { recursive: true })
  await Deno.mkdir(DIST_PATH)
  await Deno.writeTextFile(CLIENT_DIST_PATH, emit)
  await Deno.copyFile(INDEX_SOURCE_PATH, INDEX_DIST_PATH)
  await Deno.copyFile(NOT_FOUND_SOURCE_PATH, NOT_FOUND_DIST_PATH)
  await Deno.copyFile(STYLE_SOURCE_PATH, STYLE_DIST_PATH)

  console.log("bundle rebuild")
}

await build()

function makeFullPath(path: string) {
  return `${Deno.cwd()}/${path}`
}

// watch files changes
const paths = [CLIENT_SRC_PATH, CLIENT_MOUNT_PATH, INDEX_SOURCE_PATH].map(makeFullPath)
console.log(`watching changes: ${paths}`)

const watcher = Deno.watchFs(paths)

async function watch() {
  for await (const event of watcher) {
    console.log(`>>> ${event.kind}: ${event.paths}`)
    await build()
  }
}

watch()

// Running server
const DEFAULT_HTTP_PORT = 8080

const port = Number(Deno.args[0]) || DEFAULT_HTTP_PORT
const server = serve({ hostname: "0.0.0.0", port })
console.log(`HTTP webserver running. Access it at: http://localhost:${port}/`)

async function fileExists(path: string) {
  try {
    const stats = await Deno.lstat(path)
    return stats && stats.isFile
  } catch (error) {
    if (error && error instanceof Deno.errors.NotFound) {
      return false
    } else {
      throw error
    }
  }
}

const notFoundPath = `${Deno.cwd()}/${NOT_FOUND_DIST_PATH}`

for await (const request of server) {
  const path = `${Deno.cwd()}/${DIST_PATH}${request.url}`

  // logging
  const date = new Date()
  console.log(`${date.toISOString()} - ${request.method} ${request.url}`)

  if (request.url === "/") {
    const content = await serveFile(request, `${Deno.cwd()}/${INDEX_DIST_PATH}`)
    request.respond(content)
    continue
  }

  // TODO Implement API end points here
  if (request.url.slice(0, 4) === "/api") {
    const endpoint = request.url.slice(4)
    request.respond({ status: 200, body: `some respond from api: ${endpoint}` })
    continue
  }

  // static files
  if (await fileExists(path)) {
    const content = await serveFile(request, path)
    request.respond(content)
    continue
  } else {
    // 404
    const notFoundContent = await serveFile(request, notFoundPath)
    request.respond(notFoundContent)
  }
}

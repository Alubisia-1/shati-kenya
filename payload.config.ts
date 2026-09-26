import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Products } from './src/collections/Products'
import { Media } from './src/collections/Media'
import { Issues } from './src/collections/Issues'
import { Shows } from './src/collections/Shows'
import { Episodes } from './src/collections/Episodes'
import { Articles } from './src/collections/Articles'
import { Counties } from './src/collections/Counties'
import { DeliveryRates } from './src/collections/DeliveryRates'
import { Members } from './src/collections/Members'
import { StockMovements } from './src/collections/StockMovements'
import { LeagueSnapshots } from './src/collections/LeagueSnapshots'
import { Users } from './src/collections/Users'
import { Stock } from './src/collections/Stock'
import { OrderEvents } from './src/collections/OrderEvents'
import { FPLCache } from './src/collections/FPLCache'
import { Settings } from './src/globals/Settings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: { user: 'users', importMap: { baseDir: dirname, importMapFile: path.resolve(dirname, 'app/(payload)/admin/importMap.ts') }, components: { beforeNavLinks: ['/src/components/admin/StockCounterLink#StockCounterLink'], views: { stockCounter: { Component: '/src/components/admin/StockCounter#StockCounter', path: '/stock-counter' } } } },
  collections: [Users, Products, Media, Issues, Shows, Episodes, Articles, Counties, DeliveryRates, Members, Stock, StockMovements, OrderEvents, LeagueSnapshots, FPLCache],
  globals: [Settings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'development-secret-change-before-deploy',
  typescript: { outputFile: path.resolve(dirname, 'src/payload-types.ts') },
  db: postgresAdapter({ pool: { connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/shati' } }),
  plugins: [vercelBlobStorage({ enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN), token: process.env.BLOB_READ_WRITE_TOKEN, clientUploads: true, collections: { media: true } })],
  sharp: undefined,
  upload: { limits: { fileSize: 12_000_000 } },
})

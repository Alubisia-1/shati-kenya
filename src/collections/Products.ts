import type { CollectionConfig } from 'payload'
export const Products: CollectionConfig = {
  slug: 'products', admin: { useAsTitle: 'name', defaultColumns: ['name', 'category', 'price', 'archived'] }, access: { read: () => true, create: ({ req }) => Boolean(req.user), update: ({ req }) => Boolean(req.user), delete: ({ req }) => Boolean(req.user) },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'category', type: 'select', required: true, options: ['Shirts', 'Quarter-zips', 'Linen pants', 'Caps', 'Official and events'] },
    { name: 'price', type: 'number', required: true, min: 0 },
    { name: 'description', type: 'textarea' }, { name: 'fabricCare', type: 'textarea' }, { name: 'fitNotes', type: 'textarea' },
    { name: 'gallery', type: 'upload', relationTo: 'media', hasMany: true },
    { name: 'runSize', type: 'number', min: 0 },
    { name: 'sizes', type: 'array', required: true, fields: [{ name: 'size', type: 'select', required: true, options: ['S', 'M', 'L', 'XL', 'XXL'] }, { name: 'count', type: 'number', required: true, min: 0, defaultValue: 0 }] },
    { name: 'sizeChart', type: 'array', fields: [{ name: 'size', type: 'select', options: ['S','M','L','XL','XXL'] }, { name: 'chest', type: 'text' }, { name: 'body', type: 'text' }, { name: 'sleeve', type: 'text' }] },
    { name: 'archived', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    { name: 'relatedEpisode', type: 'relationship', relationTo: 'episodes' },
  ],
  hooks: {
    beforeChange: [({ data, originalDoc }) => { if (!data.slug && (data.name || originalDoc?.name)) data.slug = String(data.name || originalDoc.name).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); const total = (data.sizes || originalDoc?.sizes || []).reduce((n: number, s: { count?: number }) => n + (s.count || 0), 0); data.archived = total === 0; return data }],
    afterChange: [async ({ doc, operation, req }) => {
      if (operation !== 'create') return doc
      const existing = await req.payload.find({ collection: 'stock', where: { product: { equals: doc.id } }, limit: 1, overrideAccess: true })
      if (existing.docs.length) return doc
      const values = new Map((doc.sizes || []).map((row: { size: string; count: number }) => [row.size, row.count]))
      for (const size of ['S','M','L','XL','XXL']) await req.payload.create({ collection: 'stock', overrideAccess: true, data: { product: doc.id, size, count: Number(values.get(size) || 0) } })
      return doc
    }],
  },
}

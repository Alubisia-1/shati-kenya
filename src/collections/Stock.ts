import type { CollectionConfig } from 'payload'
export const Stock: CollectionConfig = {
  slug: 'stock', admin: { useAsTitle: 'label', defaultColumns: ['product', 'size', 'count', 'updatedAt'] }, indexes: [{ fields: ['product', 'size'], unique: true }],
  access: { read: () => true, create: ({ req }) => Boolean(req.user), update: ({ req }) => Boolean(req.user), delete: ({ req }) => Boolean(req.user) },
  fields: [{ name: 'label', type: 'text', admin: { hidden: true } }, { name: 'product', type: 'relationship', relationTo: 'products', required: true, index: true }, { name: 'size', type: 'select', required: true, options: ['S','M','L','XL','XXL'] }, { name: 'count', type: 'number', required: true, min: 0, defaultValue: 0 }, { name: 'updatedAt', type: 'date' }],
  hooks: {
    beforeChange: [({ data }) => { data.label = `${data.size || ''} stock`; data.updatedAt = new Date().toISOString(); return data }],
    afterChange: [async ({ doc, previousDoc, req }) => {
      const productId = typeof doc.product === 'object' ? doc.product.id : doc.product
      if (!productId) return doc
      if (previousDoc && Number(previousDoc.count) !== Number(doc.count)) {
        await req.payload.create({ collection: 'stock-movements', overrideAccess: true, data: { product: productId, size: doc.size, delta: Number(doc.count) - Number(previousDoc.count), note: 'Counter adjustment' } })
      }
      const rows = await req.payload.find({ collection: 'stock', where: { product: { equals: productId } }, limit: 20, overrideAccess: true })
      const sizes = (['S', 'M', 'L', 'XL', 'XXL'] as const).map((size) => ({ size, count: Number(rows.docs.find((r) => r.size === size)?.count || 0) }))
      await req.payload.update({ collection: 'products', id: productId, data: { sizes, archived: sizes.every((s) => s.count === 0) }, overrideAccess: true })
      return doc
    }],
  },
}

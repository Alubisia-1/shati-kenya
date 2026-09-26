import type { CollectionConfig } from 'payload'
export const Users: CollectionConfig = { slug: 'users', auth: true, admin: { useAsTitle: 'email' }, access: { read: ({ req }) => Boolean(req.user), create: () => false, update: ({ req }) => Boolean(req.user), delete: ({ req }) => Boolean(req.user) }, fields: [] }

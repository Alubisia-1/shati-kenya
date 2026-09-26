import 'dotenv/config'
import config from '../payload.config'
import { getPayload } from 'payload'
const [email,password]=process.argv.slice(2)
if(!email||!password){console.error('Usage: npm run admin:create -- <email> <password>');process.exit(1)}
const payload=await getPayload({config})
const existing=await payload.find({collection:'users',where:{email:{equals:email}},limit:1,overrideAccess:true})
if(existing.docs.length){console.error('That admin account already exists.');process.exit(1)}
await payload.create({collection:'users',overrideAccess:true,data:{email,password}})
console.log(`Created admin user ${email}`)
process.exit(0)

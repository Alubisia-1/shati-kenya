import { notFound } from 'next/navigation'
import { getCMS } from '@/src/lib/payload'
import { MemberManage } from '@/src/components/client/MemberManage'
export const dynamic='force-dynamic'
export default async function ManagePage({params}:{params:Promise<{code:string}>}){const {code}=await params;let member:any;try{const cms=await getCMS();const result=await cms.find({collection:'members',where:{publicCode:{equals:code}},limit:1,depth:1,overrideAccess:true});member=result.docs[0]}catch{}if(!member)notFound();return <div className="wrap"><section className="subhero"><span className="eyebrow">SHATI county league · Private link</span><h1 className="page-title">Your entry.</h1></section><MemberManage member={member} code={code}/></div>}

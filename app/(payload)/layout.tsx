import type { Metadata } from 'next'
import config from '@payload-config'
import { RootLayout, handleServerFunctions } from '@payloadcms/next/layouts'
import { importMap } from './admin/importMap'
import '@payloadcms/next/css'
export const metadata:Metadata={title:'SHATI Admin'}
export default function PayloadLayout({children}:{children:React.ReactNode}){return RootLayout({children,config,importMap,serverFunction:(args)=>handleServerFunctions({...args,config,importMap})})}

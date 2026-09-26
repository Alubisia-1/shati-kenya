import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import { StockCounterClient } from './StockCounterClient'
export function StockCounter(props:AdminViewServerProps){return <DefaultTemplate {...props} visibleEntities={props.visibleEntities||{collections:[],globals:[]}}><Gutter><StockCounterClient/></Gutter></DefaultTemplate>}

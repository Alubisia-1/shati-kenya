import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'node:crypto'
import sharp from 'sharp'
import { getCMS } from '@/src/lib/payload'

export const runtime = 'nodejs'
export const maxDuration = 300
const pause = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const supplied = request.headers.get('authorization') || ''
  const expected = `Bearer ${secret}`
  return supplied.length === expected.length && timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))
}

async function cachedFPL(cms: any, url: string) {
  const found = await cms.find({ collection: 'fpl-cache', where: { url: { equals: url } }, limit: 1, overrideAccess: true })
  const cached = found.docs[0]
  if (cached && Date.now() - new Date(cached.fetchedAt).getTime() < 8 * 60 * 1000) return cached.response
  try {
    const response = await fetch(url, { headers: { 'user-agent': 'SHATI County League/1.0' }, next: { revalidate: 0 } })
    if (!response.ok) throw new Error(`FPL returned ${response.status}`)
    const data = await response.json()
    const update = { response: data, fetchedAt: new Date().toISOString() }
    if (cached) await cms.update({ collection: 'fpl-cache', id: cached.id, data: update, overrideAccess: true })
    else await cms.create({ collection: 'fpl-cache', data: { url, ...update }, overrideAccess: true })
    return data
  } catch (error) {
    throw error
  }
}

function relId(value: any) { return String(typeof value === 'object' ? value?.id || '' : value || '') }
function relName(value: any) { return typeof value === 'object' ? value?.name || '' : '' }
function escapeXML(value: unknown) { return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c] as string)) }

async function renderTableImage(cms: any, gameweek: number, rows: any[]) {
  const displayRows = rows.slice(0, 15)
  const body = displayRows.map((row, index) => {
    const y = 390 + index * 56
    return `<text x="68" y="${y}" class="rank">${String(index + 1).padStart(2, '0')}</text><text x="152" y="${y}" class="name">${escapeXML(row.name)}</text><text x="790" y="${y}" class="score">${row.gameweekPoints ?? '—'}</text><text x="990" y="${y}" class="score">${row.totalPoints ?? '—'}</text><path d="M64 ${y + 20}H1016" class="rule"/>`
  }).join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350"><rect width="1080" height="1350" fill="#F2ECDF"/><rect x="0" y="0" width="1080" height="15" fill="#7A2230"/><text x="64" y="100" class="eyebrow">SHATI · NAIROBI COUNTY LEAGUE</text><text x="64" y="224" class="title">COUNTY TABLE</text><text x="67" y="286" class="sub">GAMEWEEK ${gameweek} · FREE TO JOIN</text><path d="M64 320H1016" class="heavy"/><text x="64" y="360" class="eyebrow">RANK</text><text x="152" y="360" class="eyebrow">COUNTY</text><text x="790" y="360" class="eyebrow">GW</text><text x="990" y="360" class="eyebrow">TOTAL</text>${body}<text x="64" y="1250" class="note">Five managers make a county squad. No prizes. No purchase required.</text><text x="64" y="1290" class="note">SHATIKENYA.COM · REPRESENT YOUR COUNTY.</text><style>.eyebrow{font:700 18px Archivo,Arial,sans-serif;letter-spacing:4px;fill:#7A2230}.title{font:104px Anton,Impact,sans-serif;fill:#161114}.sub{font:500 22px Archivo,Arial,sans-serif;letter-spacing:3px;fill:#585351}.heavy{stroke:#161114;stroke-width:2}.rule{stroke:#CAC5BB;stroke-width:1}.rank{font:20px Archivo,Arial,sans-serif;fill:#585351}.name{font:600 24px Archivo,Arial,sans-serif;fill:#161114}.score{font:600 21px Archivo,Arial,sans-serif;text-anchor:end;fill:#161114}.note{font:16px Archivo,Arial,sans-serif;fill:#585351}</style></svg>`
  const png = await sharp(Buffer.from(svg)).png().toBuffer()
  const existing = await cms.find({ collection: 'media', where: { filename: { equals: `shati-county-table-gw-${gameweek}.png` } }, limit: 1, overrideAccess: true })
  if (existing.docs[0]) return existing.docs[0].id
  const media = await cms.create({ collection: 'media', data: { alt: `SHATI county standings, gameweek ${gameweek}` }, file: { data: png, mimetype: 'image/png', name: `shati-county-table-gw-${gameweek}.png`, size: png.byteLength }, overrideAccess: true })
  return media.id
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const cms = await getCMS()
    const [bootstrap, fixtures, memberResult] = await Promise.all([
      cachedFPL(cms, 'https://fantasy.premierleague.com/api/bootstrap-static/'),
      cachedFPL(cms, 'https://fantasy.premierleague.com/api/fixtures/'),
      cms.find({ collection: 'members', where: { active: { equals: true } }, depth: 1, limit: 5000, overrideAccess: true }),
    ])
    const now = new Date()
    const event = (bootstrap.events || []).find((item: any) => item.is_current) || (bootstrap.events || []).find((item: any) => item.is_next)
    if (!event) return NextResponse.json({ error: 'No current gameweek in the FPL feed.' }, { status: 503 })
    const eventFixtures = (fixtures || []).filter((item: any) => item.event === event.id && !item.finished)
    const matchDay = eventFixtures.some((item: any) => item.kickoff_time ? new Date(item.kickoff_time).toDateString() === now.toDateString() : item.started)
    if (!matchDay && now.getMinutes() >= 30) return NextResponse.json({ ok: true, skipped: 'Hourly schedule outside match days' })

    const members = memberResult.docs as any[]
    const snapshots = await cms.find({ collection: 'league-snapshots', where: { gameweek: { equals: event.id } }, limit: 1, overrideAccess: true })
    const existing = snapshots.docs[0] as any
    const managerOld = Array.isArray(existing?.managerTable) ? existing.managerTable : []
    const oldRanks = new Map<string, number>(managerOld.map((row: any): [string, number] => [String(row.id), Number(row.rank)]))
    const rows: any[] = []
    for (const member of members) {
      await pause(110)
      try {
        const entry = await cachedFPL(cms, `https://fantasy.premierleague.com/api/entry/${member.fplTeamId}/`)
        await pause(110)
        const history = await cachedFPL(cms, `https://fantasy.premierleague.com/api/entry/${member.fplTeamId}/history/`)
        const gw = (history.current || []).find((item: any) => item.event === event.id)
        rows.push({
          id: String(member.id), name: `${entry.player_first_name || ''} ${entry.player_last_name || ''}`.trim() || entry.name || 'FPL manager',
          teamName: entry.name || 'FPL team', countyId: relId(member.county), county: relName(member.county),
          gameweekPoints: Number(gw?.points || 0), totalPoints: Number(entry.summary_overall_points || gw?.total_points || 0),
          overallRank: Number(gw?.overall_rank || entry.summary_overall_rank || 0),
        })
      } catch { /* retain last good table below when one or more upstream requests fail */ }
    }
    if (rows.length !== members.length) return NextResponse.json({ ok: true, stale: true, updatedAt: existing?.updatedAt || null, message: 'Partial FPL fetch; last complete standings retained.' })
    const lockedScores: Record<string,{gameweekPoints:number;totalPoints:number}> = { ...(existing?.lockedScores || {}) }
    if (event.finished && !Object.keys(lockedScores).length) for (const row of rows) lockedScores[row.id] = { gameweekPoints: row.gameweekPoints, totalPoints: row.totalPoints }
    if (Object.keys(lockedScores).length) for (const row of rows) if (lockedScores[row.id]) { row.gameweekPoints = lockedScores[row.id].gameweekPoints; row.totalPoints = lockedScores[row.id].totalPoints }
    const managerTable = [...rows].sort((a, b) => b.totalPoints - a.totalPoints).map((row, index) => {
      const prior = oldRanks.get(row.id)
      return { ...row, rank: index + 1, subline: `${row.county} · ${row.teamName}`, movement: prior == null ? 'same' : prior > index + 1 ? 'up' : prior < index + 1 ? 'down' : 'same' }
    })

    const lockedSquads: any = { ...(existing?.lockedSquads || {}) }
    if (event.deadline_passed && !lockedSquads[event.id]) {
      const groups = new Map<string, any[]>()
      for (const row of rows) { const group = groups.get(row.countyId) || []; group.push(row); groups.set(row.countyId, group) }
      lockedSquads[event.id] = {}
      for (const [county, group] of groups) {
        group.sort((a, b) => (a.overallRank || Number.MAX_SAFE_INTEGER) - (b.overallRank || Number.MAX_SAFE_INTEGER) || b.totalPoints - a.totalPoints)
        lockedSquads[event.id][county] = group.slice(0, 5).map(row => row.id)
      }
    }
    const [countyResult, oldSnapshots] = await Promise.all([
      cms.find({ collection: 'counties', sort: 'name', limit: 50, overrideAccess: true }),
      cms.find({ collection: 'league-snapshots', where: { gameweek: { less_than: event.id } }, sort: '-gameweek', limit: 100, overrideAccess: true }),
    ])
    const historySnapshots = (oldSnapshots.docs as any[]).reverse()
    const previousCountyRows = historySnapshots.flatMap(snapshot => Array.isArray(snapshot.countyTable) ? snapshot.countyTable : [])
    const rankBefore = new Map<string, number>((Array.isArray(historySnapshots.at(-1)?.countyTable) ? historySnapshots.at(-1).countyTable : []).map((row: any): [string, number] => [String(row.countyId), Number(row.rank)]))
    const countyTable = (countyResult.docs as any[]).map(county => {
      const all = rows.filter(row => row.countyId === String(county.id))
      const locked = lockedSquads[event.id]?.[String(county.id)]
      const squad = locked ? locked.map((id: string) => rows.find(row => row.id === id)).filter(Boolean) : [...all].sort((a, b) => (a.overallRank || Number.MAX_SAFE_INTEGER) - (b.overallRank || Number.MAX_SAFE_INTEGER)).slice(0, 5)
      const complete = all.length >= 5 && squad.length === 5
      const gameweekPoints = complete ? Math.round(squad.reduce((sum: number, row: any) => sum + row.gameweekPoints, 0) / 5 * 100) / 100 : null
      const seasonPoints = complete && gameweekPoints !== null ? Math.round((gameweekPoints + previousCountyRows.filter((row: any) => row.countyId === String(county.id)).reduce((sum: number, row: any) => sum + Number(row.gameweekPoints || 0), 0)) * 100) / 100 : null
      return { countyId: String(county.id), name: county.name, rank: 0, subline: complete ? `Squad of five · ${all.length} managers` : `Needs a squad · ${all.length} managers`, managerCount: all.length, needsSquad: !complete, gameweekPoints, totalPoints: seasonPoints, movement: 'same', recruitMessage: `Join the free SHATI County League and help ${county.name} build a squad of five. No purchase needed.` }
    }).sort((a: any, b: any) => (b.totalPoints ?? -1) - (a.totalPoints ?? -1)).map((row: any, index: number) => ({ ...row, rank: index + 1, movement: rankBefore.has(row.countyId) ? Number(rankBefore.get(row.countyId)) > index + 1 ? 'up' : Number(rankBefore.get(row.countyId)) < index + 1 ? 'down' : 'same' : 'same' }))
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
    const monthly = historySnapshots.filter(snapshot => new Date(snapshot.updatedAt).getTime() >= monthStart).flatMap(snapshot => Array.isArray(snapshot.countyTable) ? snapshot.countyTable : [])
    const monthTable = countyTable.map(row => {
      const monthPoints = monthly.filter(old => old.countyId === row.countyId).reduce((sum, old) => sum + Number(old.gameweekPoints || 0), Number(row.gameweekPoints || 0))
      return { ...row, gameweekPoints: Math.round(monthPoints * 100) / 100 }
    }).sort((a, b) => (b.gameweekPoints ?? -1) - (a.gameweekPoints ?? -1)).map((row, index) => ({ ...row, rank: index + 1 }))
    const copyText = `SHATI COUNTY TABLE · GW ${event.id}\n${countyTable.map(row => `${row.rank}. ${row.name} — ${row.gameweekPoints ?? 'Needs a squad'} GW · ${row.totalPoints ?? '—'} total`).join('\n')}`
    const data = { label: `GW ${event.id}`, gameweek: event.id, updatedAt: new Date().toISOString(), managerTable, countyTable, monthTable, lockedSquads, lockedScores, copyText }
    const saved = existing ? await cms.update({ collection: 'league-snapshots', id: existing.id, data, overrideAccess: true }) : await cms.create({ collection: 'league-snapshots', data, overrideAccess: true })
    for (const row of managerTable) {
      const member = members.find(item => String(item.id) === row.id)
      if (member && (member.lastPoints !== row.totalPoints || member.lastRank !== row.rank)) await cms.update({ collection: 'members', id: member.id, data: { lastPoints: row.totalPoints, lastRank: row.rank }, overrideAccess: true })
    }
    if (event.finished && !saved.tableImage) {
      try { const tableImage = await renderTableImage(cms, event.id, countyTable); await cms.update({ collection: 'league-snapshots', id: saved.id, data: { tableImage }, overrideAccess: true }) }
      catch (error) { console.error('County table image render failed', error) }
    }
    return NextResponse.json({ ok: true, gameweek: event.id, members: rows.length, updatedAt: data.updatedAt })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'League refresh failed. The last saved table remains available.' }, { status: 502 })
  }
}

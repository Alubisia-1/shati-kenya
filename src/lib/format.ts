export const formatKES = (value: number | null | undefined) => Number(value) > 0 ? `KES ${Number(value).toLocaleString('en-KE')}` : 'Price on request'

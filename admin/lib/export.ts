type CsvValue = string | number | boolean | null | undefined

interface CsvColumn<T> {
  header: string
  value: (row: T) => CsvValue
}

function escapeCsvValue(value: CsvValue): string {
  const normalized = value === null || value === undefined ? '' : String(value)
  return `"${normalized.replace(/"/g, '""')}"`
}

export function exportRowsToCsv<T>(
  filename: string,
  columns: CsvColumn<T>[],
  rows: T[]
) {
  const headerLine = columns.map((column) => escapeCsvValue(column.header)).join(';')
  const dataLines = rows.map((row) =>
    columns.map((column) => escapeCsvValue(column.value(row))).join(';')
  )
  const csv = ['\uFEFF' + headerLine, ...dataLines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

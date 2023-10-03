import loveCode from '@nerdbond/love-code'
import { toPascalCase } from '~/code/tool/helper'
import { BaseType } from '~/code/type/base'
import { SchemaPropertyContainerType } from '~/code/type/schema'

export default async function handle({ base }: { base: BaseType }) {
  const list: Array<string> = []

  for (const name in base) {
    list.push(``)
    handleOne({ name, base }).forEach(line => {
      list.push(line)
    })
  }

  const text = await loveCode(list.join('\n'))
  return text
}

export function handleOne({
  name,
  base,
}: {
  name: string
  base: BaseType
}) {
  const list: Array<string> = []
  const schema = base[name]

  list.push(`export type ${toPascalCase(name)}Type = {`)
  handleEachProperty({ base, schema }).forEach(line => {
    list.push(`  ${line}`)
  })
  list.push(`}`)

  return list
}

export function handleEachProperty({
  base,
  schema,
  path = [],
}: {
  base: BaseType
  schema: SchemaPropertyContainerType
  path?: Array<string>
}) {
  const list: Array<string> = []
  for (const name in schema.property) {
    const property = schema.property[name]
    const field = path.concat([name]).join('__')
    switch (property.type) {
      case 'timestamp':
        list.push(`${field}?: Date`)
        break
      case 'text':
      case 'uuid':
        list.push(`${field}?: string`)
        break
      case 'integer':
      case 'decimal':
        list.push(`${field}?: number`)
        break
      case 'boolean':
        list.push(`${field}?: boolean`)
        break
      case 'json':
        list.push(`${field}?: object`)
        break
      case 'object':
        handleEachProperty({
          base,
          schema: property,
          path: path.concat([name]),
        }).forEach(line => {
          list.push(`${line}`)
        })
        break
      case 'record':
        list.push(`${path.concat([name, 'id']).join('__')}?: string`)
        list.push(
          `  ${path.concat([name, 'type']).join('__')}?: string`,
        )
        break
      default:
        if (property.reference && !property.list) {
          list.push(
            `  ${path.concat([name, 'id']).join('__')}?: string`,
          )
        }
    }
  }

  return list
}
import * as z from 'zod'
import { ConfigSchema } from './cli/schema'

const jsonSchema = z.toJSONSchema(ConfigSchema, { target: 'draft-2020-12' })
await Bun.write('schema.json', `${JSON.stringify(jsonSchema, null, 2)}\n`)

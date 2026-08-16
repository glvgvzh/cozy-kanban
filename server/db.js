import { DatabaseSync } from 'node:sqlite'

const db = new DatabaseSync('./server/cozy-kanban.db')

export { db }

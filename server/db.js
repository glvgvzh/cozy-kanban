import { DatabaseSync } from 'node:sqlite'

const db = new DatabaseSync('./server/cozy-kanban.db')

db.exec(`
    CREATE TABLE IF NOT EXISTS test (
        id INTEGER PRIMARY KEY,
        value TEXT 
    )
`)

const insertTest = db.prepare(`
    INSERT INTO test (value)
    VALUES (?)
`)
const selectTest = db.prepare(`
    SELECT * FROM test
`)
const deleteRecord = db.prepare(`
    DELETE FROM test WHERE value = ?
`)
const updateRecord = db.prepare(`
    UPDATE test
    SET value = ?
    WHERE id = ?
`)

function createTest(value) {
    insertTest.run(value)
}

function getTest() {
    return selectTest.all()
}

function deleteTest(value) {
    deleteRecord.run(value)
}

function updateTest(value, id) {
    updateRecord.run(value, id)
}

export { db, createTest, getTest, deleteTest, updateTest }

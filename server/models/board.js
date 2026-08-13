import { db } from "../db.js";
import crypto from 'node:crypto'

db.exec(`
    CREATE TABLE IF NOT EXISTS boards (
        id INTEGER PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        telegram_id TEXT UNIQUE
    )
`)

const createBoardQuery = db.prepare(`
    INSERT INTO boards (code, telegram_id)
    VALUES (?, ?)
`)

const deleteRecordQuery = db.prepare(`
    DELETE FROM boards WHERE telegram_id = ?
`)

const getBoardByTelegramIdQuery = db.prepare(`
    SELECT * FROM boards WHERE telegram_id = ?
`)

const getBoardByCodeQuery = db.prepare(`
    SELECT * FROM boards WHERE code = ?
`)

function generateAccessCode() {
    return crypto.randomBytes(3).toString('hex').toUpperCase()
}

function getOrCreateBoard(telegramId) {
    const normalizedTelegramId = String(telegramId)
    const existingBoard = getBoardByTelegramId(normalizedTelegramId)

    if (existingBoard) {
        return existingBoard
    }
    const code = generateAccessCode()
    createBoardQuery.run(code, normalizedTelegramId)
    return getBoardByTelegramId(normalizedTelegramId)
}

function deleteBoardByTelegramId(telegramId) {
    const normalizedTelegramId = String(telegramId)
    deleteRecordQuery.run(normalizedTelegramId)
}

function getBoardByTelegramId(telegramId) {
    const normalizedTelegramId = String(telegramId)
    return getBoardByTelegramIdQuery.get(normalizedTelegramId)
}

function getBoardByCode(code) {
    return getBoardByCodeQuery.get(code)
}


export { getOrCreateBoard, getBoardByCode, deleteBoardByTelegramId, getBoardByTelegramId }


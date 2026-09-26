import { db } from '../db.js'
import crypto from 'node:crypto'
import type { Board } from '../types/board.js'

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

function generateAccessCode(): string {
  return crypto.randomBytes(3).toString('hex').toUpperCase()
}

function getOrCreateBoard(telegramId: number | string): Board {
  const normalizedTelegramId = String(telegramId)
  const existingBoard = getBoardByTelegramId(normalizedTelegramId)

  if (existingBoard) {
    return existingBoard
  }
  const code = generateAccessCode()
  createBoardQuery.run(code, normalizedTelegramId)
  const createdBoard = getBoardByTelegramId(normalizedTelegramId)
  if (!createdBoard) throw new Error('Failed to create board')
  return createdBoard
}

function deleteBoardByTelegramId(telegramId: number | string): void {
  const normalizedTelegramId = String(telegramId)
  deleteRecordQuery.run(normalizedTelegramId)
}

function getBoardByTelegramId(telegramId: number | string): Board | undefined {
  const normalizedTelegramId = String(telegramId)
  return getBoardByTelegramIdQuery.get(normalizedTelegramId) as Board | undefined
}

function getBoardByCode(code: string): Board | undefined {
  return getBoardByCodeQuery.get(code) as Board | undefined
}

const getBoardByIdQuery = db.prepare(`
    SELECT * FROM boards WHERE id = ?
`)

function getBoardById(id: Board['id']): Board | undefined {
  return getBoardByIdQuery.get(id) as Board | undefined
}

export {
  getOrCreateBoard,
  getBoardByCode,
  deleteBoardByTelegramId,
  getBoardByTelegramId,
  getBoardById,
}

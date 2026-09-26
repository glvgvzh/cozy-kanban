import type { Task } from '../../src/types/task.js'
import { db } from '../db.js'
import type { Board } from '../types/board.js'
import type { DatabaseTask } from '../types/task.js'

db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        board_id INTEGER NOT NULL,
        status TEXT,
        title TEXT,
        description TEXT,
        created_at INTEGER,
        priority TEXT,
        deadline INTEGER
    )
`)

const createTaskQuery = db.prepare(`
    INSERT INTO tasks (id, board_id, status, title, description, created_at, priority, deadline)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`)

function createTask(boardId: Board['id'], task: Task) {
  createTaskQuery.run(
    task.id,
    boardId,
    task.status,
    task.title,
    task.description,
    task.createdAt,
    task.priority,
    task.deadline,
  )
}

const deleteTaskByIdQuery = db.prepare(`
    DELETE FROM tasks WHERE id = ?
`)

function deleteTaskById(id: Task['id']) {
  deleteTaskByIdQuery.run(id)
}

const getTasksByBoardIdQuery = db.prepare(`
    SELECT * FROM tasks WHERE board_id = ?
`)

function getTasksByBoardId(boardId: Board['id']): DatabaseTask[] {
  return getTasksByBoardIdQuery.all(boardId) as DatabaseTask[]
}

const updateTaskByIdQuery = db.prepare(`
    UPDATE tasks
    SET status = ?, 
        title = ?, 
        description = ?, 
        priority = ?, 
        deadline = ?
    WHERE id = ?
`)

function updateTaskById(task: Task) {
  updateTaskByIdQuery.run(
    task.status,
    task.title,
    task.description,
    task.priority,
    task.deadline,
    task.id,
  )
}

const getTaskByIdAndBoardIdQuery = db.prepare(`
    SELECT * FROM tasks WHERE id = ? AND board_id = ?
`)

function getTaskByIdAndBoardId(taskId: Task['id'], boardId: Board['id']): DatabaseTask | undefined {
  return getTaskByIdAndBoardIdQuery.get(taskId, boardId) as DatabaseTask | undefined
}

const getAllTasksQuery = db.prepare(`
    SELECT * FROM tasks
`)

function getAllTasks(): DatabaseTask[] {
  return getAllTasksQuery.all() as DatabaseTask[]
}

export {
  createTask,
  deleteTaskById,
  getTasksByBoardId,
  updateTaskById,
  getTaskByIdAndBoardId,
  getAllTasks,
}

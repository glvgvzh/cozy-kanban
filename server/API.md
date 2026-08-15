## GET `/api/boards/{code}/status`

Проверяет, существует ли доска с указанным кодом и подключена ли она к Telegram.

### Параметры

* `code` — уникальный код доски

### Ответ `200 OK`

```json
{
  "telegramConnected": true
}
```

### Ответ `404 Not Found`

```json
{
  "error": "Code not found"
}
```

---

## GET `/api/boards/{code}/tasks`

Возвращает все задачи указанной доски.

### Параметры

* `code` — уникальный код доски

### Ответ `200 OK`

```json
{
  "tasks": [
    {
      "id": "8c6b5e2d-4b6e-4b5a-9c12-1f3e9a7d2041",
      "board_id": 4,
      "status": "todo",
      "title": "Проверить API",
      "description": "Тестовая задача",
      "created_at": 1786800000000,
      "priority": "high",
      "deadline": 1787356800000
    }
  ]
}
```

Если задач нет:

```json
{
  "tasks": []
}
```

### Ответ `404 Not Found`

```json
{
  "error": "Code not found"
}
```

---

## POST `/api/boards/{code}/tasks`

Создаёт новую задачу в указанной доске.

### Параметры

* `code` — уникальный код доски

### Body

```json
{
  "id": "8c6b5e2d-4b6e-4b5a-9c12-1f3e9a7d2041",
  "status": "todo",
  "title": "Проверить POST API",
  "description": "Тестовая задача",
  "createdAt": 1786800000000,
  "priority": "high",
  "deadline": 1787356800000
}
```

`board_id` передавать не нужно.

Сервер сам получает доску по `code` и связывает задачу с её `board_id`.

### Ответ `201 Created`

```json
{
  "taskCreated": true,
  "task": {
    "id": "8c6b5e2d-4b6e-4b5a-9c12-1f3e9a7d2041",
    "status": "todo",
    "title": "Проверить POST API",
    "description": "Тестовая задача",
    "createdAt": 1786800000000,
    "priority": "high",
    "deadline": 1787356800000
  }
}
```

### Ответ `404 Not Found`

```json
{
  "error": "Code not found"
}
```

---

## PATCH `/api/boards/{code}/tasks/{taskId}`

Обновляет существующую задачу указанной доски.

Перед обновлением сервер проверяет:

* существует ли доска с указанным `code`
* существует ли задача с указанным `taskId`
* принадлежит ли задача этой доске

### Параметры

* `code` — уникальный код доски
* `taskId` — ID обновляемой задачи

### Body

Передаётся обновлённый объект задачи.

```json
{
  "id": "8c6b5e2d-4b6e-4b5a-9c12-1f3e9a7d2041",
  "status": "inProgress",
  "title": "Проверить PATCH API",
  "description": "Обновлённое описание",
  "createdAt": 1786800000000,
  "priority": "critical",
  "deadline": 1787443200000
}
```

ID задачи для обновления определяется по `taskId` из URL.

### Ответ `200 OK`

```json
{
  "taskUpdated": true,
  "newTask": {
    "id": "8c6b5e2d-4b6e-4b5a-9c12-1f3e9a7d2041",
    "status": "inProgress",
    "title": "Проверить PATCH API",
    "description": "Обновлённое описание",
    "createdAt": 1786800000000,
    "priority": "critical",
    "deadline": 1787443200000
  }
}
```

### Ответ `404 Not Found`

Если доска не найдена:

```json
{
  "error": "Code not found"
}
```

Если задача не найдена или не принадлежит указанной доске:

```json
{
  "error": "Task not found"
}
```

---

## DELETE `/api/boards/{code}/tasks/{taskId}`

Удаляет задачу указанной доски.

Перед удалением сервер проверяет, что задача действительно принадлежит этой доске.

### Параметры

* `code` — уникальный код доски
* `taskId` — ID удаляемой задачи

### Ответ `200 OK`

```json
{
  "taskDeleted": true
}
```

### Ответ `404 Not Found`

Если доска не найдена:

```json
{
  "error": "Code not found"
}
```

Если задача не найдена или не принадлежит указанной доске:

```json
{
  "error": "Task not found"
}
```

---

# Маршруты

| Method   | URL                                 | Назначение                 |
| -------- | ----------------------------------- | -------------------------- |
| `GET`    | `/api/status`                       | Проверка работы сервера    |
| `GET`    | `/api/boards/{code}/status`         | Проверка подключения доски |
| `GET`    | `/api/boards/{code}/tasks`          | Получение задач доски      |
| `POST`   | `/api/boards/{code}/tasks`          | Создание задачи            |
| `PATCH`  | `/api/boards/{code}/tasks/{taskId}` | Обновление задачи          |
| `DELETE` | `/api/boards/{code}/tasks/{taskId}` | Удаление задачи            |

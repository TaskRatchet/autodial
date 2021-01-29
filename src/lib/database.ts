const Database = require("@replit/database")

const db = new Database()

export function set(key: string, value: string): Promise<any> {
  return db.set(key, value)
}
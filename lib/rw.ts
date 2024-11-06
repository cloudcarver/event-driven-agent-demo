import { Pool } from "pg";

const pool = new Pool({
    user: "root",
    host: "localhost",
    database: "dev",
    password: "",
    port: 4566,
    ssl: false
});

const initStatements = [
    `CREATE TABLE IF NOT EXISTS sys_event_triggers (
    id        STRING PRIMARY KEY,
    prompt    STRING,
    timestamp TIMESTAMPTZ
);`,
    `CREATE TABLE IF NOT EXISTS sys_event_trigger_handle_log (
    id         STRING PRIMARY KEY,
    handled_at TIMESTAMPTZ
);`,
    `CREATE MATERIALIZED VIEW IF NOT EXISTS sys_pending_event_triggers AS (
    SELECT id, prompt, timestamp
    FROM sys_event_triggers WHERE id NOT IN (
        SELECT id FROM sys_event_trigger_handle_log
    )
);`
];

console.log("Initializing database...");
initStatements.forEach(async (stmt) => {
    console.log(stmt);
    try {
        await pool.query(stmt);
    } catch (e) {
        console.error(e);
    }
})

export default pool;

import { NextRequest, NextResponse } from "next/server";
import rw from "@/lib/rw";

export async function GET(_: NextRequest): Promise<NextResponse<any>> {
  let data = await rw.query("SELECT * FROM sys_pending_event_triggers LIMIT 1");
  if (data.rows.length === 0) {
    return NextResponse.json({})
  }
  let event = data.rows[0];
  return NextResponse.json({ event })
}

export async function POST(req: NextRequest): Promise<NextResponse<any>> {
  const { id } = await req.json();
  await rw.query("INSERT INTO sys_event_trigger_handle_log (id, handled_at) VALUES ($1, $2)", [id, new Date().toISOString()])
  await rw.query("FLUSH")
  return NextResponse.json({})
}

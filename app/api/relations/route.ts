import { NextRequest, NextResponse } from "next/server";
import rw from "@/lib/rw";
import { FieldDef } from "pg";

interface RelationInfo {
  rows?: any[]
  fields?: FieldDef[]
  error?: string
}

export async function GET(_: NextRequest): Promise<NextResponse<string[]>> {
  try {
    let tables = await rw.query("SHOW TABLES");
    let mvs = await rw.query("SHOW MATERIALIZED VIEWS");
    console.log(tables.rows, mvs.rows)
    return NextResponse.json([...tables.rows.map(row => row.Name), ...mvs.rows.map(row => row.Name)])
  } catch (e) {
    return NextResponse.json([`${e}`])
  }
}

export async function POST(req: NextRequest): Promise<NextResponse<RelationInfo>> {
  const { relation, orderBy, limit } = await req.json();

  let stmt = `SELECT * FROM ${relation}`;
  if (orderBy) {
    stmt += ` ORDER BY ${orderBy}`;
  }
  if (limit) {
    stmt += ` LIMIT ${limit}`;
  } else {
    stmt += ` LIMIT 10`;
  }

  try {
    let res = await rw.query(stmt)
    return NextResponse.json({ rows: res.rows, fields: res.fields })
  } catch (e) {
    return NextResponse.json({ error: `${e}` })
  }
}

export type {
  RelationInfo,
}

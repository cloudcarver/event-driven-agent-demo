import { useState, useEffect, useRef } from "react";
import { RelationInfo } from "../api/relations/route";
import { border } from "@/app/const/styles";

export default function Relation() {
  const [info, setInfo] = useState<RelationInfo>({});
  const [availableRelations, setAvailableRelations] = useState<string[]>([]);
  const [relation, setRelation] = useState("");
  const [orderBy, setOrderBy] = useState("");
  const [limit, setLimit] = useState(5);
  const autoRefreshInterval = useRef<NodeJS.Timeout | null>(null);

  const refreshRelations = async () => {
    let res = await fetch('/api/relations')
    let data: string[] = await res.json();
    setAvailableRelations(data)
    if (relation === "" && data.length > 0) {
      setRelation(data[0])
    }
  }

  const getRelationInfo = async (relation: string, orderBy: string, limit: number): Promise<RelationInfo> => {
    let res = await fetch('/api/relations', {
      method: 'POST',
      body: JSON.stringify({
        relation,
        orderBy,
        limit,
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return await res.json();
  }

  const refresh = async () => {
    if (!relation) {
      return;
    }
    let info = await getRelationInfo(relation, orderBy, limit);
    if (!orderBy) {
      if (info.fields && info.fields.length > 0) {
        setOrderBy(info.fields.sort((a, b) => a.name > b.name ? 1 : 0)[0].name)
        return
      }
    }
    setInfo(info)
  }

  useEffect(() => {
    if (!autoRefreshInterval.current) {
      autoRefreshInterval.current = setInterval(() => {
        refresh();
      }, 1000)
    }
    refreshRelations();

    return () => {
      if (autoRefreshInterval.current) {
        clearInterval(autoRefreshInterval.current);
        autoRefreshInterval.current = null;
      }
    }
  }, [])

  useEffect(() => {
    setOrderBy("");
  }, [relation])

  useEffect(() => {
    refresh();
    if (autoRefreshInterval.current) {
      clearInterval(autoRefreshInterval.current);
    }
    autoRefreshInterval.current = setInterval(() => {
      refresh();
    }, 1000)
  }, [relation, orderBy, limit])

  return <div>
    <div className="flex flex-row gap-2 items-center">
      <select className={border + " h-8 px-2 focus:ring-2 focus:ring-blue-200 focus:outline-none bg-white"} value={relation} onClick={() => refreshRelations()} onChange={(e) => setRelation(e.currentTarget.value)}>
        {
          availableRelations.map((relation, idx) => {
            return <option key={idx} value={relation}>{relation}</option>
          })
        }
      </select>        {relation && <>
          <span className="text-gray-600">OrderBy</span>
          <select className={border + " h-8 px-2 focus:ring-2 focus:ring-blue-200 focus:outline-none bg-white"} value={orderBy} onChange={(e) => {
          setOrderBy(e.currentTarget.value)
        }}>
          {
            info.fields?.map((field, idx) => {
              return <option key={idx} value={field.name}>{field.name}</option>
            })
          }
        </select>
      </>}
    </div>
    {
      info.error && <div className="text-red-500">{info.error}</div>
    }
    <table className="my-2 w-full border-collapse overflow-hidden">
      <thead>
        <tr className="bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 border-b border-gray-300">
          {
            info.fields && info.fields.map((field, idx) => {
              return <th key={idx} className="p-2 font-semibold text-gray-700">{field.name}</th>
            })
          }
        </tr>
        {
          info.rows && info.rows.map((row, r) => {
            return <tr key={"r-" + r} className="hover:bg-gray-50 transition-colors">
              {
                info.fields?.map((field, c) => {
                  return <td key={`cell-${r}-${c}`} className="border-b border-gray-300 p-2">{row[field.name]}</td>
                })
              }
            </tr>
          })
        }
      </thead>
    </table>
  </div>
}

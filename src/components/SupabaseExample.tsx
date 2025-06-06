import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function SupabaseExample() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Replace 'your_table' with your actual table name
        const { data: result, error } = await supabase
          .from('your_table')
          .select('*')
        
        if (error) {
          throw error
        }

        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Data from Supabase</h2>
      <pre className="bg-gray-100 p-4 rounded">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
} 
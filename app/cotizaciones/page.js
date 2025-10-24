'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'

export default function Cotizaciones() {
  const [cotizaciones, setCotizaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }
    setUser(JSON.parse(userData))
    loadCotizaciones(JSON.parse(userData))
  }, [router])

  const loadCotizaciones = async (userData) => {
    try {
      const { data, error } = await supabase
        .from('cotizaciones')
        .select(`
          *,
          clientes (nombre)
        `)
        .eq('vendedor_id', userData.vendedor_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCotizaciones(data || [])
    } catch (error) {
      console.error('Error loading cotizaciones:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta cotización?')) return

    try {
      const { error } = await supabase
        .from('cotizaciones')
        .delete()
        .eq('id', id)

      if (error) throw error
      setCotizaciones(cotizaciones.filter(c => c.id !== id))
      alert('Cotización eliminada')
    } catch (error) {
      console.error('Error deleting cotizacion:', error)
      alert('Error al eliminar cotización')
    }
  }

  const filteredCotizaciones = cotizaciones.filter(cot =>
    (cot.numero && cot.numero.toString().includes(search)) ||
    (cot.clientes?.nombre && cot.clientes.nombre.toLowerCase().includes(search.toLowerCase()))
  )

  const getStatusColor = (estado) => {
    const colors = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      aceptada: 'bg-green-100 text-green-800',
      rechazada: 'bg-red-100 text-red-800',
    }
    return colors[estado] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return <div className="text-center">Cargando...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Cotizaciones</h1>
          <p className="text-gray-600 mt-1">Gestiona tus cotizaciones</p>
        </div>
        <button
          onClick={() => router.push('/cotizaciones/nueva')}
          className="btn-primary"
        >
          + Nueva Cotización
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <input
          type="text"
          placeholder="Buscar por número o cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field"
        />
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        {filteredCotizaciones.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {search ? 'No se encontraron cotizaciones' : 'No hay cotizaciones registradas'}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">N°</th>
                <th className="text-left py-3 px-4">Fecha</th>
                <th className="text-left py-3 px-4">Cliente</th>
                <th className="text-right py-3 px-4">Total</th>
                <th className="text-center py-3 px-4">Estado</th>
                <th className="text-right py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCotizaciones.map((cot) => (
                <tr key={cot.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">#{cot.numero}</td>
                  <td className="py-3 px-4">
                    {cot.fecha ? format(new Date(cot.fecha), 'dd/MM/yyyy') : '-'}
                  </td>
                  <td className="py-3 px-4">{cot.clientes?.nombre || 'Sin cliente'}</td>
                  <td className="py-3 px-4 text-right font-medium">
                    ${cot.total?.toLocaleString('es-CO') || '0'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(cot.estado)}`}>
                      {cot.estado}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => router.push(`/cotizaciones/${cot.id}`)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Ver
                    </button>
                    <button
                      onClick={() => handleDelete(cot.id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Clientes() {
  const [clientes, setClientes] = useState([])
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
    loadClientes(JSON.parse(userData))
  }, [router])

  const loadClientes = async (userData) => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('vendedor_id', userData.vendedor_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setClientes(data || [])
    } catch (error) {
      console.error('Error loading clientes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este cliente?')) return

    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id)

      if (error) throw error
      setClientes(clientes.filter(c => c.id !== id))
    } catch (error) {
      console.error('Error deleting cliente:', error)
      alert('Error al eliminar cliente')
    }
  }

  const filteredClientes = clientes.filter(cliente =>
    cliente.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (cliente.telefono && cliente.telefono.includes(search)) ||
    (cliente.nit && cliente.nit.includes(search))
  )

  if (loading) {
    return <div className="text-center">Cargando...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Clientes</h1>
          <p className="text-gray-600 mt-1">Gestiona tus clientes</p>
        </div>
        <button
          onClick={() => router.push('/clientes/nuevo')}
          className="btn-primary"
        >
          + Nuevo Cliente
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <input
          type="text"
          placeholder="Buscar por nombre, teléfono o NIT..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field"
        />
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        {filteredClientes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {search ? 'No se encontraron clientes' : 'No hay clientes registrados'}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Nombre</th>
                <th className="text-left py-3 px-4">Teléfono</th>
                <th className="text-left py-3 px-4">NIT</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Ciudad</th>
                <th className="text-right py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredClientes.map((cliente) => (
                <tr key={cliente.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{cliente.nombre}</td>
                  <td className="py-3 px-4">{cliente.telefono}</td>
                  <td className="py-3 px-4">{cliente.nit || '-'}</td>
                  <td className="py-3 px-4">{cliente.email || '-'}</td>
                  <td className="py-3 px-4">{cliente.ciudad || '-'}</td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleDelete(cliente.id)}
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

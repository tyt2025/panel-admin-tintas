'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({
    cotizaciones: 0,
    clientes: 0,
    productos: 0
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }
    setUser(JSON.parse(userData))
    loadStats(JSON.parse(userData))
  }, [router])

  const loadStats = async (userData) => {
    try {
      // Cargar estadísticas
      const [cotizacionesRes, clientesRes, productosRes] = await Promise.all([
        supabase
          .from('cotizaciones')
          .select('id', { count: 'exact' })
          .eq('vendedor_id', userData.vendedor_id),
        supabase
          .from('clientes')
          .select('id', { count: 'exact' })
          .eq('vendedor_id', userData.vendedor_id),
        supabase
          .from('productos')
          .select('id', { count: 'exact' })
      ])

      setStats({
        cotizaciones: cotizacionesRes.count || 0,
        clientes: clientesRes.count || 0,
        productos: productosRes.count || 0
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="card">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          ¡Bienvenido, {user.nombre}! 👋
        </h1>
        <p className="text-gray-600">
          Usuario: {user.username} | Vendedor ID: {user.vendedor_id}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Cotizaciones</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.cotizaciones}</h3>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Clientes</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.clientes}</h3>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div 
          className="card cursor-pointer hover:shadow-lg transition-shadow duration-200"
          onClick={() => router.push('/productos')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Productos</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.productos}</h3>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Acciones Rápidas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => router.push('/cotizaciones/nueva')}
            className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-4 px-6 rounded-lg transition duration-200 border-2 border-blue-200"
          >
            + Nueva Cotización
          </button>
          <button 
            onClick={() => router.push('/clientes/nuevo')}
            className="bg-green-50 hover:bg-green-100 text-green-700 font-semibold py-4 px-6 rounded-lg transition duration-200 border-2 border-green-200"
          >
            + Nuevo Cliente
          </button>
          <button 
            onClick={() => router.push('/cotizaciones')}
            className="bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold py-4 px-6 rounded-lg transition duration-200 border-2 border-purple-200"
          >
            Ver Cotizaciones
          </button>
          <button 
            onClick={() => router.push('/reportes')}
            className="bg-orange-50 hover:bg-orange-100 text-orange-700 font-semibold py-4 px-6 rounded-lg transition duration-200 border-2 border-orange-200"
          >
            Reportes
          </button>
        </div>
      </div>
    </div>
  )
}

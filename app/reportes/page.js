'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { format, startOfMonth, endOfMonth } from 'date-fns'

export default function Reportes() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCotizaciones: 0,
    totalVentas: 0,
    cotizacionesEsteMes: 0,
    ventasEsteMes: 0,
    clientesActivos: 0
  })
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
      const inicio = startOfMonth(new Date())
      const fin = endOfMonth(new Date())

      const [totalCotRes, mesRes, clientesRes] = await Promise.all([
        supabase
          .from('cotizaciones')
          .select('total')
          .eq('vendedor_id', userData.vendedor_id),
        supabase
          .from('cotizaciones')
          .select('total')
          .eq('vendedor_id', userData.vendedor_id)
          .gte('created_at', inicio.toISOString())
          .lte('created_at', fin.toISOString()),
        supabase
          .from('clientes')
          .select('id', { count: 'exact' })
          .eq('vendedor_id', userData.vendedor_id)
      ])

      const totalVentas = totalCotRes.data?.reduce((sum, c) => sum + (c.total || 0), 0) || 0
      const ventasMes = mesRes.data?.reduce((sum, c) => sum + (c.total || 0), 0) || 0

      setStats({
        totalCotizaciones: totalCotRes.data?.length || 0,
        totalVentas,
        cotizacionesEsteMes: mesRes.data?.length || 0,
        ventasEsteMes: ventasMes,
        clientesActivos: clientesRes.count || 0
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !user) {
    return <div className="text-center">Cargando...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Reportes</h1>
        <p className="text-gray-600 mt-1">Estadísticas y métricas de tu negocio</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Cotizaciones</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.totalCotizaciones}</h3>
              <p className="text-sm text-gray-500 mt-1">Histórico</p>
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
              <p className="text-gray-600 text-sm">Total Ventas</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">
                ${(stats.totalVentas / 1000000).toFixed(1)}M
              </h3>
              <p className="text-sm text-gray-500 mt-1">Histórico</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Clientes Activos</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.clientesActivos}</h3>
              <p className="text-sm text-gray-500 mt-1">Total registrados</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card bg-blue-50 border-2 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-800 text-sm font-medium">Este Mes</p>
              <h3 className="text-3xl font-bold text-blue-900 mt-1">{stats.cotizacionesEsteMes}</h3>
              <p className="text-sm text-blue-700 mt-1">Cotizaciones</p>
            </div>
            <div className="bg-blue-200 rounded-full p-3">
              <svg className="w-8 h-8 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card bg-green-50 border-2 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-800 text-sm font-medium">Este Mes</p>
              <h3 className="text-3xl font-bold text-green-900 mt-1">
                ${(stats.ventasEsteMes / 1000000).toFixed(1)}M
              </h3>
              <p className="text-sm text-green-700 mt-1">En ventas</p>
            </div>
            <div className="bg-green-200 rounded-full p-3">
              <svg className="w-8 h-8 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card bg-purple-50 border-2 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-800 text-sm font-medium">Promedio</p>
              <h3 className="text-3xl font-bold text-purple-900 mt-1">
                ${stats.totalCotizaciones > 0 
                  ? ((stats.totalVentas / stats.totalCotizaciones) / 1000).toFixed(0) + 'K'
                  : '0'}
              </h3>
              <p className="text-sm text-purple-700 mt-1">Por cotización</p>
            </div>
            <div className="bg-purple-200 rounded-full p-3">
              <svg className="w-8 h-8 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="card bg-blue-50 border border-blue-200">
        <div className="flex items-start">
          <div className="text-blue-600 mr-4 text-2xl">ℹ️</div>
          <div>
            <h4 className="text-blue-900 font-semibold mb-2">Reporte Básico</h4>
            <p className="text-blue-800 text-sm">
              Este es un dashboard de reportes básico. Muestra estadísticas generales de tu actividad.
              En futuras actualizaciones se pueden agregar gráficas, filtros por fecha, exportación a Excel, y más métricas detalladas.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

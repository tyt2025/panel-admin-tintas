'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

export default function ProductosPage() {
  const router = useRouter()
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const productosPorPagina = 20

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }
    loadProductos()
  }, [router])

  const loadProductos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('product_name')

      if (error) throw error
      setProductos(data || [])
    } catch (error) {
      console.error('Error loading productos:', error)
      alert('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  // Filtrar productos por búsqueda (nombre o SKU)
  const productosFiltrados = productos.filter(p => {
    const searchLower = searchTerm.toLowerCase()
    const nombre = (p.product_name || '').toLowerCase()
    const sku = (p.sku || '').toLowerCase()
    return nombre.includes(searchLower) || sku.includes(searchLower)
  })

  // Paginación
  const indexOfLastProducto = currentPage * productosPorPagina
  const indexOfFirstProducto = indexOfLastProducto - productosPorPagina
  const productosActuales = productosFiltrados.slice(indexOfFirstProducto, indexOfLastProducto)
  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Cargando productos...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Productos</h1>
          <p className="text-gray-600 mt-1">
            {productosFiltrados.length} productos encontrados
          </p>
        </div>
        <button
          onClick={() => router.push('/productos/nuevo')}
          className="btn-primary"
        >
          + Nuevo Producto
        </button>
      </div>

      {/* Búsqueda */}
      <div className="card">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1) // Reset a primera página al buscar
            }}
            className="input-field pl-10"
          />
          <svg
            className="absolute left-3 top-3 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Lista de productos */}
      {productosActuales.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg">No se encontraron productos</p>
          {searchTerm && (
            <p className="text-gray-400 mt-2">
              Intenta con otra búsqueda
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {productosActuales.map((producto) => (
              <div
                key={producto.id}
                className="card hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/productos/${producto.id}`)}
              >
                {/* Imagen del producto */}
                <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden mb-3">
                  {producto.image_url_png || producto.main_image_url ? (
                    <Image
                      src={producto.image_url_png || producto.main_image_url}
                      alt={producto.product_name}
                      fill
                      className="object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Información del producto */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                    {producto.product_name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2">
                    SKU: {producto.sku}
                  </p>
                  {producto.brand && (
                    <p className="text-xs text-gray-600 mb-2">
                      Marca: {producto.brand}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-lg font-bold text-blue-600">
                      ${(producto.price_cop || producto.price || 0).toLocaleString('es-CO')}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      (producto.available_stock || 0) > 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      Stock: {producto.available_stock || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="card">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Anterior
                </button>
                <span className="text-gray-600">
                  Página {currentPage} de {totalPaginas}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPaginas))}
                  disabled={currentPage === totalPaginas}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

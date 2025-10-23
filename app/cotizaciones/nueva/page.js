'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function NuevaCotizacion() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [clientes, setClientes] = useState([])
  const [productos, setProductos] = useState([])
  const [carrito, setCarrito] = useState([])
  const [searchProducto, setSearchProducto] = useState('')
  
  const [formData, setFormData] = useState({
    cliente_id: '',
    descuento: 0,
    iva: 19,
    observaciones: '',
    validez_dias: 5
  })

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }
    setUser(JSON.parse(userData))
    loadData(JSON.parse(userData))
  }, [router])

  const loadData = async (userData) => {
    try {
      const [clientesRes, productosRes] = await Promise.all([
        supabase
          .from('clientes')
          .select('*')
          .eq('vendedor_id', userData.vendedor_id)
          .order('nombre'),
        supabase
          .from('productos')
          .select('*')
          .order('name')
      ])

      setClientes(clientesRes.data || [])
      setProductos(productosRes.data || [])
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const agregarAlCarrito = (producto) => {
    const existente = carrito.find(item => item.producto_id === producto.id)
    if (existente) {
      setCarrito(carrito.map(item =>
        item.producto_id === producto.id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ))
    } else {
      setCarrito([...carrito, {
        producto_id: producto.id,
        nombre: producto.name,
        precio_unitario: producto.price || 0,
        cantidad: 1
      }])
    }
    setSearchProducto('')
  }

  const actualizarCantidad = (producto_id, cantidad) => {
    if (cantidad <= 0) {
      setCarrito(carrito.filter(item => item.producto_id !== producto_id))
    } else {
      setCarrito(carrito.map(item =>
        item.producto_id === producto_id
          ? { ...item, cantidad: parseInt(cantidad) }
          : item
      ))
    }
  }

  const actualizarPrecio = (producto_id, precio) => {
    setCarrito(carrito.map(item =>
      item.producto_id === producto_id
        ? { ...item, precio_unitario: parseFloat(precio) || 0 }
        : item
    ))
  }

  const eliminarDelCarrito = (producto_id) => {
    setCarrito(carrito.filter(item => item.producto_id !== producto_id))
  }

  const calcularTotales = () => {
    const subtotal = carrito.reduce((sum, item) => 
      sum + (item.precio_unitario * item.cantidad), 0)
    const descuentoMonto = subtotal * (formData.descuento / 100)
    const baseImponible = subtotal - descuentoMonto
    const ivaMonto = baseImponible * (formData.iva / 100)
    const total = baseImponible + ivaMonto

    return { subtotal, descuentoMonto, baseImponible, ivaMonto, total }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (carrito.length === 0) {
      alert('Agrega al menos un producto')
      return
    }

    if (!formData.cliente_id) {
      alert('Selecciona un cliente')
      return
    }

    setLoading(true)

    try {
      const totales = calcularTotales()

      // Crear cotización
      const { data: cotizacion, error: cotError } = await supabase
        .from('cotizaciones')
        .insert([{
          cliente_id: formData.cliente_id,
          vendedor_id: user.vendedor_id,
          subtotal: totales.subtotal,
          descuento: formData.descuento,
          iva: formData.iva,
          total: totales.total,
          observaciones: formData.observaciones,
          validez_dias: formData.validez_dias,
          estado: 'pendiente'
        }])
        .select()
        .single()

      if (cotError) throw cotError

      // Crear items
      const items = carrito.map(item => ({
        cotizacion_id: cotizacion.id,
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal: item.precio_unitario * item.cantidad
      }))

      const { error: itemsError } = await supabase
        .from('cotizacion_items')
        .insert(items)

      if (itemsError) throw itemsError

      alert('Cotización creada exitosamente')
      router.push(`/cotizaciones/${cotizacion.id}`)
    } catch (error) {
      console.error('Error creating cotizacion:', error)
      alert('Error al crear cotización')
    } finally {
      setLoading(false)
    }
  }

  const productosFiltrados = productos.filter(p =>
    p.name.toLowerCase().includes(searchProducto.toLowerCase())
  ).slice(0, 5)

  const totales = calcularTotales()

  if (!user) {
    return <div className="text-center">Cargando...</div>
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Nueva Cotización</h1>
        <button onClick={() => router.back()} className="btn-secondary">
          Volver
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cliente */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">1. Datos del Cliente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cliente *
              </label>
              <select
                value={formData.cliente_id}
                onChange={(e) => setFormData({...formData, cliente_id: e.target.value})}
                className="input-field"
                required
              >
                <option value="">Selecciona un cliente</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Validez (días)
              </label>
              <input
                type="number"
                value={formData.validez_dias}
                onChange={(e) => setFormData({...formData, validez_dias: e.target.value})}
                className="input-field"
                min="1"
              />
            </div>
          </div>
        </div>

        {/* Productos */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">2. Productos</h3>
          
          {/* Buscar producto */}
          <div className="mb-4 relative">
            <input
              type="text"
              placeholder="Buscar producto..."
              value={searchProducto}
              onChange={(e) => setSearchProducto(e.target.value)}
              className="input-field"
            />
            {searchProducto && productosFiltrados.length > 0 && (
              <div className="absolute z-10 w-full bg-white border rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                {productosFiltrados.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => agregarAlCarrito(p)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    <div className="font-medium">{p.name}</div>
                    <div className="text-sm text-gray-600">${p.price?.toLocaleString('es-CO')}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Carrito */}
          {carrito.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay productos agregados
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Producto</th>
                    <th className="text-center py-2 px-2">Cantidad</th>
                    <th className="text-right py-2 px-2">Precio Unit.</th>
                    <th className="text-right py-2 px-2">Subtotal</th>
                    <th className="text-center py-2 px-2">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {carrito.map(item => (
                    <tr key={item.producto_id} className="border-b">
                      <td className="py-2 px-2">{item.nombre}</td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          value={item.cantidad}
                          onChange={(e) => actualizarCantidad(item.producto_id, e.target.value)}
                          className="w-20 px-2 py-1 border rounded text-center"
                          min="1"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          value={item.precio_unitario}
                          onChange={(e) => actualizarPrecio(item.producto_id, e.target.value)}
                          className="w-32 px-2 py-1 border rounded text-right"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="py-2 px-2 text-right font-medium">
                        ${(item.precio_unitario * item.cantidad).toLocaleString('es-CO')}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => eliminarDelCarrito(item.producto_id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Totales */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">3. Totales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descuento (%)
              </label>
              <input
                type="number"
                value={formData.descuento}
                onChange={(e) => setFormData({...formData, descuento: parseFloat(e.target.value) || 0})}
                className="input-field"
                min="0"
                max="100"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                IVA (%)
              </label>
              <input
                type="number"
                value={formData.iva}
                onChange={(e) => setFormData({...formData, iva: parseFloat(e.target.value) || 0})}
                className="input-field"
                min="0"
                max="100"
                step="0.01"
              />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">${totales.subtotal.toLocaleString('es-CO')}</span>
            </div>
            {formData.descuento > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Descuento ({formData.descuento}%):</span>
                <span>-${totales.descuentoMonto.toLocaleString('es-CO')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">IVA ({formData.iva}%):</span>
              <span className="font-medium">${totales.ivaMonto.toLocaleString('es-CO')}</span>
            </div>
            <div className="flex justify-between text-xl font-bold border-t pt-2">
              <span>Total:</span>
              <span>${totales.total.toLocaleString('es-CO')}</span>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              value={formData.observaciones}
              onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
              className="input-field"
              rows="3"
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || carrito.length === 0}
            className="flex-1 btn-primary disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Crear Cotización'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 btn-secondary"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

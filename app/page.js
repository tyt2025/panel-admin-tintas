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
  const [showManualAdd, setShowManualAdd] = useState(false)
  const [manualProduct, setManualProduct] = useState({
    nombre: '',
    precio: 0,
    cantidad: 1
  })
  
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
      // Cargar clientes
      const { data: clientesData, error: clientesError } = await supabase
        .from('clientes')
        .select('*')
        .eq('vendedor_id', userData.vendedor_id)
        .order('nombre')

      if (clientesError) {
        console.error('Error loading clientes:', clientesError)
      }

      // Cargar productos - probando diferentes nombres de columnas
      const { data: productosData, error: productosError } = await supabase
        .from('productos')
        .select('*')
        .limit(100)

      if (productosError) {
        console.error('Error loading productos:', productosError)
        alert('Error al cargar productos. Verifica la estructura de la tabla.')
      } else {
        console.log('Productos cargados:', productosData?.length)
        console.log('Primera producto de ejemplo:', productosData?.[0])
      }

      setClientes(clientesData || [])
      setProductos(productosData || [])
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const agregarAlCarrito = (producto) => {
    // Detectar dinámicamente los nombres de columnas
    const nombre = producto.nombre || producto.name || producto.descripcion || 'Producto sin nombre'
    const precio = producto.precio || producto.price || producto.precio_unitario || 0
    const id = producto.id

    const existente = carrito.find(item => item.producto_id === id)
    if (existente) {
      setCarrito(carrito.map(item =>
        item.producto_id === id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ))
    } else {
      setCarrito([...carrito, {
        producto_id: id,
        nombre: nombre,
        precio_unitario: precio,
        cantidad: 1
      }])
    }
    setSearchProducto('')
  }

  const agregarProductoManual = () => {
    if (!manualProduct.nombre.trim()) {
      alert('Ingresa el nombre del producto')
      return
    }

    const nuevoItem = {
      producto_id: `manual_${Date.now()}`, // ID temporal para productos manuales
      nombre: manualProduct.nombre,
      precio_unitario: parseFloat(manualProduct.precio) || 0,
      cantidad: parseInt(manualProduct.cantidad) || 1,
      manual: true // Marcador para saber que es manual
    }

    setCarrito([...carrito, nuevoItem])
    setManualProduct({ nombre: '', precio: 0, cantidad: 1 })
    setShowManualAdd(false)
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

      // Crear items (solo los que no son manuales o crear productos manuales primero)
      const itemsParaInsertar = []
      
      for (const item of carrito) {
        if (item.manual) {
          // Si es manual, crear el producto primero
          const { data: nuevoProducto, error: prodError } = await supabase
            .from('productos')
            .insert([{
              nombre: item.nombre,
              precio: item.precio_unitario,
              descripcion: 'Producto agregado manualmente'
            }])
            .select()
            .single()

          if (!prodError && nuevoProducto) {
            itemsParaInsertar.push({
              cotizacion_id: cotizacion.id,
              producto_id: nuevoProducto.id,
              cantidad: item.cantidad,
              precio_unitario: item.precio_unitario,
              subtotal: item.precio_unitario * item.cantidad
            })
          }
        } else {
          itemsParaInsertar.push({
            cotizacion_id: cotizacion.id,
            producto_id: item.producto_id,
            cantidad: item.cantidad,
            precio_unitario: item.precio_unitario,
            subtotal: item.precio_unitario * item.cantidad
          })
        }
      }

      const { error: itemsError } = await supabase
        .from('cotizacion_items')
        .insert(itemsParaInsertar)

      if (itemsError) throw itemsError

      alert('Cotización creada exitosamente')
      router.push(`/cotizaciones/${cotizacion.id}`)
    } catch (error) {
      console.error('Error creating cotizacion:', error)
      alert('Error al crear cotización: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Filtrar productos - detectar automáticamente el campo de nombre
  const productosFiltrados = productos.filter(p => {
    const nombreProducto = (p.nombre || p.name || p.descripcion || '').toLowerCase()
    return nombreProducto.includes(searchProducto.toLowerCase())
  }).slice(0, 10)

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
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">2. Productos</h3>
            <button
              type="button"
              onClick={() => setShowManualAdd(!showManualAdd)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              + Agregar Manual
            </button>
          </div>

          {/* Formulario agregar producto manual */}
          {showManualAdd && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-green-800 mb-3">Agregar Producto Manualmente</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    value={manualProduct.nombre}
                    onChange={(e) => setManualProduct({...manualProduct, nombre: e.target.value})}
                    className="input-field"
                    placeholder="Ej: Tinta HP 123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio Unitario
                  </label>
                  <input
                    type="number"
                    value={manualProduct.precio}
                    onChange={(e) => setManualProduct({...manualProduct, precio: e.target.value})}
                    className="input-field"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    value={manualProduct.cantidad}
                    onChange={(e) => setManualProduct({...manualProduct, cantidad: e.target.value})}
                    className="input-field"
                    min="1"
                    placeholder="1"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={agregarProductoManual}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Agregar al Carrito
                </button>
                <button
                  type="button"
                  onClick={() => setShowManualAdd(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
          
          {/* Buscar producto */}
          <div className="mb-4 relative">
            <input
              type="text"
              placeholder="Buscar producto por nombre..."
              value={searchProducto}
              onChange={(e) => setSearchProducto(e.target.value)}
              className="input-field"
            />
            {productos.length === 0 && (
              <p className="text-sm text-red-600 mt-1">
                ⚠️ No se encontraron productos en la base de datos
              </p>
            )}
            {searchProducto && productosFiltrados.length > 0 && (
              <div className="absolute z-10 w-full bg-white border rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                {productosFiltrados.map(p => {
                  const nombre = p.nombre || p.name || p.descripcion || 'Sin nombre'
                  const precio = p.precio || p.price || p.precio_unitario || 0
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => agregarAlCarrito(p)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b last:border-b-0"
                    >
                      <div className="font-medium">{nombre}</div>
                      <div className="text-sm text-gray-600">${precio?.toLocaleString('es-CO')}</div>
                    </button>
                  )
                })}
              </div>
            )}
            {searchProducto && productosFiltrados.length === 0 && productos.length > 0 && (
              <div className="absolute z-10 w-full bg-white border rounded-lg shadow-lg mt-1 p-4">
                <p className="text-gray-500 text-sm">No se encontraron productos con "{searchProducto}"</p>
              </div>
            )}
          </div>

          {/* Carrito */}
          {carrito.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay productos agregados
              <p className="text-sm mt-2">Busca productos arriba o agrégalos manualmente</p>
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
                      <td className="py-2 px-2">
                        {item.nombre}
                        {item.manual && (
                          <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Manual</span>
                        )}
                      </td>
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
                          className="text-red-600 hover:text-red-800 font-bold text-lg"
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

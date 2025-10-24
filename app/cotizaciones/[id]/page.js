'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'

export default function VerCotizacion() {
  const params = useParams()
  const router = useRouter()
  const [cotizacion, setCotizacion] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCotizacion()
  }, [params.id])

  const loadCotizacion = async () => {
    try {
      const [cotRes, itemsRes] = await Promise.all([
        supabase
          .from('cotizaciones')
          .select(`
            *,
            clientes (*)
          `)
          .eq('id', params.id)
          .single(),
        supabase
          .from('cotizacion_items')
          .select(`
            *,
            productos (name)
          `)
          .eq('cotizacion_id', params.id)
      ])

      setCotizacion(cotRes.data)
      setItems(itemsRes.data || [])
    } catch (error) {
      console.error('Error loading cotizacion:', error)
    } finally {
      setLoading(false)
    }
  }

  const generarPDF = async () => {
    alert('Función de generación de PDF próximamente')
    // Aquí se implementará la generación de PDF con jspdf
  }

  const generarJPG = async () => {
    alert('Función de generación de JPG próximamente')
    // Aquí se implementará la generación de imagen con html2canvas
  }

  const enviarWhatsApp = () => {
    if (!cotizacion?.clientes?.telefono) {
      alert('El cliente no tiene teléfono registrado')
      return
    }

    const mensaje = `Hola ${cotizacion.clientes.nombre}, te enviamos la cotización #${cotizacion.numero} por un valor de $${cotizacion.total?.toLocaleString('es-CO')}. Válida por ${cotizacion.validez_dias} días.`
    const url = `https://wa.me/${cotizacion.clientes.telefono}?text=${encodeURIComponent(mensaje)}`
    window.open(url, '_blank')
  }

  if (loading) {
    return <div className="text-center">Cargando...</div>
  }

  if (!cotizacion) {
    return <div className="text-center">Cotización no encontrada</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">
          Cotización #{cotizacion.numero}
        </h1>
        <button onClick={() => router.back()} className="btn-secondary">
          Volver
        </button>
      </div>

      {/* Acciones */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <button onClick={generarPDF} className="btn-primary">
            📄 Generar PDF
          </button>
          <button onClick={generarJPG} className="btn-primary">
            🖼️ Generar JPG
          </button>
          <button onClick={enviarWhatsApp} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition">
            📱 Enviar WhatsApp
          </button>
          <button 
            onClick={() => router.push(`/cotizaciones`)}
            className="btn-secondary"
          >
            📋 Ver Todas
          </button>
        </div>
      </div>

      {/* Información */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Información del Cliente</h3>
          <div className="space-y-2">
            <div>
              <span className="text-gray-600">Nombre:</span>
              <span className="ml-2 font-medium">{cotizacion.clientes?.nombre}</span>
            </div>
            <div>
              <span className="text-gray-600">Teléfono:</span>
              <span className="ml-2 font-medium">{cotizacion.clientes?.telefono}</span>
            </div>
            {cotizacion.clientes?.nit && (
              <div>
                <span className="text-gray-600">NIT:</span>
                <span className="ml-2 font-medium">{cotizacion.clientes.nit}</span>
              </div>
            )}
            {cotizacion.clientes?.email && (
              <div>
                <span className="text-gray-600">Email:</span>
                <span className="ml-2 font-medium">{cotizacion.clientes.email}</span>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Información de la Cotización</h3>
          <div className="space-y-2">
            <div>
              <span className="text-gray-600">Fecha:</span>
              <span className="ml-2 font-medium">
                {cotizacion.fecha ? format(new Date(cotizacion.fecha), 'dd/MM/yyyy') : '-'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Validez:</span>
              <span className="ml-2 font-medium">{cotizacion.validez_dias} días</span>
            </div>
            <div>
              <span className="text-gray-600">Estado:</span>
              <span className="ml-2 font-medium capitalize">{cotizacion.estado}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Productos</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2">Producto</th>
                <th className="text-center py-2 px-2">Cantidad</th>
                <th className="text-right py-2 px-2">Precio Unit.</th>
                <th className="text-right py-2 px-2">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b">
                  <td className="py-2 px-2">{item.productos?.name}</td>
                  <td className="py-2 px-2 text-center">{item.cantidad}</td>
                  <td className="py-2 px-2 text-right">
                    ${item.precio_unitario?.toLocaleString('es-CO')}
                  </td>
                  <td className="py-2 px-2 text-right font-medium">
                    ${item.subtotal?.toLocaleString('es-CO')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totales */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Totales</h3>
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">${cotizacion.subtotal?.toLocaleString('es-CO')}</span>
          </div>
          {cotizacion.descuento > 0 && (
            <div className="flex justify-between text-red-600">
              <span>Descuento ({cotizacion.descuento}%):</span>
              <span>-${((cotizacion.subtotal * cotizacion.descuento) / 100).toLocaleString('es-CO')}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">IVA ({cotizacion.iva}%):</span>
            <span className="font-medium">
              ${(((cotizacion.subtotal * (1 - cotizacion.descuento / 100)) * cotizacion.iva) / 100).toLocaleString('es-CO')}
            </span>
          </div>
          <div className="flex justify-between text-xl font-bold border-t pt-2">
            <span>Total:</span>
            <span>${cotizacion.total?.toLocaleString('es-CO')}</span>
          </div>
        </div>

        {cotizacion.observaciones && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Observaciones:</h4>
            <p className="text-gray-600">{cotizacion.observaciones}</p>
          </div>
        )}
      </div>
    </div>
  )
}

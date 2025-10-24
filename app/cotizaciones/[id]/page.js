'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

export default function VerCotizacion() {
  const params = useParams()
  const router = useRouter()
  const [cotizacion, setCotizacion] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const printRef = useRef(null)

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
            productos (product_name, image_url_png, description)
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
    try {
      const doc = new jsPDF()
      
      // Configuración de colores - ROJO
      const primaryColor = [240, 0, 0] // Rojo #f00000
      const textColor = [51, 51, 51]
      
      // Encabezado con logo
      doc.setFillColor(...primaryColor)
      doc.rect(0, 0, 210, 40, 'F')
      
      // Agregar logo
      try {
        const logoUrl = 'https://cxxifwpwarbrrodtzyqn.supabase.co/storage/v1/object/public/Logo/Logo%20Blanco.png'
        const logoImg = await fetch(logoUrl).then(r => r.blob()).then(blob => {
          return new Promise((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result)
            reader.readAsDataURL(blob)
          })
        })
        doc.addImage(logoImg, 'PNG', 15, 8, 25, 25)
      } catch (error) {
        console.log('Error cargando logo:', error)
      }
      
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(24)
      doc.setFont('helvetica', 'bold')
      doc.text('TINTAS Y TECNOLOGÍA', 105, 20, { align: 'center' })
      
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text('Soluciones Tecnológicas Profesionales', 105, 30, { align: 'center' })
      
      // Título de cotización
      doc.setTextColor(...textColor)
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text(`COTIZACIÓN #${cotizacion.numero}`, 20, 55)
      
      // Información del cliente y cotización
      let yPos = 70
      
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('INFORMACIÓN DEL CLIENTE', 20, yPos)
      
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      yPos += 8
      doc.text(`Cliente: ${cotizacion.clientes?.nombre || 'N/A'}`, 20, yPos)
      yPos += 6
      doc.text(`Teléfono: ${cotizacion.clientes?.telefono || 'N/A'}`, 20, yPos)
      
      if (cotizacion.clientes?.nit) {
        yPos += 6
        doc.text(`NIT: ${cotizacion.clientes.nit}`, 20, yPos)
      }
      
      if (cotizacion.clientes?.email) {
        yPos += 6
        doc.text(`Email: ${cotizacion.clientes.email}`, 20, yPos)
      }
      
      // Información de la cotización (lado derecho)
      yPos = 70
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text('INFORMACIÓN DE LA COTIZACIÓN', 110, yPos)
      
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      yPos += 8
      doc.text(`Fecha: ${format(new Date(cotizacion.fecha), 'dd/MM/yyyy')}`, 110, yPos)
      yPos += 6
      doc.text(`Validez: ${cotizacion.validez_dias} días`, 110, yPos)
      yPos += 6
      doc.text(`Estado: ${cotizacion.estado}`, 110, yPos)
      
      // Tabla de productos con imágenes
      yPos = 110
      
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text('PRODUCTOS', 20, yPos)
      
      yPos += 10
      
      // Encabezados de tabla
      doc.setFillColor(240, 240, 240)
      doc.rect(20, yPos - 5, 170, 8, 'F')
      
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.text('Imagen', 24, yPos)
      doc.text('Producto', 50, yPos)
      doc.text('Cant.', 140, yPos, { align: 'center' })
      doc.text('Precio', 170, yPos, { align: 'right' })
      doc.text('Total', 190, yPos, { align: 'right' })
      
      yPos += 8
      
      // Items con imágenes y descripciones
      doc.setFont('helvetica', 'normal')
      for (let index = 0; index < items.length; index++) {
        const item = items[index]
        
        if (yPos > 240) {
          doc.addPage()
          yPos = 20
        }
        
        const startY = yPos
        
        // Cargar imagen del producto si existe
        if (item.productos?.image_url_png) {
          try {
            const imgData = await fetch(item.productos.image_url_png).then(r => r.blob()).then(blob => {
              return new Promise((resolve) => {
                const reader = new FileReader()
                reader.onloadend = () => resolve(reader.result)
                reader.readAsDataURL(blob)
              })
            })
            doc.addImage(imgData, 'PNG', 21, yPos, 15, 15)
          } catch (error) {
            console.log('Error cargando imagen del producto')
          }
        }
        
        // Nombre del producto
        const productName = item.productos?.product_name || 'Producto sin nombre'
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        const nameLines = doc.splitTextToSize(productName, 85)
        let currentY = yPos
        nameLines.slice(0, 2).forEach((line) => {
          doc.text(line, 40, currentY)
          currentY += 4
        })
        
        // Descripción resumida
        if (item.productos?.description) {
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(7)
          doc.setTextColor(100, 100, 100)
          const descLines = doc.splitTextToSize(item.productos.description, 85)
          descLines.slice(0, 2).forEach((line) => {
            if (currentY < startY + 15) {
              doc.text(line, 40, currentY)
              currentY += 3
            }
          })
          doc.setTextColor(...textColor)
        }
        
        // Cantidad, precio y total
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.text(item.cantidad.toString(), 140, yPos + 5, { align: 'center' })
        doc.text(`$${item.precio_unitario?.toLocaleString('es-CO')}`, 170, yPos + 5, { align: 'right' })
        doc.setFont('helvetica', 'bold')
        doc.text(`$${item.subtotal?.toLocaleString('es-CO')}`, 190, yPos + 5, { align: 'right' })
        
        yPos += 20
        
        if (index < items.length - 1) {
          doc.setDrawColor(230, 230, 230)
          doc.line(20, yPos - 2, 190, yPos - 2)
        }
      }
      
      // Totales - SIN IVA ADICIONAL (precios ya incluyen IVA)
      yPos += 10
      
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      
      if (cotizacion.descuento > 0) {
        doc.text('Subtotal:', 140, yPos)
        doc.text(`$${cotizacion.subtotal?.toLocaleString('es-CO')}`, 190, yPos, { align: 'right' })
        yPos += 6
        doc.setTextColor(220, 38, 38)
        doc.text(`Descuento (${cotizacion.descuento}%):`, 140, yPos)
        doc.text(`-$${((cotizacion.subtotal * cotizacion.descuento) / 100).toLocaleString('es-CO')}`, 190, yPos, { align: 'right' })
        doc.setTextColor(...textColor)
        yPos += 8
      }
      
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.setTextColor(...primaryColor)
      doc.text('TOTAL A PAGAR:', 140, yPos)
      doc.text(`$${cotizacion.total?.toLocaleString('es-CO')}`, 190, yPos, { align: 'right' })
      doc.setTextColor(...textColor)
      
      // Nota sobre IVA
      yPos += 8
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.text('* Precios incluyen IVA', 140, yPos)
      doc.setTextColor(...textColor)
      
      // Observaciones
      if (cotizacion.observaciones) {
        yPos += 15
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.text('OBSERVACIONES:', 20, yPos)
        
        yPos += 8
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        const obsLines = doc.splitTextToSize(cotizacion.observaciones, 170)
        obsLines.forEach(line => {
          if (yPos > 270) {
            doc.addPage()
            yPos = 20
          }
          doc.text(line, 20, yPos)
          yPos += 5
        })
      }
      
      // Footer
      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'italic')
        doc.setTextColor(150, 150, 150)
        doc.text(`Tintas y Tecnología - Cotización #${cotizacion.numero}`, 105, 285, { align: 'center' })
        doc.text(`Página ${i} de ${pageCount}`, 105, 290, { align: 'center' })
      }
      
      // Guardar PDF
      doc.save(`Cotizacion-${cotizacion.numero}.pdf`)
      
      alert('PDF generado exitosamente')
    } catch (error) {
      console.error('Error generando PDF:', error)
      alert('Error al generar el PDF. Por favor intente nuevamente.')
    }
  }

  const generarJPG = async () => {
    try {
      if (!printRef.current) {
        alert('Error: No se puede generar la imagen')
        return
      }

      // Mostrar el elemento temporalmente
      printRef.current.style.display = 'block'
      
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      })
      
      // Ocultar el elemento nuevamente
      printRef.current.style.display = 'none'
      
      // Convertir canvas a blob y descargar
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `Cotizacion-${cotizacion.numero}.jpg`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        
        alert('Imagen JPG generada exitosamente')
      }, 'image/jpeg', 0.95)
      
    } catch (error) {
      console.error('Error generando JPG:', error)
      alert('Error al generar la imagen. Por favor intente nuevamente.')
    }
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
    <>
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
                    <td className="py-2 px-2">{item.productos?.product_name || 'Producto'}</td>
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

      {/* Template para generación de JPG (oculto) */}
      <div ref={printRef} style={{ display: 'none', width: '800px', padding: '40px', backgroundColor: 'white', fontFamily: 'Arial, sans-serif' }}>
        {/* Encabezado con logo */}
        <div style={{ backgroundColor: '#f00000', padding: '30px', marginBottom: '30px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <img 
            src="https://cxxifwpwarbrrodtzyqn.supabase.co/storage/v1/object/public/Logo/Logo%20Blanco.png" 
            alt="Logo" 
            style={{ position: 'absolute', left: '20px', height: '60px', width: 'auto' }}
          />
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ color: 'white', fontSize: '32px', margin: '0', fontWeight: 'bold' }}>
              TINTAS Y TECNOLOGÍA
            </h1>
            <p style={{ color: 'white', fontSize: '16px', margin: '10px 0 0 0' }}>
              Soluciones Tecnológicas Profesionales
            </p>
          </div>
        </div>

        {/* Título */}
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '30px', color: '#333' }}>
          COTIZACIÓN #{cotizacion.numero}
        </h2>

        {/* Información */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px', color: '#333' }}>
              INFORMACIÓN DEL CLIENTE
            </h3>
            <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <p><strong>Cliente:</strong> {cotizacion.clientes?.nombre}</p>
              <p><strong>Teléfono:</strong> {cotizacion.clientes?.telefono}</p>
              {cotizacion.clientes?.nit && <p><strong>NIT:</strong> {cotizacion.clientes.nit}</p>}
              {cotizacion.clientes?.email && <p><strong>Email:</strong> {cotizacion.clientes.email}</p>}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px', color: '#333' }}>
              INFORMACIÓN DE LA COTIZACIÓN
            </h3>
            <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <p><strong>Fecha:</strong> {format(new Date(cotizacion.fecha), 'dd/MM/yyyy')}</p>
              <p><strong>Validez:</strong> {cotizacion.validez_dias} días</p>
              <p><strong>Estado:</strong> {cotizacion.estado}</p>
            </div>
          </div>
        </div>

        {/* Productos con imágenes */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px', color: '#333' }}>
            PRODUCTOS
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd', width: '80px' }}>Imagen</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Producto</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #ddd', width: '60px' }}>Cant.</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd', width: '100px' }}>Precio</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd', width: '100px' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                    {item.productos?.image_url_png && (
                      <img 
                        src={item.productos.image_url_png} 
                        alt="Producto" 
                        style={{ width: '60px', height: '60px', objectFit: 'contain' }}
                      />
                    )}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                      {item.productos?.product_name}
                    </div>
                    {item.productos?.description && (
                      <div style={{ fontSize: '11px', color: '#666', lineHeight: '1.4' }}>
                        {item.productos.description.substring(0, 100)}...
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #eee' }}>{item.cantidad}</td>
                  <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #eee' }}>
                    ${item.precio_unitario?.toLocaleString('es-CO')}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', borderBottom: '1px solid #eee' }}>
                    ${item.subtotal?.toLocaleString('es-CO')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totales - SIN IVA ADICIONAL */}
        <div style={{ marginLeft: 'auto', width: '350px', backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px' }}>
          {cotizacion.descuento > 0 && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
                <span>Subtotal:</span>
                <span style={{ fontWeight: 'bold' }}>${cotizacion.subtotal?.toLocaleString('es-CO')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '14px', color: '#dc2626' }}>
                <span>Descuento ({cotizacion.descuento}%):</span>
                <span>-${((cotizacion.subtotal * cotizacion.descuento) / 100).toLocaleString('es-CO')}</span>
              </div>
            </>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '15px', borderTop: '2px solid #ddd', fontSize: '20px', fontWeight: 'bold', color: '#f00000' }}>
            <span>TOTAL A PAGAR:</span>
            <span>${cotizacion.total?.toLocaleString('es-CO')}</span>
          </div>
          <div style={{ fontSize: '11px', color: '#666', fontStyle: 'italic', marginTop: '10px' }}>
            * Precios incluyen IVA
          </div>
        </div>

        {/* Observaciones */}
        {cotizacion.observaciones && (
          <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>OBSERVACIONES:</h4>
            <p style={{ fontSize: '13px', color: '#555', lineHeight: '1.6' }}>{cotizacion.observaciones}</p>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: '40px', textAlign: 'center', fontSize: '12px', color: '#888' }}>
          <p>Tintas y Tecnología - Cotización #{cotizacion.numero}</p>
        </div>
      </div>
    </>
  )
}

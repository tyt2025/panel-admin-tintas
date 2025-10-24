'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

export default function NuevoProducto() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [categorias, setCategorias] = useState([])
  const [subcategorias, setSubcategorias] = useState([])
  const [subcategoriasFiltradas, setSubcategoriasFiltradas] = useState([])
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  const [formData, setFormData] = useState({
    sku: '',
    product_name: '',
    category_id: '',
    subcategory_id: '',
    short_description: '',
    description: '',
    price_cop: '',
    brand: '',
    image_url_png: '',
    available_stock: 0,
    warranty_months: 0
  })

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }
    loadCategorias()
  }, [router])

  const loadCategorias = async () => {
    try {
      const [catRes, subRes] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('subcategories').select('*').order('name')
      ])

      setCategorias(catRes.data || [])
      setSubcategorias(subRes.data || [])
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const handleCategoryChange = (categoryId) => {
    setFormData({ ...formData, category_id: categoryId, subcategory_id: '' })
    
    // Filtrar subcategorías por categoría
    const filtered = subcategorias.filter(sub => sub.category_id === parseInt(categoryId))
    setSubcategoriasFiltradas(filtered)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido')
        return
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe superar los 5MB')
        return
      }

      setImageFile(file)
      
      // Crear preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async () => {
    if (!imageFile) return null

    try {
      setUploading(true)
      
      // Generar nombre único para la imagen
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `PRODUCTOS_IMAGENES/${fileName}`

      // Subir imagen a Supabase Storage
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Error al subir la imagen: ' + error.message)
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Subir imagen si hay una seleccionada
      let imageUrl = formData.image_url_png
      if (imageFile) {
        imageUrl = await uploadImage()
        if (!imageUrl) {
          setLoading(false)
          return
        }
      }

      const { data, error } = await supabase
        .from('productos')
        .insert([{
          sku: formData.sku,
          product_name: formData.product_name,
          category_id: formData.category_id || null,
          subcategory_id: formData.subcategory_id || null,
          short_description: formData.short_description,
          description: formData.description,
          price_cop: parseFloat(formData.price_cop) || 0,
          price: parseFloat(formData.price_cop) || 0,
          brand: formData.brand,
          image_url_png: imageUrl,
          main_image_url: imageUrl,
          available_stock: parseInt(formData.available_stock) || 0,
          warranty_months: parseInt(formData.warranty_months) || 0,
          is_active: true,
          is_featured: false
        }])
        .select()

      if (error) throw error

      alert('Producto creado exitosamente')
      router.push('/productos')
    } catch (error) {
      console.error('Error creating producto:', error)
      alert('Error al crear producto: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Nuevo Producto</h1>
        <button onClick={() => router.back()} className="btn-secondary">
          Volver
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Básica */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Información Básica</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SKU *
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({...formData, sku: e.target.value})}
                className="input-field"
                required
                placeholder="Ej: PROD-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Producto *
              </label>
              <input
                type="text"
                value={formData.product_name}
                onChange={(e) => setFormData({...formData, product_name: e.target.value})}
                className="input-field"
                required
                placeholder="Ej: Teclado Mecánico RGB"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marca
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({...formData, brand: e.target.value})}
                className="input-field"
                placeholder="Ej: Logitech"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio (COP) *
              </label>
              <input
                type="number"
                value={formData.price_cop}
                onChange={(e) => setFormData({...formData, price_cop: e.target.value})}
                className="input-field"
                required
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {/* Categorías */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Categorización</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="input-field"
              >
                <option value="">Selecciona una categoría</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subcategoría
              </label>
              <select
                value={formData.subcategory_id}
                onChange={(e) => setFormData({...formData, subcategory_id: e.target.value})}
                className="input-field"
                disabled={!formData.category_id}
              >
                <option value="">Selecciona una subcategoría</option>
                {subcategoriasFiltradas.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Descripción */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Descripción</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción Corta
              </label>
              <input
                type="text"
                value={formData.short_description}
                onChange={(e) => setFormData({...formData, short_description: e.target.value})}
                className="input-field"
                placeholder="Breve descripción del producto"
                maxLength="200"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.short_description.length}/200 caracteres
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción Completa
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="input-field"
                rows="5"
                placeholder="Descripción detallada del producto..."
              />
            </div>
          </div>
        </div>

        {/* Inventario e Imagen */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Inventario e Imagen</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Disponible
              </label>
              <input
                type="number"
                value={formData.available_stock}
                onChange={(e) => setFormData({...formData, available_stock: e.target.value})}
                className="input-field"
                min="0"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Garantía (meses)
              </label>
              <input
                type="number"
                value={formData.warranty_months}
                onChange={(e) => setFormData({...formData, warranty_months: e.target.value})}
                className="input-field"
                min="0"
                placeholder="0"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagen del Producto
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">
                Tamaño máximo: 5MB. Formatos: JPG, PNG, WEBP, GIF
              </p>
              
              {imagePreview && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Vista previa:</p>
                  <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || uploading}
            className="flex-1 btn-primary disabled:opacity-50"
          >
            {uploading ? 'Subiendo imagen...' : loading ? 'Guardando...' : 'Crear Producto'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 btn-secondary"
            disabled={loading || uploading}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

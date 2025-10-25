'use client'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [phoneNumber, setPhoneNumber] = useState('')

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      
      // Asignar número de teléfono según el usuario
      if (parsedUser.usuario === 'tintasytecnologia1') {
        setPhoneNumber('3102605693')
      } else if (parsedUser.usuario === 'tintasytecnologia2') {
        setPhoneNumber('3122405144')
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    router.push('/login')
  }

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Cotizaciones', path: '/cotizaciones', icon: '📋' },
    { name: 'Clientes', path: '/clientes', icon: '👥' },
    { name: 'Productos', path: '/productos', icon: '📦' },
    { name: 'Reportes', path: '/reportes', icon: '📈' },
  ]

  return (
    <aside className="w-64 bg-white shadow-lg min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex flex-col items-center">
          <Image
            src="https://cxxifwpwarbrrodtzyqn.supabase.co/storage/v1/object/public/Logo/logo%20circulo.png"
            alt="Tintas y Tecnología"
            width={120}
            height={120}
            className="mb-3"
            priority
          />
          <h2 className="text-xl font-bold text-gray-800 text-center">Tintas y Tecnología</h2>
        </div>
        {user && (
          <div className="mt-3 text-center">
            <p className="text-sm text-gray-600 font-medium">{user.nombre}</p>
            <p className="text-xs text-gray-500">Vendedor #{user.vendedor_id}</p>
          </div>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <button
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition duration-200 ${
                  pathname === item.path
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t space-y-3">
        {phoneNumber && (
          <div className="text-center pb-3 border-b">
            <p className="text-xs text-gray-500 mb-1">Teléfono</p>
            <a 
              href={`tel:${phoneNumber}`}
              className="text-blue-600 font-semibold hover:text-blue-700 text-sm"
            >
              📞 {phoneNumber}
            </a>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full btn-danger"
        >
          Cerrar Sesión
        </button>
      </div>
    </aside>
  )
}

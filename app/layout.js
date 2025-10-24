import './globals.css'

export const metadata = {
  title: 'Panel Admin - Tintas y Tecnología',
  description: 'Sistema completo de cotizaciones',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}

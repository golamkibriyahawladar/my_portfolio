import { ProductSchemaData, generateProductSchema } from '@/lib/geo'

interface ProductSchemaProps {
  product: ProductSchemaData
  brandName?: string
  baseUrl?: string
}

export function ProductSchema({
  product,
  brandName = 'Golam Kibriya Hawladar',
  baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://golamkibriya.me',
}: ProductSchemaProps) {
  if (!product || !product.name) return null

  const schema = generateProductSchema(product, brandName, baseUrl)

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

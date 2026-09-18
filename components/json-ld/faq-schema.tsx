import { FAQItem, generateFaqSchema } from '@/lib/geo'

interface FaqSchemaProps {
  items: FAQItem[]
}

export function FaqSchema({ items }: FaqSchemaProps) {
  if (!items || items.length === 0) return null

  const schema = generateFaqSchema(items)

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

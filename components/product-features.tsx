import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"

interface Feature {
  name: string
  value: string
}

interface ProductFeaturesProps {
  features: Feature[]
}

export function ProductFeatures({ features }: ProductFeaturesProps) {
  if (!features || features.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Características</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <dt className="font-medium text-sm">{feature.name}</dt>
                <dd className="text-sm text-muted-foreground mt-0.5">{feature.value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  )
}

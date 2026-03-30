import type { CourseModel, ItemVariant } from '@/types/content'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'

interface CourseCardProps {
  variant: ItemVariant
  data: CourseModel
}

export function CourseCard({ variant, data }: CourseCardProps) {
  if (variant === 'sm') {
    return (
      <Card className="overflow-hidden">
        <div className="aspect-video relative bg-muted">
          {data.thumbnailUrl && (
            <Image src={data.thumbnailUrl} alt={data.title} fill className="object-cover" />
          )}
        </div>
        <CardContent className="p-3">
          <p className="font-medium text-sm line-clamp-1">{data.title}</p>
        </CardContent>
      </Card>
    )
  }

  if (variant === 'brick') {
    return (
      <Card className="flex overflow-hidden">
        <div className="w-32 relative shrink-0 bg-muted">
          {data.thumbnailUrl && (
            <Image src={data.thumbnailUrl} alt={data.title} fill className="object-cover" />
          )}
        </div>
        <CardContent className="p-4 flex-1">
          <p className="font-medium line-clamp-1">{data.title}</p>
          <p className="text-sm text-muted-foreground">{data.instructor}</p>
        </CardContent>
      </Card>
    )
  }

  // md and lg
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video relative bg-muted">
        {data.thumbnailUrl && (
          <Image src={data.thumbnailUrl} alt={data.title} fill className="object-cover" />
        )}
      </div>
      <CardHeader className="p-4">
        <p className="font-medium line-clamp-2">{data.title}</p>
        <Badge variant="secondary" className="w-fit">
          {data.instructor}
        </Badge>
        {variant === 'lg' && (
          <p className="text-sm text-muted-foreground line-clamp-2">{data.description}</p>
        )}
      </CardHeader>
    </Card>
  )
}

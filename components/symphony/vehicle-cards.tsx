"use client"

import { cn } from "@/lib/utils"
import type { Vehicle } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Gauge, Calendar, Palette } from "lucide-react"

const statusStyles: Record<string, { className: string }> = {
  "in-inspection": { className: "bg-warning/15 text-warning border-warning/30" },
  listed: { className: "bg-success/15 text-success border-success/30" },
  sold: { className: "bg-muted text-muted-foreground border-border" },
  "pending-purchase": { className: "bg-primary/15 text-primary border-primary/30" },
}

function formatPrice(price: number) {
  if (price === 0) return "---"
  return `${(price / 10000).toFixed(0)}万円`
}

export function VehicleCards({ vehicles }: { vehicles: Vehicle[] }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold text-foreground">在庫車両</h2>
        <span className="text-xs text-muted-foreground">{vehicles.length}台</span>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className="group overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-primary/30"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
              <img
                src={vehicle.imageUrl}
                alt={`${vehicle.make} ${vehicle.model}`}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                crossOrigin="anonymous"
              />
              <Badge
                variant="outline"
                className={cn(
                  "absolute right-2 top-2 text-[10px]",
                  statusStyles[vehicle.status]?.className
                )}
              >
                {vehicle.statusJa}
              </Badge>
            </div>
            <div className="p-2.5">
              <p className="text-sm font-semibold text-foreground">
                {vehicle.make} {vehicle.model}
              </p>
              <div className="mt-1.5 flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-0.5">
                  <Calendar className="h-2.5 w-2.5" />
                  {vehicle.year}
                </span>
                <span className="flex items-center gap-0.5">
                  <Gauge className="h-2.5 w-2.5" />
                  {(vehicle.mileage / 1000).toFixed(0)}{"K km"}
                </span>
                <span className="flex items-center gap-0.5">
                  <Palette className="h-2.5 w-2.5" />
                  {vehicle.colorJa}
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <p className="text-base font-bold text-foreground">
                  {formatPrice(vehicle.suggestedPrice)}
                </p>
                {vehicle.purchasePrice > 0 && (
                  <p className="text-[10px] text-muted-foreground">
                    {"仕入: "}{formatPrice(vehicle.purchasePrice)}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function AdvertiserDetailsSkeleton() {
  return (
    <div className="max-w-7xl w-full mx-auto p-8 space-y-6">
      {/* Profile Header Skeleton */}
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="flex items-center gap-6 p-6">
          <Skeleton className="w-32 h-32 rounded-full" />
          <div className="space-y-3">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-5 w-36" />
          </div>
        </CardContent>
      </Card>

      {/* Contact Form Skeleton */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-44" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Business Form Skeleton */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-52" />
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-[7fr_3fr] gap-6">
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
              <div className="col-span-2 space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from "react"
import { CirclePlus, Package, Pencil, Power, PowerOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "../../lib/utils"
import PackageForm from "./package_form"
import { useSetPackageActiveCommand } from "../../Composable/Command/adPackage/useSetPackageActiveCommand"
import { daysLabel, type AdPackageResponse } from "../../dto/response/adPackage/adPackageResponse"

/** The package catalogue: add, edit, and switch packages on or off. Packages are never deleted. */
export function PackageTable({ packages }: { packages: AdPackageResponse[] }) {
    const [editing, setEditing] = useState<AdPackageResponse | "new" | null>(null)
    const [toggling, setToggling] = useState<AdPackageResponse | null>(null)
    const { setPackageActiveCommand, isPending } = useSetPackageActiveCommand()

    const confirmToggle = async () => {
        if (!toggling) return
        try {
            await setPackageActiveCommand({ id: toggling.id, isActive: !toggling.isActive })
            setToggling(null)
        } catch {
            // The command already shows why.
        }
    }

    return (
        <Card className="rounded-2xl shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                    <CardTitle>Packages</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                        What customers buy when they create an ad. They pick a package and how many units; objectives are added on top.
                    </p>
                </div>
                <Button size="sm" onClick={() => setEditing("new")}>
                    <CirclePlus className="h-4 w-4" /> Add package
                </Button>
            </CardHeader>
            <CardContent>
                {packages.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-12 text-center">
                        <div className="rounded-full bg-muted/60 p-3"><Package className="h-6 w-6 text-muted-foreground" /></div>
                        <p className="font-medium">No packages yet</p>
                        <p className="max-w-sm text-sm text-muted-foreground">Customers can't create ads until at least one package is active.</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Package</TableHead>
                                <TableHead className="text-right">Per unit</TableHead>
                                <TableHead className="text-right">Price per unit</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Order</TableHead>
                                <TableHead className="w-24" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {packages.map((p) => (
                                <TableRow key={p.id} className={cn(!p.isActive && "text-muted-foreground")}>
                                    <TableCell>
                                        <div className="font-medium">{p.name}</div>
                                        {p.description && <div className="max-w-md truncate text-xs text-muted-foreground">{p.description}</div>}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">{daysLabel(p.durationDays)}</TableCell>
                                    <TableCell className="text-right tabular-nums">{p.price.toLocaleString()} pts</TableCell>
                                    <TableCell>
                                        <span className={cn(
                                            "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
                                            p.isActive ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" : "bg-muted text-muted-foreground",
                                        )}>
                                            <span className={cn("size-1.5 rounded-full", p.isActive ? "bg-emerald-500" : "bg-muted-foreground/60")} />
                                            {p.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums">{p.sortOrder}</TableCell>
                                    <TableCell>
                                        <div className="flex justify-end gap-1">
                                            <Button size="icon" variant="ghost" className="h-8 w-8" aria-label={`Edit ${p.name}`} onClick={() => setEditing(p)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8"
                                                aria-label={p.isActive ? `Deactivate ${p.name}` : `Activate ${p.name}`}
                                                onClick={() => setToggling(p)}>
                                                {p.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>

            <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
                <DialogContent className="sm:max-w-lg rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>{editing === "new" ? "Add package" : "Edit package"}</DialogTitle>
                        <DialogDescription>Days and price are per unit; customers choose how many units to buy.</DialogDescription>
                    </DialogHeader>
                    {editing !== null && (
                        <PackageForm
                            key={editing === "new" ? "new" : editing.id}
                            pkg={editing === "new" ? undefined : editing}
                            onDone={() => setEditing(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={toggling !== null} onOpenChange={(open) => !open && setToggling(null)}>
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>{toggling?.isActive ? `Deactivate ${toggling?.name}?` : `Activate ${toggling?.name}?`}</DialogTitle>
                        <DialogDescription>
                            {toggling?.isActive
                                ? "Customers can no longer pick it for new ads. Ads already bought with it keep running and can still be extended."
                                : "Customers can pick it again for new ads."}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setToggling(null)} disabled={isPending}>Cancel</Button>
                        <Button variant={toggling?.isActive ? "destructive" : "default"} onClick={confirmToggle} disabled={isPending}>
                            {toggling?.isActive ? "Deactivate" : "Activate"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    )
}

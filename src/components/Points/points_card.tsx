import { Coins } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { cn } from "../../lib/utils"
import { useWalletQuery } from "../../Composable/Query/points/useWalletQuery"
import { POINT_TYPE_LABELS } from "../../dto/response/points/pointsResponse"

// Balance and history of an account's points wallet (standalone advertisers and agencies only).
export default function PointsCard({ accountId }: { accountId: string }) {
    const { wallet, isLoading } = useWalletQuery(accountId);

    return (
        <Card className="rounded-2xl shadow-sm">
            <CardHeader className="flex justify-between items-center">
                <CardTitle className="flex flex-row gap-3 items-center text-xl">
                    <Coins size={24} className="text-primary" /> Points
                </CardTitle>
                <span className="text-2xl font-bold">
                    {isLoading ? "…" : (wallet?.balance ?? 0).toLocaleString()}
                    <span className="ml-1 text-sm font-normal text-muted-foreground">points</span>
                </span>
            </CardHeader>
            <CardContent>
                <div className="overflow-hidden rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-right">Points</TableHead>
                                <TableHead className="text-right">Balance</TableHead>
                                <TableHead>Note</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(wallet?.history ?? []).length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-16 text-center text-muted-foreground">No points activity yet.</TableCell>
                                </TableRow>
                            ) : (
                                wallet!.history.map((entry) => (
                                    <TableRow key={entry.id}>
                                        <TableCell>{new Date(entry.createdAt).toLocaleString()}</TableCell>
                                        <TableCell>{POINT_TYPE_LABELS[entry.type] ?? entry.type}</TableCell>
                                        <TableCell className={cn("text-right font-medium", entry.amount >= 0 ? "text-green-600" : "text-destructive")}>
                                            {entry.amount >= 0 ? "+" : ""}{entry.amount.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right">{entry.balanceAfter.toLocaleString()}</TableCell>
                                        <TableCell className="text-muted-foreground">{entry.note ?? "—"}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}

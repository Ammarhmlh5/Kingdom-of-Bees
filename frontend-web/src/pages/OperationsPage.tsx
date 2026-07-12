import { Link, useSearchParams } from "react-router-dom";
import { useOperations } from "@/hooks/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, GitMerge, GitFork, AlertTriangle, History } from "lucide-react";

export function OperationsPage() {
    const [searchParams] = useSearchParams();
    const apiaryId = searchParams.get('apiaryId');

    const { data, isLoading: loading } = useOperations(apiaryId || undefined);

    // Transform data to match expected structure
    const operations = data || { splits: [], merges: [], swarms: [] };

    if (!apiaryId) {
        return <div className="p-8 text-center text-muted-foreground">يرجى تحديد المنحل لعرض العمليات</div>;
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <History className="w-8 h-8 text-amber-600" />
                        سجل العمليات
                    </h1>
                    <p className="text-muted-foreground mt-1">تاريخ التقسيم، الدمج، وأحداث التطريد</p>
                </div>
                <div className="flex gap-2">
                    <Link to={`/operations/split?apiaryId=${apiaryId}`}>
                        <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                            <GitFork className="w-4 h-4" />
                            تقسيم خلية
                        </Button>
                    </Link>
                    <Link to={`/operations/merge?apiaryId=${apiaryId}`}>
                        <Button variant="outline" className="gap-2">
                            <GitMerge className="w-4 h-4" />
                            دمج خلايا
                        </Button>
                    </Link>
                    <Link to={`/operations/swarm?apiaryId=${apiaryId}`}>
                        <Button variant="secondary" className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            تسجيل طرد
                        </Button>
                    </Link>
                </div>
            </div>

            <Tabs defaultValue="all" className="w-full">
                <TabsList>
                    <TabsTrigger value="all">الكل</TabsTrigger>
                    <TabsTrigger value="splits">التقسيمات ({operations.splits.length})</TabsTrigger>
                    <TabsTrigger value="merges">الدمج ({operations.merges.length})</TabsTrigger>
                    <TabsTrigger value="swarms">التطريد ({operations.swarms.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4 mt-4">
                    {/* Combine and sort by date descending could be better, simplified view here */}
                    <div className="grid gap-4">
                        {[...operations.splits, ...operations.merges, ...operations.swarms]
                            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                            .map((item: any, idx: number) => {
                                // Determine type based on props
                                const isSplit = item.motherHiveId !== undefined;
                                const isMerge = item.survivorHiveId !== undefined;
                                const isSwarm = item.swarmDate !== undefined;

                                return (
                                    <Card key={idx} className="hover:bg-slate-50 transition">
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                {isSplit && <div className="p-2 bg-blue-100 rounded-full"><GitFork className="w-5 h-5 text-blue-600" /></div>}
                                                {isMerge && <div className="p-2 bg-purple-100 rounded-full"><GitMerge className="w-5 h-5 text-purple-600" /></div>}
                                                {isSwarm && <div className="p-2 bg-yellow-100 rounded-full"><AlertTriangle className="w-5 h-5 text-yellow-600" /></div>}

                                                <div>
                                                    <div className="font-semibold text-lg">
                                                        {isSplit && `تقسيم خلية`}
                                                        {isMerge && `دمج خلايا`}
                                                        {isSwarm && `حدث تطريد`}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {new Date(item.splitDate || item.mergeDate || item.swarmDate).toLocaleDateString('ar-SA')}
                                                    </div>
                                                </div>
                                            </div>
                                            <Badge variant="outline">
                                                {isSplit ? `${item.newHivesCount} خلايا جديدة` : ''}
                                                {isMerge ? `الناجية: خ-${item.survivorHiveId?.slice(0, 4)}` : ''}
                                                {isSwarm ? (item.captured ? 'تم الإمساك' : 'هربت') : ''}
                                            </Badge>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                    </div>
                </TabsContent>
                {/* Can implement specific tabs later */}
            </Tabs>
        </div>
    );
}

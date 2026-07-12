
import { ShoppingBag, Tag, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function MarketplacePage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Marketplace</h1>
                    <p className="text-muted-foreground">Manage your products and sales channels.</p>
                </div>
                <Button className="bg-primary hover:bg-primary/90 text-secondary font-bold">
                    <Plus className="w-4 h-4 mr-2" /> Add Product
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Mock Product Card */}
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="bg-card/40 border-border/50 backdrop-blur-md group hover:border-primary/50 transition-all cursor-pointer">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <Tag className="w-8 h-8 text-primary mb-2 p-1.5 bg-primary/20 rounded-md" />
                                <span className="text-xs font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">IN STOCK</span>
                            </div>
                            <CardTitle className="text-lg">Premium Wildflux Honey</CardTitle>
                            <CardDescription>Batch #GR-2025-00{i}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-2xl font-bold tabular-nums">$45.00</p>
                                    <p className="text-xs text-muted-foreground">per 1kg jar</p>
                                </div>
                                <Button size="sm" variant="secondary" className="group-hover:bg-primary group-hover:text-secondary opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                    Edit Details
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                <Card className="bg-secondary/20 border-border border-dashed flex flex-col items-center justify-center p-8 hover:bg-secondary/40 transition-colors cursor-pointer">
                    <ShoppingBag className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                    <p className="font-medium text-muted-foreground">Create New Product</p>
                </Card>
            </div>
        </div>
    );
}

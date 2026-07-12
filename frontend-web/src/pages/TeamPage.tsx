
import { Users, Shield, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function TeamPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Team Management</h1>
                    <p className="text-muted-foreground">Control access and roles for your apiaries.</p>
                </div>
                <div className="flex gap-2">
                    <Input placeholder="Invite by email..." className="w-64 bg-card/50" />
                    <Button variant="outline"><Mail className="w-4 h-4 mr-2" /> Invite</Button>
                </div>
            </div>

            <div className="space-y-4">
                {/* Team Member Row */}
                <Card className="bg-card/40 border-border/50 backdrop-blur-md">
                    <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                A
                            </div>
                            <div>
                                <p className="font-medium">Ammar H.</p>
                                <p className="text-xs text-muted-foreground">ammar@example.com</p>
                            </div>
                            <span className="ml-4 flex items-center gap-1 text-xs font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                                <Shield className="w-3 h-3" /> OWNER
                            </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Last active: Just now
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/40 border-border/50 backdrop-blur-md">
                    <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                                J
                            </div>
                            <div>
                                <p className="font-medium">John Beekeeper</p>
                                <p className="text-xs text-muted-foreground">john@example.com</p>
                            </div>
                            <span className="ml-4 flex items-center gap-1 text-xs font-medium text-secondary-foreground bg-secondary px-2 py-0.5 rounded-full">
                                WORKER
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <Button size="sm" variant="ghost">Edit</Button>
                            <Button size="sm" variant="ghost" className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10">Remove</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

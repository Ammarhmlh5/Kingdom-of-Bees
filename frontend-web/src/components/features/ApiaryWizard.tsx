
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Info, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface WizardData {
    name: string;
    location: string;
    hiveCount: string;
    notes: string;
}

export function ApiaryWizard() {
    const [currentStep, setCurrentStep] = useState(1);
    const [isOpen, setIsOpen] = useState(false);
    const [data, setData] = useState<WizardData>({ name: '', location: '', hiveCount: '', notes: '' });

    const steps = [
        { id: 1, title: 'Location', icon: MapPin },
        { id: 2, title: 'Details', icon: Info },
        { id: 3, title: 'Confirm', icon: CheckCircle2 },
    ];

    const handleNext = () => {
        if (currentStep < 3) setCurrentStep(c => c + 1);
        else {
            // Submit logic here
            console.log("Submitting:", data);
            setIsOpen(false);
            setCurrentStep(1);
            setData({ name: '', location: '', hiveCount: '', notes: '' });
        }
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(c => c - 1);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="bg-primary text-secondary font-bold shadow-lg hover:shadow-primary/20 transition-all">
                    + New Apiary
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] border-amber-500/20 bg-background/95 backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-amber-200 bg-clip-text text-transparent">
                        Create New Apiary
                    </DialogTitle>
                    <DialogDescription>
                        Launch a new smart apiary location in 3 simple steps.
                    </DialogDescription>
                </DialogHeader>

                {/* Stepper */}
                <div className="flex justify-between items-center my-6 px-8 relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-secondary -z-10" />
                    <div
                        className="absolute top-1/2 left-0 h-0.5 bg-primary -z-10 transition-all duration-500"
                        style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                    />

                    {steps.map((step) => {
                        const Icon = step.icon;
                        const isActive = currentStep >= step.id;
                        return (
                            <div key={step.id} className="flex flex-col items-center bg-background px-2">
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                                    isActive
                                        ? "border-primary bg-primary text-secondary shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                                        : "border-muted-foreground text-muted-foreground bg-card"
                                )}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className={cn(
                                    "text-xs mt-2 font-medium transition-colors",
                                    isActive ? "text-primary" : "text-muted-foreground"
                                )}>{step.title}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Dynamic Content */}
                <div className="min-h-[300px] py-4">
                    <AnimatePresence mode="wait">
                        {currentStep === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <div className="h-40 rounded-lg border-2 border-dashed border-primary/20 bg-secondary/30 flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/50 transition-colors">
                                    <MapPin className="w-8 h-8 text-primary mb-2 opacity-50" />
                                    <p className="text-sm text-muted-foreground">Click to Pin Location (Placeholder)</p>
                                </div>
                                <div className="grid w-full items-center gap-1.5">
                                    <Label htmlFor="location">Location Name / Coordinates</Label>
                                    <Input
                                        id="location"
                                        placeholder="e.g. North Valley Farm"
                                        value={data.location}
                                        onChange={e => setData({ ...data, location: e.target.value })}
                                    />
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <div className="grid w-full items-center gap-1.5">
                                    <Label htmlFor="name">Apiary Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g. Golden Harvest Alpha"
                                        value={data.name}
                                        onChange={e => setData({ ...data, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid w-full items-center gap-1.5">
                                    <Label htmlFor="hives">Initial Hive Count</Label>
                                    <Input
                                        id="hives"
                                        type="number"
                                        placeholder="10"
                                        value={data.hiveCount}
                                        onChange={e => setData({ ...data, hiveCount: e.target.value })}
                                    />
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <Card className="bg-secondary/20 border-primary/20 p-4">
                                    <h3 className="font-semibold text-primary mb-4 flex items-center">
                                        <CheckCircle2 className="w-5 h-5 mr-2" /> Summary
                                    </h3>
                                    <dl className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <dt className="text-muted-foreground">Location:</dt>
                                            <dd>{data.location || 'Not set'}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-muted-foreground">Name:</dt>
                                            <dd>{data.name || 'Not set'}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-muted-foreground">Hives:</dt>
                                            <dd>{data.hiveCount || '0'}</dd>
                                        </div>
                                    </dl>
                                </Card>
                                <div className="p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-xs text-indigo-300">
                                    ⓘ AI forecasting will initiate automatically upon creation.
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <DialogFooter className="flex justify-between sm:justify-between w-full">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        disabled={currentStep === 1}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" /> Back
                    </Button>
                    <Button onClick={handleNext} className="min-w-[100px]">
                        {currentStep === 3 ? 'Launch Apiary' : 'Next'}
                        {currentStep !== 3 && <ChevronRight className="w-4 h-4 ml-1" />}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

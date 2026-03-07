import { useState } from 'react';
import { 
  Wrench, 
  Scale, 
  Activity, 
  Ruler, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Printer,
  QrCode,
  ClipboardList,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { BagBlueprint, HardwareReading } from '@/types';

interface PhaseWorkshopProps {
  blueprint: BagBlueprint | null;
}

// Simulated hardware reading
const simulateHardwareReading = (device: HardwareReading['device'], targetValue: number): HardwareReading => {
  const variance = () => (Math.random() - 0.5) * 0.02;
  const measured = targetValue * (1 + variance());
  const tolerance = device === 'moi_scale' ? 25 : device === 'frequency_analyzer' ? 3 : 0.5;
  const deviation = Math.abs(measured - targetValue);
  const status = deviation <= tolerance ? 'pass' : deviation <= tolerance * 2 ? 'pending' : 'fail';
  
  return {
    timestamp: new Date(),
    device,
    clubId: '',
    measurements: { value: Math.round(measured * 10) / 10 },
    status,
    tolerance,
  };
};

export function PhaseWorkshop({ blueprint }: PhaseWorkshopProps) {
  const [activeTab, setActiveTab] = useState('buildsheet');
  const [readings, setReadings] = useState<Map<string, HardwareReading[]>>(new Map());
  const [scanning, setScanning] = useState<string | null>(null);

  const handleSimulateReading = (clubId: string, device: HardwareReading['device'], targetValue: number) => {
    setScanning(clubId);
    setTimeout(() => {
      const reading = simulateHardwareReading(device, targetValue);
      reading.clubId = clubId;
      
      setReadings(prev => {
        const newMap = new Map(prev);
        const clubReadings = newMap.get(clubId) || [];
        newMap.set(clubId, [...clubReadings, reading]);
        return newMap;
      });
      setScanning(null);
    }, 1500);
  };

  const getLatestReading = (clubId: string, device: HardwareReading['device']) => {
    const clubReadings = readings.get(clubId) || [];
    return clubReadings.filter(r => r.device === device).pop();
  };

  const getStatusIcon = (status: HardwareReading['status']) => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />;
      case 'fail': return <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />;
      case 'pending': return <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />;
    }
  };

  if (!blueprint) {
    return (
      <Card className="glass-panel">
        <CardContent className="p-8 sm:p-12 text-center">
          <Wrench className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-base sm:text-lg font-semibold mb-2">No Blueprint Available</h3>
          <p className="text-sm text-muted-foreground">
            Complete the Full Bag MOI Blueprint phase first.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-10 sm:h-11">
          <TabsTrigger value="buildsheet" className="text-xs sm:text-sm gap-1.5">
            <ClipboardList className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Build Sheet</span>
            <span className="sm:hidden">Build</span>
          </TabsTrigger>
          <TabsTrigger value="validation" className="text-xs sm:text-sm gap-1.5">
            <Scale className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Validation</span>
            <span className="sm:hidden">Valid</span>
          </TabsTrigger>
          <TabsTrigger value="qr" className="text-xs sm:text-sm gap-1.5">
            <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>QR</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="buildsheet" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
          <Card className="glass-panel">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-base sm:text-lg">Workshop Build Sheet</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    {blueprint.name} • {blueprint.clubs.length} clubs
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" className="h-9 w-fit">
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] sm:h-[500px]">
                <div className="space-y-3 sm:space-y-4 pr-2">
                  {blueprint.buildSheet.map((club, index) => {
                    const assembly = blueprint.clubs[index];
                    return (
                      <Card key={index} className="border-border/50">
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs sm:text-sm font-bold shrink-0">
                                {index + 1}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-sm sm:text-base capitalize">{club.club}</div>
                                <div className="text-[10px] sm:text-xs text-muted-foreground truncate">
                                  {club.head} • {club.shaft}
                                </div>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-[10px] sm:text-xs shrink-0">
                              MOI: {club.moi}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs sm:text-sm">
                            <div className="p-2 sm:p-2.5 rounded bg-secondary/50">
                              <div className="text-muted-foreground text-[10px] sm:text-xs mb-0.5">Length</div>
                              <div className="font-mono font-medium">{club.length}&quot;</div>
                            </div>
                            <div className="p-2 sm:p-2.5 rounded bg-secondary/50">
                              <div className="text-muted-foreground text-[10px] sm:text-xs mb-0.5">Lie</div>
                              <div className="font-mono font-medium">{club.lie}°</div>
                            </div>
                            <div className="p-2 sm:p-2.5 rounded bg-secondary/50">
                              <div className="text-muted-foreground text-[10px] sm:text-xs mb-0.5">Swingwt</div>
                              <div className="font-mono font-medium">{club.swingweight}</div>
                            </div>
                            <div className="p-2 sm:p-2.5 rounded bg-secondary/50">
                              <div className="text-muted-foreground text-[10px] sm:text-xs mb-0.5">Freq</div>
                              <div className="font-mono font-medium">{club.frequency} CPM</div>
                            </div>
                          </div>

                          {assembly && (
                            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border">
                              <div className="text-[10px] sm:text-xs font-medium text-muted-foreground mb-2">BUILD INSTRUCTIONS</div>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] sm:text-xs">
                                <div>
                                  <span className="text-muted-foreground">Tip:</span>
                                  <span className="ml-1 font-mono">{assembly.instructions.tipTrim}&quot;</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Butt:</span>
                                  <span className="ml-1 font-mono">{assembly.instructions.buttTrim.toFixed(2)}&quot;</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Spine:</span>
                                  <span className="ml-1">{assembly.instructions.spineAlign ? 'Yes' : 'No'}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">FLO:</span>
                                  <span className="ml-1">{assembly.instructions.floAlign ? 'Yes' : 'No'}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
          <Card className="glass-panel">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-base sm:text-lg">Hardware Validation</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Validate with Golf Mechanix equipment
                  </CardDescription>
                </div>
                <div className="flex gap-2 sm:gap-3">
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
                    <Scale className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">MOI</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
                    <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Freq</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
                    <Ruler className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Lie</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] sm:h-[500px]">
                <div className="space-y-3 sm:space-y-4 pr-2">
                  {blueprint.clubs.map((club) => {
                    const moiReading = getLatestReading(club.id, 'moi_scale');
                    const freqReading = getLatestReading(club.id, 'frequency_analyzer');
                    const lieReading = getLatestReading(club.id, 'loft_lie_gauge');
                    
                    return (
                      <Card key={club.id} className="border-border/50">
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs sm:text-sm font-bold shrink-0">
                                {club.type.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-sm sm:text-base capitalize">{club.type}</div>
                                <div className="text-[10px] sm:text-xs text-muted-foreground">
                                  MOI: {club.specs.moi} • Freq: {club.specs.frequency} CPM
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 sm:gap-3">
                            {/* MOI Scale */}
                            <div className="p-2 sm:p-3 rounded-lg bg-secondary/50">
                              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                                <span className="text-[10px] sm:text-xs font-medium">MOI</span>
                                {moiReading && getStatusIcon(moiReading.status)}
                              </div>
                              <div className="text-lg sm:text-xl font-mono">
                                {moiReading ? moiReading.measurements.value : '---'}
                              </div>
                              <div className="text-[9px] sm:text-[10px] text-muted-foreground">
                                ±25
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full mt-2 h-7 sm:h-8 text-[10px] sm:text-xs"
                                disabled={scanning === club.id}
                                onClick={() => handleSimulateReading(club.id, 'moi_scale', club.specs.moi)}
                              >
                                {scanning === club.id ? (
                                  <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                                ) : (
                                  <Scale className="w-3 h-3 sm:w-4 sm:h-4" />
                                )}
                              </Button>
                            </div>

                            {/* Frequency Analyzer */}
                            <div className="p-2 sm:p-3 rounded-lg bg-secondary/50">
                              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                                <span className="text-[10px] sm:text-xs font-medium">Freq</span>
                                {freqReading && getStatusIcon(freqReading.status)}
                              </div>
                              <div className="text-lg sm:text-xl font-mono">
                                {freqReading ? freqReading.measurements.value : '---'}
                              </div>
                              <div className="text-[9px] sm:text-[10px] text-muted-foreground">
                                ±3 CPM
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full mt-2 h-7 sm:h-8 text-[10px] sm:text-xs"
                                disabled={scanning === club.id}
                                onClick={() => handleSimulateReading(club.id, 'frequency_analyzer', club.specs.frequency)}
                              >
                                {scanning === club.id ? (
                                  <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                                ) : (
                                  <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
                                )}
                              </Button>
                            </div>

                            {/* Loft/Lie Gauge */}
                            <div className="p-2 sm:p-3 rounded-lg bg-secondary/50">
                              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                                <span className="text-[10px] sm:text-xs font-medium">Lie</span>
                                {lieReading && getStatusIcon(lieReading.status)}
                              </div>
                              <div className="text-lg sm:text-xl font-mono">
                                {lieReading ? lieReading.measurements.value : '---'}
                              </div>
                              <div className="text-[9px] sm:text-[10px] text-muted-foreground">
                                ±0.5°
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full mt-2 h-7 sm:h-8 text-[10px] sm:text-xs"
                                disabled={scanning === club.id}
                                onClick={() => handleSimulateReading(club.id, 'loft_lie_gauge', club.specs.lie)}
                              >
                                {scanning === club.id ? (
                                  <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                                ) : (
                                  <Ruler className="w-3 h-3 sm:w-4 sm:h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qr" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
          <Card className="glass-panel">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-base sm:text-lg">QR Code Labels</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Generate QR codes for club tracking
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" className="h-9 w-fit">
                  <Printer className="w-4 h-4 mr-2" />
                  Print All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {blueprint.clubs.map((club) => (
                  <Card key={club.id} className="border-border/50">
                    <CardContent className="p-3 sm:p-4 text-center">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-2 sm:mb-3 bg-white rounded-lg flex items-center justify-center">
                        <QrCode className="w-10 h-10 sm:w-14 sm:h-14 text-black" />
                      </div>
                      <div className="font-semibold capitalize text-xs sm:text-sm">{club.type}</div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">
                        {club.head.model}
                      </div>
                      <div className="text-[10px] sm:text-xs font-mono mt-1 text-primary">
                        {club.specs.swingweight} • {club.specs.moi}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

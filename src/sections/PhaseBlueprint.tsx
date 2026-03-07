import { useState, useMemo } from 'react';
import { 
  Layers, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Calculator,
  SlidersHorizontal,
  Save,
  FileDown,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { ClubAssembly, BagBlueprint, GapAnalysis, WhatIfScenario } from '@/types';
import { calculateMOIMatching, analyzeGaps, simulateWhatIf } from '@/lib/calculations';

interface PhaseBlueprintProps {
  recommendations: ClubAssembly[];
  blueprint: BagBlueprint | null;
  onBlueprintUpdate: (blueprint: BagBlueprint) => void;
}

// Gap Staircase Visualization
function GapStaircase({ gapAnalysis }: { gapAnalysis: GapAnalysis }) {
  const maxDistance = Math.max(...gapAnalysis.clubs.map(c => c.carryDistance), 250);
  
  return (
    <div className="relative h-48 sm:h-64 mt-3 sm:mt-4">
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 bottom-6 w-8 sm:w-12 flex flex-col justify-between text-[10px] sm:text-xs text-muted-foreground">
        <span>{maxDistance}</span>
        <span>{Math.round(maxDistance * 0.5)}</span>
        <span>0</span>
      </div>
      
      {/* Chart area */}
      <div className="absolute left-8 sm:left-14 right-0 top-0 bottom-6 border-l border-b border-border">
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map(pct => (
          <div 
            key={pct}
            className="absolute left-0 right-0 border-t border-border/30"
            style={{ bottom: `${pct * 100}%` }}
          />
        ))}
        
        {/* Bars */}
        <div className="absolute inset-0 flex items-end justify-around px-1 sm:px-4">
          {gapAnalysis.clubs.map((club) => {
            const height = (club.carryDistance / maxDistance) * 100;
            const gap = club.gapToNext;
            const gapColor = gap < 8 ? 'bg-red-500' : gap > 18 ? 'bg-amber-500' : 'bg-emerald-500';
            
            return (
              <div key={club.club.id} className="flex flex-col items-center" style={{ width: `${85 / gapAnalysis.clubs.length}%` }}>
                <div className="text-[9px] sm:text-xs mb-0.5 sm:mb-1">{club.carryDistance}</div>
                <div 
                  className="w-full bg-primary/60 rounded-t transition-all hover:bg-primary"
                  style={{ height: `${height}%` }}
                />
                <div className="text-[8px] sm:text-xs mt-1 text-center truncate w-full leading-tight">{club.club.type}</div>
                {gap > 0 && (
                  <div className={`text-[8px] sm:text-[10px] mt-0.5 px-1 py-0.5 rounded ${gapColor} text-white`}>
                    {gap}y
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* X-axis label */}
      <div className="absolute left-8 sm:left-14 right-0 bottom-0 text-center text-[10px] sm:text-xs text-muted-foreground">
        Clubs (by distance)
      </div>
    </div>
  );
}

export function PhaseBlueprint({ 
  recommendations, 
  blueprint, 
  onBlueprintUpdate 
}: PhaseBlueprintProps) {
  const [targetMOI, setTargetMOI] = useState(blueprint?.moiTarget || 2750);
  const [whatIfClub, setWhatIfClub] = useState<ClubAssembly | null>(null);
  const [whatIfMods, setWhatIfMods] = useState<WhatIfScenario['modifications']>({});
  const [expandedIssues, setExpandedIssues] = useState(true);
  
  // Sort clubs by type
  const sortedClubs = useMemo(() => {
    const typeOrder = ['driver', '3wood', '5wood', 'hybrid', '5iron', '6iron', '7iron', '8iron', '9iron', 'pw'];
    return [...recommendations].sort((a, b) => {
      const aIndex = typeOrder.indexOf(a.type);
      const bIndex = typeOrder.indexOf(b.type);
      return aIndex - bIndex;
    });
  }, [recommendations]);

  const moiMatch = useMemo(() => {
    return calculateMOIMatching(sortedClubs, targetMOI);
  }, [sortedClubs, targetMOI]);

  const mockShotData = useMemo(() => {
    const data = new Map<string, never[]>();
    sortedClubs.forEach(club => {
      data.set(club.id, []);
    });
    return data;
  }, [sortedClubs]);

  const gapAnalysis = useMemo(() => {
    return analyzeGaps(sortedClubs, mockShotData);
  }, [sortedClubs, mockShotData]);

  const whatIfResult = useMemo(() => {
    if (!whatIfClub || Object.keys(whatIfMods).length === 0) return null;
    const scenario: WhatIfScenario = {
      id: `whatif-${Date.now()}`,
      name: 'Custom',
      baseClub: whatIfClub,
      modifications: whatIfMods,
      predicted: { swingweight: '', moi: 0, frequency: 0, carryDistance: 0 }
    };
    return simulateWhatIf(scenario);
  }, [whatIfClub, whatIfMods]);

  const handleSaveBlueprint = () => {
    const newBlueprint: BagBlueprint = {
      id: `blueprint-${Date.now()}`,
      name: `Fitting Session ${new Date().toLocaleDateString()}`,
      createdAt: new Date(),
      clubs: sortedClubs,
      moiTarget: targetMOI,
      moiMatched: moiMatch.clubs.every(c => c.status !== 'adjust'),
      gapAnalysis,
      buildSheet: sortedClubs.map(club => ({
        club: club.type,
        head: `${club.head.brand} ${club.head.model}`,
        shaft: `${club.shaft.brand} ${club.shaft.model}`,
        length: club.specs.length,
        lie: club.specs.lie,
        swingweight: club.specs.swingweight,
        moi: club.specs.moi,
        frequency: club.specs.frequency,
      })),
    };
    onBlueprintUpdate(newBlueprint);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      case 'acceptable': return 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'adjust': return 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* MOI Target Control */}
      <Card className="glass-panel">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                <Calculator className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div>
                <div className="text-xs sm:text-sm text-muted-foreground">MOI Target</div>
                <div className="text-xl sm:text-2xl font-bold">{targetMOI} <span className="text-xs sm:text-sm font-normal text-muted-foreground">kg·cm²</span></div>
              </div>
            </div>
            <div className="w-full sm:w-64">
              <Slider
                value={[targetMOI]}
                onValueChange={([v]) => setTargetMOI(v)}
                min={2500}
                max={3000}
                step={10}
              />
              <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground mt-1">
                <span>2500</span>
                <span>2750 (std)</span>
                <span>3000</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="moi" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-10 sm:h-11">
          <TabsTrigger value="moi" className="text-xs sm:text-sm gap-1.5">
            <Calculator className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">MOI Matching</span>
            <span className="sm:hidden">MOI</span>
          </TabsTrigger>
          <TabsTrigger value="gaps" className="text-xs sm:text-sm gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Gap Analysis</span>
            <span className="sm:hidden">Gaps</span>
          </TabsTrigger>
          <TabsTrigger value="whatif" className="text-xs sm:text-sm gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">What-If</span>
            <span className="sm:hidden">Sim</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="moi" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
          <Card className="glass-panel">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-base sm:text-lg">MOI Matching Status</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Target: {targetMOI} kg·cm² (±{moiMatch.tolerance})
                  </CardDescription>
                </div>
                <Badge variant="outline" className={moiMatch.clubs.every(c => c.status === 'optimal') ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 w-fit' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 w-fit'}>
                  {moiMatch.clubs.filter(c => c.status === 'optimal').length}/{moiMatch.clubs.length} Optimal
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64 sm:h-96">
                <div className="space-y-1.5 sm:space-y-2 pr-2">
                  {moiMatch.clubs.map(({ club, actualMOI, deviation, status }) => (
                    <div 
                      key={club.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 rounded-lg bg-secondary/50 gap-2 sm:gap-0"
                    >
                      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                        <span className="font-medium capitalize text-sm sm:text-base w-16 sm:w-24 shrink-0">{club.type}</span>
                        <span className="text-xs sm:text-sm text-muted-foreground truncate">
                          {club.head.brand} {club.head.model} {club.head.loft}°
                        </span>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6">
                        <div className="text-right">
                          <div className="font-mono text-sm">{actualMOI}</div>
                          <div className="text-[10px] sm:text-xs text-muted-foreground">MOI</div>
                        </div>
                        <div className="text-right w-12 sm:w-16">
                          <div className={`font-mono text-sm ${deviation > 0 ? 'text-red-500' : deviation < 0 ? 'text-blue-500' : 'text-emerald-500'}`}>
                            {deviation > 0 ? '+' : ''}{deviation}
                          </div>
                          <div className="text-[10px] sm:text-xs text-muted-foreground">Dev</div>
                        </div>
                        <Badge variant="outline" className={`text-[10px] sm:text-xs ${getStatusColor(status)}`}>
                          {status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {moiMatch.clubs.length === 0 && (
                    <div className="text-center py-6 sm:py-8 text-muted-foreground">
                      <Layers className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No clubs in bag. Add clubs in Component Match.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gaps" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
          <Card className="glass-panel">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-base sm:text-lg">Distance Gap Analysis</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Target: 10-15 yards between clubs
                  </CardDescription>
                </div>
                <div className="flex gap-1.5 sm:gap-2">
                  <Badge variant="outline" className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] sm:text-xs">
                    <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                    <span className="hidden sm:inline">Optimal</span>
                    <span className="sm:hidden">OK</span>
                  </Badge>
                  <Badge variant="outline" className="bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] sm:text-xs">
                    <AlertTriangle className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                    <span className="hidden sm:inline">Gap</span>
                    <span className="sm:hidden">Gap</span>
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {gapAnalysis.clubs.length > 0 ? (
                <>
                  <GapStaircase gapAnalysis={gapAnalysis} />
                  
                  {gapAnalysis.issues.length > 0 && (
                    <Collapsible open={expandedIssues} onOpenChange={setExpandedIssues} className="mt-4 sm:mt-6">
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-full h-8 text-xs">
                          {expandedIssues ? (
                            <><ChevronUp className="w-3 h-3 mr-1" /> Hide Issues ({gapAnalysis.issues.length})</>
                          ) : (
                            <><ChevronDown className="w-3 h-3 mr-1" /> Show Issues ({gapAnalysis.issues.length})</>
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="space-y-2 mt-2">
                          {gapAnalysis.issues.map((issue, i) => (
                            <div 
                              key={i}
                              className={`p-2.5 sm:p-3 rounded-lg flex items-start gap-2 sm:gap-3 ${
                                issue.type === 'overlap' 
                                  ? 'bg-red-500/10 border border-red-500/30' 
                                  : 'bg-amber-500/10 border border-amber-500/30'
                              }`}
                            >
                              <AlertTriangle className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5 ${issue.type === 'overlap' ? 'text-red-500' : 'text-amber-500'}`} />
                              <div className="min-w-0">
                                <div className="font-medium text-xs sm:text-sm capitalize">{issue.type}</div>
                                <div className="text-[10px] sm:text-xs text-muted-foreground">
                                  {issue.clubs.join(' → ')}: {issue.distance}y gap
                                </div>
                                <div className="text-[10px] sm:text-xs mt-1">{issue.recommendation}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </>
              ) : (
                <div className="text-center py-6 sm:py-8 text-muted-foreground">
                  <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Add clubs to analyze distance gaps</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatif" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
            <Card className="glass-panel">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-base sm:text-lg">What-If Simulator</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Modify specs to see predicted changes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm">Select Club</label>
                  <select 
                    className="w-full p-2.5 sm:p-3 rounded-lg bg-secondary border border-border text-sm"
                    onChange={(e) => {
                      const club = sortedClubs.find(c => c.id === e.target.value);
                      setWhatIfClub(club || null);
                      setWhatIfMods({});
                    }}
                  >
                    <option value="">Select a club...</option>
                    {sortedClubs.map(club => (
                      <option key={club.id} value={club.id}>{club.type}</option>
                    ))}
                  </select>
                </div>

                {whatIfClub && (
                  <div className="space-y-4 sm:space-y-5 pt-3 sm:pt-4 border-t border-border">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span>Length</span>
                        <span className="font-mono">{(whatIfMods.length || whatIfClub.specs.length).toFixed(2)}&quot;</span>
                      </div>
                      <Slider
                        value={[whatIfMods.length || whatIfClub.specs.length]}
                        onValueChange={([v]) => setWhatIfMods(m => ({ ...m, length: v }))}
                        min={whatIfClub.specs.length - 1}
                        max={whatIfClub.specs.length + 1}
                        step={0.25}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span>Head Weight</span>
                        <span className="font-mono">{whatIfMods.headWeight || whatIfClub.head.headWeight}g</span>
                      </div>
                      <Slider
                        value={[whatIfMods.headWeight || whatIfClub.head.headWeight]}
                        onValueChange={([v]) => setWhatIfMods(m => ({ ...m, headWeight: v }))}
                        min={whatIfClub.head.headWeight - 10}
                        max={whatIfClub.head.headWeight + 10}
                        step={1}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span>Grip Weight</span>
                        <span className="font-mono">{whatIfMods.gripWeight || whatIfClub.grip.weight}g</span>
                      </div>
                      <Slider
                        value={[whatIfMods.gripWeight || whatIfClub.grip.weight]}
                        onValueChange={([v]) => setWhatIfMods(m => ({ ...m, gripWeight: v }))}
                        min={40}
                        max={80}
                        step={2}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass-panel">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-base sm:text-lg">Predicted Results</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Based on modifications</CardDescription>
              </CardHeader>
              <CardContent>
                {whatIfResult && whatIfClub ? (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <div className="data-card text-center p-2 sm:p-3">
                        <div className="metric-value text-sm sm:text-lg">{whatIfClub.specs.swingweight}</div>
                        <div className="metric-label text-[9px] sm:text-xs">Current SW</div>
                      </div>
                      <div className="data-card text-center p-2 sm:p-3">
                        <div className={`metric-value text-sm sm:text-lg ${whatIfResult.swingweight !== whatIfClub.specs.swingweight ? 'text-golf-green' : ''}`}>
                          {whatIfResult.swingweight}
                        </div>
                        <div className="metric-label text-[9px] sm:text-xs">Predicted</div>
                      </div>
                      <div className="data-card text-center p-2 sm:p-3">
                        <div className="metric-value text-sm sm:text-lg">{whatIfClub.specs.moi}</div>
                        <div className="metric-label text-[9px] sm:text-xs">Current MOI</div>
                      </div>
                      <div className="data-card text-center p-2 sm:p-3">
                        <div className={`metric-value text-sm sm:text-lg ${whatIfResult.moi !== whatIfClub.specs.moi ? 'text-golf-green' : ''}`}>
                          {whatIfResult.moi}
                        </div>
                        <div className="metric-label text-[9px] sm:text-xs">Predicted</div>
                      </div>
                      <div className="data-card text-center p-2 sm:p-3">
                        <div className="metric-value text-sm sm:text-lg">{whatIfClub.specs.frequency}</div>
                        <div className="metric-label text-[9px] sm:text-xs">Current CPM</div>
                      </div>
                      <div className="data-card text-center p-2 sm:p-3">
                        <div className={`metric-value text-sm sm:text-lg ${whatIfResult.frequency !== whatIfClub.specs.frequency ? 'text-golf-green' : ''}`}>
                          {whatIfResult.frequency}
                        </div>
                        <div className="metric-label text-[9px] sm:text-xs">Predicted</div>
                      </div>
                    </div>

                    <div className="p-3 sm:p-4 rounded-lg bg-primary/10">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm">Predicted Carry</span>
                        <span className="text-xl sm:text-2xl font-bold text-primary">{whatIfResult.carryDistance}y</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8 text-muted-foreground">
                    <SlidersHorizontal className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Select a club and modify specs</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
        <Button variant="outline" onClick={handleSaveBlueprint} className="h-10 sm:h-11">
          <Save className="w-4 h-4 mr-2" />
          Save Blueprint
        </Button>
        <Button className="h-10 sm:h-11">
          <FileDown className="w-4 h-4 mr-2" />
          Export Build Sheet
        </Button>
      </div>
    </div>
  );
}

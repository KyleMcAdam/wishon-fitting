import { useState, useMemo } from 'react';
import { 
  GitBranch, 
  Box, 
  Hand, 
  Check,
  Info,
  TrendingUp,
  Save,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { PlayerProfile, ClubAssembly, ShaftProfile, ClubHead, Grip } from '@/types';
import { shaftDatabase } from '@/data/shafts';
import { headDatabase } from '@/data/heads';
import { gripDatabase } from '@/data/grips';
import { 
  calculateMOI, 
  calculateSwingweight, 
  calculateFrequency, 
  calculateTotalWeight,
  recommendTipStiffness 
} from '@/lib/calculations';

interface PhaseMatchingProps {
  profile: PlayerProfile | null;
  recommendations: ClubAssembly[];
  onRecommendationsUpdate: (recommendations: ClubAssembly[]) => void;
}

// EI Curve Visualization Component
function EICurve({ shaft, isSelected }: { shaft: ShaftProfile; isSelected: boolean }) {
  const points = [
    { x: 0, y: shaft.eiProfile.at11 },
    { x: 20, y: shaft.eiProfile.at16 },
    { x: 40, y: shaft.eiProfile.at21 },
    { x: 60, y: shaft.eiProfile.at26 },
    { x: 80, y: shaft.eiProfile.at31 },
    { x: 100, y: shaft.eiProfile.at36 },
  ];

  const maxEI = 180;
  const minEI = 60;
  
  const pathD = points.map((p, i) => {
    const x = (p.x / 100) * 200;
    const y = 120 - ((p.y - minEI) / (maxEI - minEI)) * 100;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 200 120" className="w-full h-16 sm:h-20">
      {/* Grid */}
      {[0, 25, 50, 75, 100].map((x) => (
        <line key={`v${x}`} x1={x * 2} y1={0} x2={x * 2} y2={120} className="grid-line opacity-20" />
      ))}
      {[60, 90, 120, 150, 180].map((y) => (
        <line 
          key={`h${y}`} 
          x1={0} 
          y1={120 - ((y - minEI) / (maxEI - minEI)) * 100} 
          x2={200} 
          y2={120 - ((y - minEI) / (maxEI - minEI)) * 100} 
          className="grid-line opacity-20" 
        />
      ))}
      
      {/* EI Curve */}
      <path 
        d={pathD} 
        className={`ei-curve-path ${isSelected ? 'stroke-[2.5]' : 'stroke-[1.5]'}`}
        style={{ stroke: isSelected ? 'hsl(var(--golf-green))' : 'hsl(var(--muted-foreground))' }}
      />
      
      {/* Labels */}
      <text x="5" y="115" className="text-xs fill-muted-foreground">Tip</text>
      <text x="170" y="115" className="text-xs fill-muted-foreground">Butt</text>
    </svg>
  );
}

// 3D CG Visualization
function CGVisualization({ head }: { head: ClubHead }) {
  const scale = 2;
  const cx = 100;
  const cy = 75;
  
  const cgX = cx + (head.cg.horizontal * scale);
  const cgY = cy - (head.cg.vertical * scale);
  const depthRadius = head.cg.depth * 0.5;

  return (
    <svg viewBox="0 0 200 150" className="w-full h-20 sm:h-24">
      {/* Club head outline */}
      <ellipse 
        cx={cx} 
        cy={cy} 
        rx={40} 
        ry={25} 
        fill="none" 
        stroke="hsl(var(--muted-foreground))" 
        strokeWidth="1"
        opacity="0.5"
      />
      
      {/* Face line */}
      <line 
        x1={cx - 40} 
        y1={cy - 10} 
        x2={cx - 40} 
        y2={cy + 10} 
        stroke="hsl(var(--muted-foreground))" 
        strokeWidth="2"
        opacity="0.5"
      />
      
      {/* CG point */}
      <circle 
        cx={cgX} 
        cy={cgY} 
        r={4} 
        fill="hsl(var(--golf-green))"
        className="animate-pulse"
      />
      
      {/* Depth indicator */}
      <circle 
        cx={cgX} 
        cy={cgY} 
        r={depthRadius} 
        fill="none" 
        stroke="hsl(var(--golf-green))" 
        strokeWidth="1"
        opacity="0.3"
        strokeDasharray="3 3"
      />
      
      {/* Labels */}
      <text x="5" y="140" className="text-xs fill-muted-foreground">
        CG: H={head.cg.horizontal} V={head.cg.vertical} D={head.cg.depth}
      </text>
    </svg>
  );
}

export function PhaseMatching({ 
  profile, 
  recommendations, 
  onRecommendationsUpdate 
}: PhaseMatchingProps) {
  const [selectedClubType, setSelectedClubType] = useState('driver');
  const [selectedShaft, setSelectedShaft] = useState<ShaftProfile | null>(null);
  const [selectedHead, setSelectedHead] = useState<ClubHead | null>(null);
  const [selectedGrip, setSelectedGrip] = useState<Grip | null>(null);
  const [playingLength, setPlayingLength] = useState(44.5);
  const [activeTab, setActiveTab] = useState('shaft');

  const clubTypes = [
    { id: 'driver', label: 'Driver', headType: 'driver' as const },
    { id: '3wood', label: '3-Wood', headType: 'fairway' as const },
    { id: '5wood', label: '5-Wood', headType: 'fairway' as const },
    { id: 'hybrid', label: 'Hybrid', headType: 'hybrid' as const },
    { id: '5iron', label: '5-Iron', headType: 'iron' as const },
    { id: '6iron', label: '6-Iron', headType: 'iron' as const },
    { id: '7iron', label: '7-Iron', headType: 'iron' as const },
    { id: '8iron', label: '8-Iron', headType: 'iron' as const },
    { id: '9iron', label: '9-Iron', headType: 'iron' as const },
    { id: 'pw', label: 'PW', headType: 'iron' as const },
  ];

  const currentClubType = clubTypes.find(c => c.id === selectedClubType);
  
  const filteredShafts = useMemo(() => {
    if (!currentClubType) return [];
    const isWood = currentClubType.headType === 'driver' || currentClubType.headType === 'fairway' || currentClubType.headType === 'hybrid';
    return shaftDatabase.filter(s => isWood ? s.length >= 42 : s.length <= 42);
  }, [currentClubType]);

  const filteredHeads = useMemo(() => {
    if (!currentClubType) return [];
    return headDatabase.filter(h => h.type === currentClubType.headType);
  }, [currentClubType]);

  const currentAssembly: ClubAssembly | null = useMemo(() => {
    if (!selectedShaft || !selectedHead || !selectedGrip) return null;
    
    const assembly: ClubAssembly = {
      id: `assembly-${Date.now()}`,
      type: selectedClubType,
      head: selectedHead,
      shaft: selectedShaft,
      grip: selectedGrip,
      specs: {
        length: playingLength,
        lie: selectedHead.lie,
        loft: selectedHead.loft,
        swingweight: 'D2',
        moi: 0,
        totalWeight: 0,
        frequency: 0,
      },
      instructions: {
        tipTrim: 0.5,
        buttTrim: selectedShaft.length - playingLength,
        spineAlign: true,
        floAlign: false,
      },
    };
    
    assembly.specs.moi = calculateMOI(assembly);
    assembly.specs.swingweight = calculateSwingweight(assembly);
    assembly.specs.frequency = calculateFrequency(assembly);
    assembly.specs.totalWeight = calculateTotalWeight(assembly);
    
    return assembly;
  }, [selectedShaft, selectedHead, selectedGrip, playingLength, selectedClubType]);

  const handleAddToBag = () => {
    if (!currentAssembly) return;
    
    const exists = recommendations.find(r => r.type === selectedClubType);
    if (exists) {
      onRecommendationsUpdate(recommendations.map(r => 
        r.type === selectedClubType ? currentAssembly : r
      ));
    } else {
      onRecommendationsUpdate([...recommendations, currentAssembly]);
    }
  };

  const releaseRecommendation = profile?.swingDNA.releasePoint 
    ? recommendTipStiffness(profile.swingDNA.releasePoint)
    : null;

  // Scroll club type selector
  const scrollClubTypes = (direction: 'left' | 'right') => {
    const container = document.getElementById('club-type-scroll');
    if (container) {
      container.scrollBy({ left: direction === 'left' ? -150 : 150, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Club Type Selector */}
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 shrink-0 hidden sm:flex"
          onClick={() => scrollClubTypes('left')}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="relative flex-1 min-w-0 overflow-hidden scroll-fade-x">
          <div 
            id="club-type-scroll"
            className="overflow-x-auto no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0"
          >
            <div className="flex gap-1.5 sm:gap-2 min-w-max pb-1">
            {clubTypes.map(club => (
              <Button
                key={club.id}
                variant={selectedClubType === club.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setSelectedClubType(club.id);
                  setSelectedShaft(null);
                  setSelectedHead(null);
                  setPlayingLength(club.headType === 'driver' ? 44.5 : club.headType === 'fairway' ? 43 : club.headType === 'hybrid' ? 40.5 : 38);
                }}
                className="text-xs sm:text-sm whitespace-nowrap min-h-[44px] sm:h-9 px-2.5 sm:px-3"
              >
                {club.label}
              </Button>
            ))}
            </div>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 shrink-0 hidden sm:flex"
          onClick={() => scrollClubTypes('right')}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid lg:grid-cols-5 gap-4 sm:gap-6">
        {/* Component Selection */}
        <div className="lg:col-span-3 space-y-4 sm:space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-10 sm:h-11">
              <TabsTrigger value="shaft" className="text-xs sm:text-sm gap-1.5 sm:gap-2">
                <GitBranch className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Shaft</span>
                <span className="sm:hidden">Shaft</span>
              </TabsTrigger>
              <TabsTrigger value="head" className="text-xs sm:text-sm gap-1.5 sm:gap-2">
                <Box className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Head</span>
                <span className="sm:hidden">Head</span>
              </TabsTrigger>
              <TabsTrigger value="grip" className="text-xs sm:text-sm gap-1.5 sm:gap-2">
                <Hand className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Grip</span>
                <span className="sm:hidden">Grip</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="shaft" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
              {releaseRecommendation && (
                <div className="p-2.5 sm:p-3 rounded-lg bg-primary/10 text-xs sm:text-sm flex items-start gap-2">
                  <Info className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                  <div>
                    <span className="font-medium">Based on your {profile?.swingDNA.releasePoint} release:</span>
                    <p className="text-muted-foreground mt-0.5">{releaseRecommendation}</p>
                  </div>
                </div>
              )}
              
              <ScrollArea className="h-[280px] sm:h-[400px]">
                <div className="space-y-2 sm:space-y-3 pr-2">
                  {filteredShafts.map(shaft => (
                    <div
                      key={shaft.id}
                      onClick={() => setSelectedShaft(shaft)}
                      className={`p-3 sm:p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedShaft?.id === shaft.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="min-w-0">
                          <div className="font-medium text-sm sm:text-base truncate">{shaft.brand} {shaft.model}</div>
                          <div className="text-xs sm:text-sm text-muted-foreground">
                            {shaft.flex} • {shaft.weight}g • {shaft.kickpoint}
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <div className="font-mono text-sm">{shaft.cpm} CPM</div>
                          <div className="text-xs text-muted-foreground">{shaft.torque}°</div>
                        </div>
                      </div>
                      <EICurve shaft={shaft} isSelected={selectedShaft?.id === shaft.id} />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="head" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
              <ScrollArea className="h-[280px] sm:h-[400px]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 pr-2">
                  {filteredHeads.map(head => (
                    <div
                      key={head.id}
                      onClick={() => setSelectedHead(head)}
                      className={`p-3 sm:p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedHead?.id === head.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="min-w-0">
                          <div className="font-medium text-sm sm:text-base truncate">{head.brand} {head.model}</div>
                          <div className="text-xs sm:text-sm text-muted-foreground">
                            {head.loft}° • {head.headWeight}g
                          </div>
                        </div>
                        {selectedHead?.id === head.id && (
                          <Check className="w-5 h-5 text-primary shrink-0 ml-2" />
                        )}
                      </div>
                      <CGVisualization head={head} />
                      <div className="mt-1.5 sm:mt-2 text-xs text-muted-foreground">
                        MOI V:{head.moi.vertical} H:{head.moi.horizontal}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="grip" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
              <ScrollArea className="h-[280px] sm:h-[400px]">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 pr-2">
                  {gripDatabase.map(grip => (
                    <div
                      key={grip.id}
                      onClick={() => setSelectedGrip(grip)}
                      className={`p-3 sm:p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedGrip?.id === grip.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="font-medium text-sm sm:text-base">{grip.brand}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground truncate">{grip.model}</div>
                      <div className="mt-2 text-xs">
                        <span className="capitalize">{grip.size}</span> • {grip.weight}g
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Build Preview */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          <Card className="glass-panel">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Build Preview</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {currentClubType?.label} Configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {currentAssembly ? (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs sm:text-sm py-1 border-b border-border/30">
                      <span className="text-muted-foreground">Shaft</span>
                      <span className="font-medium text-right text-xs sm:text-sm truncate max-w-[60%]">{currentAssembly.shaft.model}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm py-1 border-b border-border/30">
                      <span className="text-muted-foreground">Head</span>
                      <span className="font-medium text-right">{currentAssembly.head.model} {currentAssembly.head.loft}°</span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm py-1">
                      <span className="text-muted-foreground">Grip</span>
                      <span className="font-medium text-right text-xs sm:text-sm truncate max-w-[60%]">{currentAssembly.grip.model}</span>
                    </div>
                  </div>

                  <div className="border-t border-border pt-3 sm:pt-4">
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <div className="data-card text-center p-2 sm:p-3">
                        <div className="metric-value text-golf-green text-base sm:text-lg">{currentAssembly.specs.length}&quot;</div>
                        <div className="metric-label text-xs">Length</div>
                      </div>
                      <div className="data-card text-center p-2 sm:p-3">
                        <div className="metric-value text-base sm:text-lg">{currentAssembly.specs.lie}°</div>
                        <div className="metric-label text-xs">Lie</div>
                      </div>
                      <div className="data-card text-center p-2 sm:p-3">
                        <div className="metric-value text-golf-gold text-base sm:text-lg">{currentAssembly.specs.swingweight}</div>
                        <div className="metric-label text-xs">Swingwt</div>
                      </div>
                      <div className="data-card text-center p-2 sm:p-3">
                        <div className="metric-value text-base sm:text-lg">{currentAssembly.specs.moi}</div>
                        <div className="metric-label text-xs">MOI</div>
                      </div>
                      <div className="data-card text-center p-2 sm:p-3">
                        <div className="metric-value text-base sm:text-lg">{currentAssembly.specs.frequency}</div>
                        <div className="metric-label text-xs">CPM</div>
                      </div>
                      <div className="data-card text-center p-2 sm:p-3">
                        <div className="metric-value text-base sm:text-lg">{currentAssembly.specs.totalWeight}g</div>
                        <div className="metric-label text-xs">Weight</div>
                      </div>
                    </div>
                  </div>

                  <Button 
                    className="w-full h-10 sm:h-10" 
                    onClick={handleAddToBag}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Add to Bag
                  </Button>
                </>
              ) : (
                <div className="text-center py-6 sm:py-8 text-muted-foreground">
                  <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Select shaft, head, and grip</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Bag */}
          <Card className="glass-panel">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Current Bag</CardTitle>
              <CardDescription className="text-xs sm:text-sm">{recommendations.length} clubs</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-36 sm:h-48">
                <div className="space-y-1.5 pr-2">
                  {recommendations.map(club => (
                    <div 
                      key={club.id} 
                      className="flex items-center justify-between p-2 sm:p-2.5 rounded bg-secondary/50 text-xs sm:text-sm"
                    >
                      <span className="font-medium capitalize">{club.type}</span>
                      <span className="text-muted-foreground">{club.head.loft}° • {club.specs.swingweight}</span>
                    </div>
                  ))}
                  {recommendations.length === 0 && (
                    <p className="text-center text-muted-foreground py-4 text-sm">No clubs added</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  TrendingUp, 
  Target, 
  Zap,
  Activity,
  BarChart3,
  Crosshair,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { PlayerProfile, FittingSession, ShotData } from '@/types';
import { analyzeReleasePoint } from '@/lib/calculations';

interface PhaseDiagnosticsProps {
  profile: PlayerProfile | null;
  session: FittingSession | null;
  onSessionUpdate: (session: FittingSession) => void;
}

// Simulate realistic shot data
const generateShot = (club: string, swingSpeed: number): ShotData => {
  const variance = () => 0.95 + Math.random() * 0.1;
  const qualityRoll = Math.random();
  const quality: ShotData['quality'] = qualityRoll > 0.8 ? 'excellent' : qualityRoll > 0.5 ? 'good' : qualityRoll > 0.2 ? 'fair' : 'poor';
  
  const baseSpeed = swingSpeed * variance();
  const smashFactor = 1.45 + (Math.random() * 0.05);
  const ballSpeed = baseSpeed * smashFactor;
  
  const launchAngle = club === 'Driver' 
    ? 10 + Math.random() * 4 
    : club.includes('Iron') 
      ? 12 + Math.random() * 6 
      : 14 + Math.random() * 5;
  
  const spinRate = club === 'Driver'
    ? 2200 + Math.random() * 800
    : club.includes('7-Iron')
      ? 6200 + Math.random() * 1000
      : club.includes('5-Iron')
        ? 4800 + Math.random() * 800
        : 2800 + Math.random() * 600;
  
  const carryDistance = club === 'Driver'
    ? (ballSpeed * 2.5) + Math.random() * 20
    : club.includes('7-Iron')
      ? 150 + Math.random() * 15
      : club.includes('5-Iron')
        ? 175 + Math.random() * 15
        : 200 + Math.random() * 20;
  
  return {
    id: `shot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    club,
    ballSpeed: Math.round(ballSpeed * 10) / 10,
    launchAngle: Math.round(launchAngle * 10) / 10,
    spinRate: Math.round(spinRate),
    spinAxis: Math.round((Math.random() * 10 - 5) * 10) / 10,
    carryDistance: Math.round(carryDistance),
    totalDistance: Math.round(carryDistance * (1.08 + Math.random() * 0.04)),
    offline: Math.round((Math.random() * 30 - 15) * 10) / 10,
    peakHeight: Math.round(80 + Math.random() * 40),
    landingAngle: Math.round((38 + Math.random() * 8) * 10) / 10,
    clubSpeed: Math.round(baseSpeed * 10) / 10,
    attackAngle: Math.round((-3 + Math.random() * 6) * 10) / 10,
    dynamicLoft: Math.round(launchAngle + 2 + Math.random() * 3),
    faceAngle: Math.round((Math.random() * 4 - 2) * 10) / 10,
    clubPath: Math.round((Math.random() * 6 - 3) * 10) / 10,
    faceToPath: Math.round((Math.random() * 4 - 2) * 10) / 10,
    smashFactor: Math.round(smashFactor * 100) / 100,
    quality,
    consistency: Math.round(70 + Math.random() * 25),
  };
};

export function PhaseDiagnostics({ profile, session, onSessionUpdate }: PhaseDiagnosticsProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [selectedClub, setSelectedClub] = useState('Driver');
  const [shots, setShots] = useState<ShotData[]>(session?.shots || []);
  const [lastShot, setLastShot] = useState<ShotData | null>(null);
  const [showAllMetrics, setShowAllMetrics] = useState(false);

  const clubs = ['Driver', '3-Wood', '5-Wood', '4-Hybrid', '5-Iron', '6-Iron', '7-Iron', '8-Iron', '9-Iron', 'PW'];

  const swingSpeed = profile?.swingDNA.swingSpeed || 95;

  const captureShot = useCallback(() => {
    const shot = generateShot(selectedClub, swingSpeed);
    setShots(prev => [shot, ...prev]);
    setLastShot(shot);
    
    const updatedSession: FittingSession = {
      id: session?.id || `session-${Date.now()}`,
      date: new Date(),
      fitter: 'Fitter-001',
      phase: 'diagnostics',
      shots: [shot, ...shots],
      recommendations: [],
    };
    onSessionUpdate(updatedSession);
  }, [selectedClub, swingSpeed, shots, session, onSessionUpdate]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isCapturing) {
      interval = setInterval(captureShot, 3000);
    }
    return () => clearInterval(interval);
  }, [isCapturing, captureShot]);

  const releaseAnalysis = analyzeReleasePoint(shots.slice(0, 10));

  const stats = {
    avgBallSpeed: shots.length > 0 ? Math.round(shots.reduce((s, shot) => s + shot.ballSpeed, 0) / shots.length) : 0,
    avgCarry: shots.length > 0 ? Math.round(shots.reduce((s, shot) => s + shot.carryDistance, 0) / shots.length) : 0,
    avgSpin: shots.length > 0 ? Math.round(shots.reduce((s, shot) => s + shot.spinRate, 0) / shots.length) : 0,
    avgLaunch: shots.length > 0 ? Math.round(shots.reduce((s, shot) => s + shot.launchAngle, 0) / shots.length * 10) / 10 : 0,
    smashFactor: shots.length > 0 ? Math.round(shots.reduce((s, shot) => s + shot.smashFactor, 0) / shots.length * 100) / 100 : 0,
  };

  const getQualityColor = (quality: ShotData['quality']) => {
    switch (quality) {
      case 'excellent': return 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      case 'good': return 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30';
      case 'fair': return 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'poor': return 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        {/* Club Selector - Scrollable on mobile */}
        <div className="relative flex-1 min-w-0 overflow-hidden scroll-fade-x">
          <div className="overflow-x-auto no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0">
            <div className="flex gap-1.5 sm:gap-2 min-w-max pb-1 sm:pb-0">
            {clubs.map(club => (
              <Button
                key={club}
                variant={selectedClub === club ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedClub(club)}
                className="text-xs sm:text-sm whitespace-nowrap min-h-[44px] sm:h-9 px-2.5 sm:px-3"
              >
                {club}
              </Button>
            ))}
            </div>
          </div>
        </div>
        
        {/* Capture Controls */}
        <div className="flex gap-2 shrink-0">
          <Button
            variant={isCapturing ? 'destructive' : 'default'}
            onClick={() => setIsCapturing(!isCapturing)}
            className="gap-1.5 sm:gap-2 flex-1 sm:flex-none h-10 sm:h-9"
            size="sm"
          >
            {isCapturing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span className="hidden sm:inline">{isCapturing ? 'Stop' : 'Auto'}</span>
            <span className="sm:hidden">{isCapturing ? 'Stop' : 'Auto'}</span>
          </Button>
          <Button variant="outline" onClick={captureShot} className="h-10 sm:h-9 px-3" size="sm">
            <Zap className="w-4 h-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Single</span>
          </Button>
          <Button variant="ghost" onClick={() => setShots([])} className="h-10 sm:h-9 w-10 px-0" size="sm">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Last Shot Display */}
      {lastShot && (
        <Card className="glass-panel border-primary/30 glow-green overflow-hidden">
          <CardContent className="p-3 sm:p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <Badge variant="outline" className={`text-xs ${getQualityColor(lastShot.quality)}`}>
                  {lastShot.quality.toUpperCase()}
                </Badge>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {lastShot.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <span className="text-sm sm:text-base font-medium">{lastShot.club}</span>
            </div>
            
            {/* Key Metrics - Always visible */}
            <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-3 sm:mb-4">
              <div className="text-center">
                <div className="metric-value text-golf-green text-lg sm:text-2xl">{lastShot.ballSpeed}</div>
                <div className="metric-label text-xs">Ball Speed</div>
              </div>
              <div className="text-center">
                <div className="metric-value text-lg sm:text-2xl">{lastShot.carryDistance}</div>
                <div className="metric-label text-xs">Carry</div>
              </div>
              <div className="text-center">
                <div className="metric-value text-golf-gold text-lg sm:text-2xl">{lastShot.smashFactor}</div>
                <div className="metric-label text-xs">Smash</div>
              </div>
              <div className="text-center">
                <div className="metric-value text-lg sm:text-2xl">{lastShot.spinRate.toLocaleString()}</div>
                <div className="metric-label text-xs">Spin</div>
              </div>
            </div>

            {/* Additional Metrics - Collapsible on mobile */}
            <Collapsible open={showAllMetrics} onOpenChange={setShowAllMetrics}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full h-8 text-xs">
                  {showAllMetrics ? (
                    <><ChevronUp className="w-3 h-3 mr-1" /> Less Details</>
                  ) : (
                    <><ChevronDown className="w-3 h-3 mr-1" /> More Details</>
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-4 pt-3 border-t border-border/50">
                  <div className="text-center">
                    <div className="metric-value text-sm sm:text-xl">{lastShot.clubSpeed}</div>
                    <div className="metric-label text-xs">Club Spd</div>
                  </div>
                  <div className="text-center">
                    <div className="metric-value text-sm sm:text-xl">{lastShot.totalDistance}</div>
                    <div className="metric-label text-xs">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="metric-value text-sm sm:text-xl">{lastShot.launchAngle}°</div>
                    <div className="metric-label text-xs">Launch</div>
                  </div>
                  <div className="text-center">
                    <div className="metric-value text-sm sm:text-xl">{lastShot.offline > 0 ? '+' : ''}{lastShot.offline}</div>
                    <div className="metric-label text-xs">Offline</div>
                  </div>
                  <div className="text-center">
                    <div className="metric-value text-sm sm:text-xl">{lastShot.peakHeight}</div>
                    <div className="metric-label text-xs">Height</div>
                  </div>
                  <div className="text-center">
                    <div className="metric-value text-sm sm:text-xl">{lastShot.landingAngle}°</div>
                    <div className="metric-label text-xs">Land Ang</div>
                  </div>
                  <div className="text-center">
                    <div className="metric-value text-sm sm:text-xl">{lastShot.dynamicLoft}°</div>
                    <div className="metric-label text-xs">Dyn Loft</div>
                  </div>
                  <div className="text-center">
                    <div className="metric-value text-sm sm:text-xl">{lastShot.faceAngle}°</div>
                    <div className="metric-label text-xs">Face</div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Session Stats */}
        <Card className="glass-panel lg:col-span-2">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <CardTitle className="text-base sm:text-lg">Session Statistics</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="ball" className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-9 sm:h-10">
                <TabsTrigger value="ball" className="text-xs sm:text-sm">Ball</TabsTrigger>
                <TabsTrigger value="club" className="text-xs sm:text-sm">Club</TabsTrigger>
                <TabsTrigger value="flight" className="text-xs sm:text-sm">Flight</TabsTrigger>
              </TabsList>
              
              <TabsContent value="ball" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
                  <div className="data-card text-center">
                    <div className="metric-value text-sm sm:text-xl">{stats.avgBallSpeed}</div>
                    <div className="metric-label text-xs">Ball Speed</div>
                  </div>
                  <div className="data-card text-center">
                    <div className="metric-value text-sm sm:text-xl">{stats.avgCarry}</div>
                    <div className="metric-label text-xs">Carry</div>
                  </div>
                  <div className="data-card text-center">
                    <div className="metric-value text-xs sm:text-lg">{stats.avgSpin.toLocaleString()}</div>
                    <div className="metric-label text-xs">Spin</div>
                  </div>
                  <div className="data-card text-center">
                    <div className="metric-value text-sm sm:text-xl">{stats.avgLaunch}°</div>
                    <div className="metric-label text-xs">Launch</div>
                  </div>
                  <div className="data-card text-center col-span-2 sm:col-span-1">
                    <div className="metric-value text-golf-gold text-sm sm:text-xl">{stats.smashFactor}</div>
                    <div className="metric-label text-xs">Smash</div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="club" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  <div className="data-card text-center">
                    <div className="metric-value text-sm sm:text-xl">{swingSpeed}</div>
                    <div className="metric-label text-xs">Swing Speed</div>
                  </div>
                  <div className="data-card text-center">
                    <div className="metric-value text-sm sm:text-xl">{profile?.swingDNA.attackAngle || -2}°</div>
                    <div className="metric-label text-xs">Attack Angle</div>
                  </div>
                  <div className="data-card text-center">
                    <div className="metric-value text-sm sm:text-xl">{profile?.swingDNA.path || 2}°</div>
                    <div className="metric-label text-xs">Club Path</div>
                  </div>
                  <div className="data-card text-center">
                    <div className="metric-value text-sm sm:text-xl">{profile?.swingDNA.tempo || 3}:1</div>
                    <div className="metric-label text-xs">Tempo</div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="flight" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  <div className="data-card text-center">
                    <div className="metric-value text-sm sm:text-xl">{lastShot?.peakHeight || 0}</div>
                    <div className="metric-label text-xs">Peak Height</div>
                  </div>
                  <div className="data-card text-center">
                    <div className="metric-value text-sm sm:text-xl">{lastShot?.landingAngle || 0}°</div>
                    <div className="metric-label text-xs">Landing</div>
                  </div>
                  <div className="data-card text-center">
                    <div className="metric-value text-sm sm:text-xl">{lastShot?.spinAxis || 0}°</div>
                    <div className="metric-label text-xs">Spin Axis</div>
                  </div>
                  <div className="data-card text-center">
                    <div className="metric-value text-sm sm:text-xl">{lastShot?.offline || 0}</div>
                    <div className="metric-label text-xs">Offline</div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Release Point Analysis */}
        <Card className="glass-panel">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Crosshair className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <CardTitle className="text-base sm:text-lg">Release Analysis</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {shots.length >= 3 ? (
              <>
                <div className="text-center py-3 sm:py-4">
                  <div className="text-2xl sm:text-3xl font-bold text-primary capitalize">
                    {releaseAnalysis.classification}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Release Point
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Confidence: {Math.round(releaseAnalysis.confidence)}%
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs sm:text-sm py-1.5 border-b border-border/30">
                    <span className="text-muted-foreground">Dynamic Loft</span>
                    <span className="font-medium font-mono">
                      {Math.round(shots.slice(0, 5).reduce((s, shot) => s + shot.dynamicLoft, 0) / Math.min(5, shots.length) * 10) / 10}°
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm py-1.5">
                    <span className="text-muted-foreground">Spin Rate</span>
                    <span className="font-medium font-mono">
                      {Math.round(shots.slice(0, 5).reduce((s, shot) => s + shot.spinRate, 0) / Math.min(5, shots.length)).toLocaleString()} rpm
                    </span>
                  </div>
                </div>
                
                <div className="p-2.5 sm:p-3 rounded-lg bg-primary/10 text-xs sm:text-sm">
                  <span className="font-medium">Recommendation:</span>
                  <p className="text-muted-foreground mt-1 leading-relaxed">
                    {releaseAnalysis.classification === 'early' 
                      ? 'Softer tip shaft to increase launch and reduce spin'
                      : releaseAnalysis.classification === 'late'
                        ? 'Stiffer tip shaft to lower launch and control spin'
                        : 'Standard tip stiffness for balanced performance'}
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-6 sm:py-8 text-muted-foreground">
                <Activity className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Hit at least 3 shots for release analysis</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Shot History */}
      <Card className="glass-panel">
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <CardTitle className="text-base sm:text-lg">Shot History</CardTitle>
            </div>
            <Badge variant="outline" className="text-xs">{shots.length} shots</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48 sm:h-64">
            <div className="space-y-1.5 sm:space-y-2">
              {shots.map((shot, index) => (
                <div
                  key={shot.id}
                  className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <span className="text-xs text-muted-foreground w-6 sm:w-8 shrink-0">#{shots.length - index}</span>
                    <Badge variant="outline" className={`text-xs shrink-0 ${getQualityColor(shot.quality)}`}>
                      {shot.quality}
                    </Badge>
                    <span className="text-xs sm:text-sm font-medium truncate">{shot.club}</span>
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      {shot.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm shrink-0">
                    <span className="w-14 sm:w-20 text-right font-mono">{shot.ballSpeed}</span>
                    <span className="w-14 sm:w-20 text-right font-mono hidden sm:inline">{shot.carryDistance}y</span>
                    <span className="w-16 sm:w-24 text-right font-mono hidden md:inline">{shot.spinRate.toLocaleString()}</span>
                    <span className="w-10 sm:w-16 text-right font-mono">{shot.smashFactor}</span>
                  </div>
                </div>
              ))}
              {shots.length === 0 && (
                <div className="text-center py-6 sm:py-8 text-muted-foreground">
                  <Target className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No shots captured yet. Start hitting balls!</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

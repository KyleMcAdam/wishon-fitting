import { useState } from 'react';
import { User, Ruler, Hand, Gauge, Activity, ChevronRight, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { PlayerProfile, SwingDNA } from '@/types';
import { recommendFlex, recommendLength } from '@/lib/calculations';

interface PhaseOnboardingProps {
  onComplete: (profile: PlayerProfile) => void;
  initialProfile: PlayerProfile | null;
}

export function PhaseOnboarding({ onComplete, initialProfile }: PhaseOnboardingProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(initialProfile?.name || '');
  const [physicals, setPhysicals] = useState({
    height: initialProfile?.physicals.height || 69,
    wristToFloor: initialProfile?.physicals.wristToFloor || 35,
    handSize: initialProfile?.physicals.handSize || 7.5,
    fingerLength: initialProfile?.physicals.fingerLength || 3,
    dominantHand: initialProfile?.physicals.dominantHand || 'right' as const,
  });
  const [swingDNA, setSwingDNA] = useState<SwingDNA>({
    swingSpeed: initialProfile?.swingDNA.swingSpeed || 90,
    transitionForce: initialProfile?.swingDNA.transitionForce || 'moderate',
    releasePoint: initialProfile?.swingDNA.releasePoint || 'mid',
    tempo: initialProfile?.swingDNA.tempo || 3,
    attackAngle: initialProfile?.swingDNA.attackAngle || -2,
    path: initialProfile?.swingDNA.path || 2,
  });

  const handlePhysicalsChange = (key: keyof typeof physicals, value: unknown) => {
    setPhysicals(prev => ({ ...prev, [key]: value }));
  };

  const handleSwingDNAChange = (key: keyof SwingDNA, value: unknown) => {
    setSwingDNA(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    const profile: PlayerProfile = {
      id: `player-${Date.now()}`,
      name,
      createdAt: new Date(),
      physicals,
      swingDNA,
      sessions: [],
    };
    onComplete(profile);
  };

  const recommendedFlex = recommendFlex(swingDNA.swingSpeed);
  const recommendedDriverLength = recommendLength(physicals.wristToFloor, 'driver');
  const recommended5IronLength = recommendLength(physicals.wristToFloor, '5iron');

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-2 sm:h-3 rounded-full transition-all duration-300 ${
              s === step ? 'bg-primary w-8 sm:w-12' : s < step ? 'bg-primary/60 w-2 sm:w-3' : 'bg-muted w-2 sm:w-3'
            }`}
          />
        ))}
      </div>

      {step === 1 && (
        <Card className="glass-panel">
          <CardHeader className="pb-4 sm:pb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl">Player Information</CardTitle>
                <CardDescription className="text-sm">Enter basic player details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 sm:space-y-6">
            <div className="space-y-2.5">
              <Label htmlFor="name" className="text-sm sm:text-base">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter player name"
                className="h-11 sm:h-10 text-base"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm sm:text-base">Dominant Hand</Label>
              <RadioGroup
                value={physicals.dominantHand}
                onValueChange={(v) => handlePhysicalsChange('dominantHand', v)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="right" id="right" className="h-5 w-5" />
                  <Label htmlFor="right" className="text-sm sm:text-base">Right</Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="left" id="left" className="h-5 w-5" />
                  <Label htmlFor="left" className="text-sm sm:text-base">Left</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex justify-end pt-2">
              <Button 
                onClick={() => setStep(2)} 
                disabled={!name}
                className="w-full sm:w-auto h-11 sm:h-10"
              >
                Continue
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="glass-panel">
          <CardHeader className="pb-4 sm:pb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                <Ruler className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl">Physical Measurements</CardTitle>
                <CardDescription className="text-sm">Body measurements for club length and lie</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 sm:space-y-6">
            <div className="grid gap-5 sm:gap-6">
              {/* Height */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm sm:text-base">Height</Label>
                  <span className="text-base sm:text-lg font-mono font-semibold text-primary">{physicals.height}&quot;</span>
                </div>
                <Slider
                  value={[physicals.height]}
                  onValueChange={([v]) => handlePhysicalsChange('height', v)}
                  min={60}
                  max={78}
                  step={0.5}
                  className="py-1"
                />
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Standard: 69&quot; (5&apos;9&quot;)
                </p>
              </div>

              {/* Wrist-to-Floor */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm sm:text-base flex items-center gap-2">
                    Wrist-to-Floor
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[250px]">
                          <p className="text-sm">
                            Measure from wrist crease to floor while standing in golf posture.
                            This is the primary determinant of club length.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <span className="text-base sm:text-lg font-mono font-semibold text-primary">{physicals.wristToFloor}&quot;</span>
                </div>
                <Slider
                  value={[physicals.wristToFloor]}
                  onValueChange={([v]) => handlePhysicalsChange('wristToFloor', v)}
                  min={28}
                  max={42}
                  step={0.25}
                  className="py-1"
                />
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Standard: 35&quot; | Your recommended driver: {recommendedDriverLength}&quot;
                </p>
              </div>

              {/* Hand Size */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm sm:text-base flex items-center gap-2">
                    Hand Size
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[250px]">
                          <p className="text-sm">
                            Measure from wrist crease to tip of middle finger.
                            Determines grip size.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <span className="text-base sm:text-lg font-mono font-semibold text-primary">{physicals.handSize}&quot;</span>
                </div>
                <Slider
                  value={[physicals.handSize]}
                  onValueChange={([v]) => handlePhysicalsChange('handSize', v)}
                  min={6}
                  max={9.5}
                  step={0.25}
                  className="py-1"
                />
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Grip: {physicals.handSize < 7 ? 'Undersize' : physicals.handSize < 8 ? 'Standard' : physicals.handSize < 9 ? 'Midsize' : 'Jumbo'}
                </p>
              </div>

              {/* Finger Length */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm sm:text-base">Finger Length</Label>
                  <span className="text-base sm:text-lg font-mono font-semibold text-primary">{physicals.fingerLength}&quot;</span>
                </div>
                <Slider
                  value={[physicals.fingerLength]}
                  onValueChange={([v]) => handlePhysicalsChange('fingerLength', v)}
                  min={2.5}
                  max={4}
                  step={0.25}
                  className="py-1"
                />
              </div>
            </div>

            <div className="flex justify-between gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep(1)} className="h-11 sm:h-10 flex-1 sm:flex-none">
                Back
              </Button>
              <Button onClick={() => setStep(3)} className="h-11 sm:h-10 flex-1 sm:flex-none">
                Continue
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card className="glass-panel">
          <CardHeader className="pb-4 sm:pb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl">Swing DNA</CardTitle>
                <CardDescription className="text-sm">Your swing characteristics determine shaft selection</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 sm:space-y-6">
            <div className="grid gap-5 sm:gap-6">
              {/* Swing Speed */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm sm:text-base flex items-center gap-2">
                    <Gauge className="w-4 h-4" />
                    Driver Swing Speed
                  </Label>
                  <span className="text-base sm:text-lg font-mono font-semibold text-primary">{swingDNA.swingSpeed} mph</span>
                </div>
                <Slider
                  value={[swingDNA.swingSpeed]}
                  onValueChange={([v]) => handleSwingDNAChange('swingSpeed', v)}
                  min={60}
                  max={130}
                  step={1}
                  className="py-1"
                />
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Recommended Flex:</span>
                  <span className="text-primary font-semibold">{recommendedFlex}</span>
                </div>
              </div>

              {/* Transition Force */}
              <div className="space-y-3">
                <Label className="text-sm sm:text-base">Transition Force</Label>
                <RadioGroup
                  value={swingDNA.transitionForce}
                  onValueChange={(v) => handleSwingDNAChange('transitionForce', v as 'smooth' | 'moderate' | 'aggressive')}
                  className="grid grid-cols-3 gap-2 sm:gap-3"
                >
                  {['smooth', 'moderate', 'aggressive'].map((force) => (
                    <div key={force}>
                      <RadioGroupItem
                        value={force}
                        id={`force-${force}`}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={`force-${force}`}
                        className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-3 sm:p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/10 cursor-pointer transition-all"
                      >
                        <span className="text-sm sm:text-base font-medium capitalize">{force}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Controls butt stiffness and shaft weight selection
                </p>
              </div>

              {/* Release Point */}
              <div className="space-y-3">
                <Label className="text-sm sm:text-base flex items-center gap-2">
                  <Hand className="w-4 h-4" />
                  Release Point
                </Label>
                <RadioGroup
                  value={swingDNA.releasePoint}
                  onValueChange={(v) => handleSwingDNAChange('releasePoint', v as 'early' | 'mid' | 'late')}
                  className="grid grid-cols-3 gap-2 sm:gap-3"
                >
                  {['early', 'mid', 'late'].map((release) => (
                    <div key={release}>
                      <RadioGroupItem
                        value={release}
                        id={`release-${release}`}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={`release-${release}`}
                        className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-3 sm:p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/10 cursor-pointer transition-all"
                      >
                        <span className="text-sm sm:text-base font-medium capitalize">{release}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  The &quot;Great Divider&quot; - controls tip stiffness and head loft
                </p>
              </div>

              {/* Tempo */}
              <div className="space-y-3">
                <Label className="text-sm sm:text-base">Tempo (Backswing:Downswing)</Label>
                <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground px-1">
                  <span>Quick (2:1)</span>
                  <span className="text-base sm:text-lg font-mono font-semibold text-primary">{swingDNA.tempo}:1</span>
                  <span>Slow (4:1)</span>
                </div>
                <Slider
                  value={[swingDNA.tempo]}
                  onValueChange={([v]) => handleSwingDNAChange('tempo', v)}
                  min={2}
                  max={4}
                  step={0.5}
                  className="py-1"
                />
              </div>

              {/* Attack Angle */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm sm:text-base">Attack Angle</Label>
                  <span className="text-base sm:text-lg font-mono font-semibold text-primary">{swingDNA.attackAngle > 0 ? '+' : ''}{swingDNA.attackAngle}°</span>
                </div>
                <Slider
                  value={[swingDNA.attackAngle]}
                  onValueChange={([v]) => handleSwingDNAChange('attackAngle', v)}
                  min={-6}
                  max={6}
                  step={0.5}
                  className="py-1"
                />
                <div className="flex justify-between text-xs text-muted-foreground px-1">
                  <span>Down (-6°)</span>
                  <span>Level (0°)</span>
                  <span>Up (+6°)</span>
                </div>
              </div>

              {/* Club Path */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm sm:text-base">Club Path</Label>
                  <span className="text-base sm:text-lg font-mono font-semibold text-primary">{swingDNA.path > 0 ? '+' : ''}{swingDNA.path}°</span>
                </div>
                <Slider
                  value={[swingDNA.path]}
                  onValueChange={([v]) => handleSwingDNAChange('path', v)}
                  min={-8}
                  max={8}
                  step={0.5}
                  className="py-1"
                />
                <div className="flex justify-between text-xs text-muted-foreground px-1">
                  <span>Out-to-In (-8°)</span>
                  <span>Square (0°)</span>
                  <span>In-to-Out (+8°)</span>
                </div>
              </div>
            </div>

            {/* Summary Card */}
            <div className="p-4 sm:p-5 rounded-xl bg-primary/5 border border-primary/20">
              <h4 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4">Initial Recommendations</h4>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs sm:text-sm">Shaft Flex</span>
                  <p className="font-semibold text-primary text-sm sm:text-base">{recommendedFlex}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs sm:text-sm">Driver Length</span>
                  <p className="font-semibold text-primary text-sm sm:text-base">{recommendedDriverLength}&quot;</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs sm:text-sm">5-Iron Length</span>
                  <p className="font-semibold text-primary text-sm sm:text-base">{recommended5IronLength}&quot;</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs sm:text-sm">Release Point</span>
                  <p className="font-semibold text-primary text-sm sm:text-base capitalize">{swingDNA.releasePoint}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep(2)} className="h-11 sm:h-10 flex-1 sm:flex-none">
                Back
              </Button>
              <Button onClick={handleSubmit} className="h-11 sm:h-10 flex-1 sm:flex-none">
                Create Profile
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

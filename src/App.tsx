import { useState, useEffect } from 'react';
import { 
  User, 
  Activity, 
  Target, 
  Layers, 
  Wrench,
  ChevronRight,
  ChevronLeft,
  Save,
  RotateCcw,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { toast } from 'sonner';

import type { PlayerProfile, FittingPhase, FittingSession, ClubAssembly, BagBlueprint } from '@/types';
import { ThemeProvider } from '@/hooks/useTheme';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PhaseOnboarding } from '@/sections/PhaseOnboarding';
import { PhaseDiagnostics } from '@/sections/PhaseDiagnostics';
import { PhaseMatching } from '@/sections/PhaseMatching';
import { PhaseBlueprint } from '@/sections/PhaseBlueprint';
import { PhaseWorkshop } from '@/sections/PhaseWorkshop';
import { calculateMOI, calculateSwingweight, calculateFrequency, calculateTotalWeight } from '@/lib/calculations';

const phases: { id: FittingPhase; label: string; shortLabel: string; icon: React.ElementType }[] = [
  { id: 'onboarding', label: 'Bio-Mechanical', shortLabel: 'Bio', icon: User },
  { id: 'diagnostics', label: 'Live Session', shortLabel: 'Live', icon: Activity },
  { id: 'matching', label: 'Component Match', shortLabel: 'Match', icon: Target },
  { id: 'blueprint', label: 'Full Bag MOI', shortLabel: 'MOI', icon: Layers },
  { id: 'workshop', label: 'Build Sheet', shortLabel: 'Build', icon: Wrench },
];

function AppContent() {
  const [currentPhase, setCurrentPhase] = useState<FittingPhase>('onboarding');
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [session, setSession] = useState<FittingSession | null>(null);
  const [recommendations, setRecommendations] = useState<ClubAssembly[]>([]);
  const [blueprint, setBlueprint] = useState<BagBlueprint | null>(null);
  const [progress, setProgress] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentPhaseIndex = phases.findIndex(p => p.id === currentPhase);

  useEffect(() => {
    setProgress(((currentPhaseIndex + 1) / phases.length) * 100);
  }, [currentPhaseIndex]);

  const handlePhaseChange = (direction: 'next' | 'prev') => {
    const newIndex = direction === 'next' 
      ? Math.min(currentPhaseIndex + 1, phases.length - 1)
      : Math.max(currentPhaseIndex - 1, 0);
    setCurrentPhase(phases[newIndex].id);
  };

  const handleProfileComplete = (newProfile: PlayerProfile) => {
    setProfile(newProfile);
    toast.success('Profile created successfully');
    handlePhaseChange('next');
  };

  const handleSessionUpdate = (updatedSession: FittingSession) => {
    setSession(updatedSession);
  };

  const handleRecommendationsUpdate = (newRecommendations: ClubAssembly[]) => {
    setRecommendations(newRecommendations);
    // Recalculate specs for all recommendations
    const updated = newRecommendations.map(club => ({
      ...club,
      specs: {
        ...club.specs,
        moi: calculateMOI(club),
        swingweight: calculateSwingweight(club),
        frequency: calculateFrequency(club),
        totalWeight: calculateTotalWeight(club)
      }
    }));
    setRecommendations(updated);
  };

  const handleBlueprintUpdate = (newBlueprint: BagBlueprint) => {
    setBlueprint(newBlueprint);
  };

  const canProceed = () => {
    switch (currentPhase) {
      case 'onboarding':
        return profile !== null;
      case 'diagnostics':
        return session && session.shots.length > 0;
      case 'matching':
        return recommendations.length > 0;
      case 'blueprint':
        return blueprint !== null;
      default:
        return true;
    }
  };

  const renderPhase = () => {
    switch (currentPhase) {
      case 'onboarding':
        return (
          <PhaseOnboarding 
            onComplete={handleProfileComplete}
            initialProfile={profile}
          />
        );
      case 'diagnostics':
        return (
          <PhaseDiagnostics 
            profile={profile}
            session={session}
            onSessionUpdate={handleSessionUpdate}
          />
        );
      case 'matching':
        return (
          <PhaseMatching 
            profile={profile}
            recommendations={recommendations}
            onRecommendationsUpdate={handleRecommendationsUpdate}
          />
        );
      case 'blueprint':
        return (
          <PhaseBlueprint 
            recommendations={recommendations}
            blueprint={blueprint}
            onBlueprintUpdate={handleBlueprintUpdate}
          />
        );
      case 'workshop':
        return (
          <PhaseWorkshop 
            blueprint={blueprint}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-border/50 safe-area-inset-top">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold tracking-tight">
                  Wishon-Logic
                </h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
                  Precision Fitting Engine
                </p>
              </div>
            </div>
            
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              {profile && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Player:</span>
                  <span className="font-medium">{profile.name}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button variant="ghost" size="sm" onClick={() => toast.info('Session saved')}>
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
                <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Reset
                </Button>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center gap-1">
              <ThemeToggle />
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="touch-target h-9 w-9">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                  <div className="flex flex-col gap-6 mt-6">
                    {profile && (
                      <div className="p-4 rounded-lg bg-secondary/50">
                        <span className="text-sm text-muted-foreground">Current Player</span>
                        <p className="font-medium text-lg">{profile.name}</p>
                      </div>
                    )}
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground px-2">Actions</h3>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start" 
                        onClick={() => { toast.info('Session saved'); setMobileMenuOpen(false); }}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Session
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start" 
                        onClick={() => { window.location.reload(); setMobileMenuOpen(false); }}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset Application
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground px-2">Navigation</h3>
                      <div className="space-y-1">
                        {phases.map((phase, index) => {
                          const Icon = phase.icon;
                          const isActive = phase.id === currentPhase;
                          const isCompleted = index < currentPhaseIndex;
                          return (
                            <button
                              key={phase.id}
                              onClick={() => { setCurrentPhase(phase.id); setMobileMenuOpen(false); }}
                              className={`touch-target w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                                isActive 
                                  ? 'bg-primary/20 text-primary font-medium' 
                                  : 'hover:bg-secondary text-muted-foreground'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                              <span>{phase.label}</span>
                              {isCompleted && (
                                <div className="ml-auto w-2 h-2 rounded-full bg-primary" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Phase Navigation - Desktop */}
      <div className="hidden md:block border-b border-border/50 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 lg:gap-2">
              {phases.map((phase, index) => {
                const Icon = phase.icon;
                const isActive = phase.id === currentPhase;
                const isCompleted = index < currentPhaseIndex;
                
                return (
                  <button
                    key={phase.id}
                    onClick={() => setCurrentPhase(phase.id)}
                    className={`phase-indicator ${isActive ? 'active' : 'inactive'}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline">{phase.label}</span>
                    <span className="lg:hidden">{phase.shortLabel}</span>
                    {isCompleted && (
                      <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center ml-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPhaseIndex === 0}
                onClick={() => handlePhaseChange('prev')}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPhaseIndex === phases.length - 1 || !canProceed()}
                onClick={() => handlePhaseChange('next')}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Phase Navigation - Mobile */}
      <div className="md:hidden border-b border-border/50 bg-secondary/30">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {phases.map((phase, index) => {
              const Icon = phase.icon;
              const isActive = phase.id === currentPhase;
              const isCompleted = index < currentPhaseIndex;
              
              return (
                <button
                  key={phase.id}
                  onClick={() => setCurrentPhase(phase.id)}
                  className={`touch-target flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    isActive 
                      ? 'bg-primary/20 text-primary border border-primary/30' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{phase.shortLabel}</span>
                  {isCompleted && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary ml-0.5" />
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-1 ml-2 shrink-0">
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11"
              disabled={currentPhaseIndex === 0}
              onClick={() => handlePhaseChange('prev')}
            >
              <ChevronLeft className="w-3 h-3" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11"
              disabled={currentPhaseIndex === phases.length - 1 || !canProceed()}
              onClick={() => handlePhaseChange('next')}
            >
              <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-border/50">
        <div 
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {renderPhase()}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-auto">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between text-[10px] sm:text-xs text-muted-foreground gap-1 sm:gap-0">
            <div className="flex items-center gap-2 sm:gap-4">
              <span>Wishon-Logic v1.0</span>
              <span className="hidden sm:inline">|</span>
              <span className="hidden sm:inline">Tom Wishon&apos;s Common Sense Clubfitting</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <span>MOI Matching</span>
              <span className="hidden sm:inline">|</span>
              <span>4&quot; Pivot</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="wishon-theme">
      <AppContent />
    </ThemeProvider>
  );
}

export default App;

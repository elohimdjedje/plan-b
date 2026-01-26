import { useState } from 'react';
import MobileContainer from '../components/layout/MobileContainer';
import GlassCard from '../components/common/GlassCard';
import Button from '../components/common/Button';
import ElephantLoader from '../components/animations/ElephantLoader';
import LoadingScreen from '../components/common/LoadingScreen';
import SplashScreen from '../components/animations/SplashScreen';
import { Play, Loader2, Smartphone } from 'lucide-react';

/**
 * Page de démonstration des animations
 */
export default function AnimationDemo() {
  const [showSplash, setShowSplash] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);

  return (
    <MobileContainer 
      headerProps={{ 
        title: 'Animations',
        showLogo: false
      }}
    >
      <div className="space-y-6 pb-24">
        <h1 className="text-2xl font-bold text-secondary-900">
          Démonstration des animations
        </h1>

        {/* Splash Screen */}
        <GlassCard>
          <h2 className="text-xl font-bold text-secondary-900 mb-4">
            🌍 Splash Screen
          </h2>
          <p className="text-secondary-600 mb-4">
            Carte de l'Afrique avec contours fluos (orange, blanc, vert)
          </p>
          <Button
            variant="primary"
            onClick={() => setShowSplash(true)}
            icon={<Play size={20} />}
          >
            Voir le Splash Screen
          </Button>
        </GlassCard>

        {/* Elephant Loader - Tailles */}
        <GlassCard>
          <h2 className="text-xl font-bold text-secondary-900 mb-4">
            🐘 Elephant Loader - Tailles
          </h2>
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <p className="text-sm text-secondary-600 mb-4">Petite (sm)</p>
              <ElephantLoader size="sm" text="Petite taille" />
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <p className="text-sm text-secondary-600 mb-4">Moyenne (md)</p>
              <ElephantLoader size="md" text="Taille moyenne" />
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <p className="text-sm text-secondary-600 mb-4">Grande (lg)</p>
              <ElephantLoader size="lg" text="Grande taille" />
            </div>
          </div>
        </GlassCard>

        {/* Loading Screen */}
        <GlassCard>
          <h2 className="text-xl font-bold text-secondary-900 mb-4 flex items-center gap-2">
            <Smartphone size={24} />
            Loading Screen
          </h2>
          <p className="text-secondary-600 mb-4">
            Écran de chargement pleine page avec les éléphants
          </p>
          <Button
            variant="secondary"
            onClick={() => {
              setShowLoadingScreen(true);
              setTimeout(() => setShowLoadingScreen(false), 3000);
            }}
            icon={<Loader2 size={20} />}
          >
            Voir le Loading Screen (3s)
          </Button>
        </GlassCard>

        {/* Exemples d'utilisation */}
        <GlassCard className="bg-blue-50/80">
          <h2 className="text-lg font-bold text-blue-900 mb-3">
            💡 Comment utiliser
          </h2>
          <div className="space-y-2 text-sm text-blue-800">
            <p><strong>ElephantLoader :</strong></p>
            <code className="block bg-white/50 p-2 rounded mt-1">
              {`<ElephantLoader size="md" text="Chargement..." />`}
            </code>
            
            <p className="mt-3"><strong>LoadingScreen :</strong></p>
            <code className="block bg-white/50 p-2 rounded mt-1">
              {`<LoadingScreen text="Chargement des données..." />`}
            </code>
          </div>
        </GlassCard>
      </div>

      {/* Affichage conditionnel du splash */}
      {showSplash && (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      )}

      {/* Affichage conditionnel du loading screen */}
      {showLoadingScreen && (
        <LoadingScreen text="Chargement en cours..." />
      )}
    </MobileContainer>
  );
}

import ElephantLoader from '../animations/ElephantLoader';

/**
 * Écran de chargement pleine page avec les éléphants
 */
export default function LoadingScreen({ text = 'Chargement...' }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <ElephantLoader size="lg" text={text} />
    </div>
  );
}

import { useState } from 'react';
import AnimatedPortfolio from '../component/ultra-animated-portfolio';
import Preloader from '../component/Preloader';

function App() {
  const [showPreloader, setShowPreloader] = useState(true);

  return (
    <>
      {/* 1. Render the Portfolio IMMEDIATELY so it starts loading & animating.
           It stays in the background because of z-index.
      */}
      <AnimatedPortfolio />

      {/* 2. Render Preloader on top. 
           When it finishes, it just unmounts, revealing the already-running scene.
      */}
      {showPreloader && <Preloader onFinished={() => setShowPreloader(false)} />}
    </>
  );
}

export default App;

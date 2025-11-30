import { useState } from 'react';
import AnimatedPortfolio from '../component/ultra-animated-portfolio';
import Preloader from '../component/Preloader';

function App() {
  const [showPreloader, setShowPreloader] = useState(true);

  return (
    <>
      <AnimatedPortfolio introPlaying={showPreloader} />
      {showPreloader && <Preloader onFinished={() => setShowPreloader(false)} />}
    </>
  );
}

export default App;

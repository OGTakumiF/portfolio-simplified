import { useState } from 'react';
import AnimatedPortfolio from '../component/ultra-animated-portfolio';
import Preloader from '../component/Preloader';

function App() {
  const [showPreloader, setShowPreloader] = useState(true);

  return (
    <>
      {showPreloader && <Preloader onFinished={() => setShowPreloader(false)} />}
      {!showPreloader && <AnimatedPortfolio />}
    </>
  );
}

export default App;
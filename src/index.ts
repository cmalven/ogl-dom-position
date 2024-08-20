import { getGPUTier } from 'detect-gpu';
import Example from './modules/Scene';

import type Gui from '@malven/gui';
import type { TierResult } from 'detect-gpu';

interface App {
  devMode: boolean,
  gui?: Gui,
  gpu?: TierResult,
}

declare global {
  interface Window {
    APP: App;
  }
}

window.APP = {
  devMode: true,
};

const enableGpuDetect = true;
const enableGui = window.APP.devMode;

const readyPromises = [];

// Detect GPU
if (enableGpuDetect) {
  readyPromises.push(getGPUTier().then(gpuDetails => {
    window.APP.gpu = gpuDetails;
  }));
}

// GUI
if (enableGui) {
  const guiPromise = import('@malven/gui').then(({ default: Gui }) => {
    // Add Gui and connect knobs for MidiFighter Twister
    window.APP.gui = new Gui({
      midi: window.location.hostname === 'localhost',
    });
    window.APP.gui.configureDevice('Midi Fighter Twister');
  }).catch(error => 'An error occurred while loading GUI');
  readyPromises.push(guiPromise);
}

Promise.all(readyPromises).then(() => {
  // Initialize custom code…
  new Example();
});

import Scene from './modules/Scene';

import type Gui from '@malven/gui';

interface App {
  devMode: boolean,
  gui?: Gui,
}

declare global {
  interface Window {
    APP: App;
  }
}

window.APP = {
  devMode: true,
};

const enableGui = window.APP.devMode;

const readyPromises = [];

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
  new Scene();
});

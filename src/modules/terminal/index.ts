/**
 * Terminal module entry: registers with the experience registry and lazy-loads the runtime.
 * A deep link (?view=terminal) or the dev page switches Full Experience on so the terminal can open.
 */
import { registerModule, setMode } from '../../lib/experience';

let rt: typeof import('./runtime') | undefined;

registerModule({
  id: 'terminal',
  enable: async () => {
    rt ??= await import('./runtime');
    rt.mount();
  },
  disable: () => rt?.unmount(),
});

if (new URLSearchParams(location.search).get('view') === 'terminal' || document.querySelector('[data-terminal-host][data-auto-open]')) {
  setMode('full');
}

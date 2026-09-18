/**
 * Discovery module entry: registers with the experience registry and lazy-loads the runtime
 * (store + eggs + counter UI) the first time Full Experience is switched on.
 */
import { registerModule } from '../../lib/experience';

let rt: typeof import('./runtime') | undefined;

registerModule({
  id: 'discovery',
  enable: async () => {
    rt ??= await import('./runtime');
    rt.mount();
  },
  disable: () => rt?.unmount(),
});

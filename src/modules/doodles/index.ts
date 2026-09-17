/**
 * Doodle module entry: registers with the experience registry and lazy-loads the real thing
 * (paths + positioning) the first time Full Experience is switched on. Standard mode pays only
 * for this stub. Placements come from site.config via a JSON <script> rendered by Doodles.astro.
 */
import { registerModule } from '../../lib/experience';

let mounted: typeof import('./mount') | undefined;

registerModule({
  id: 'doodles',
  enable: async () => {
    mounted ??= await import('./mount');
    mounted.mount();
  },
  disable: () => mounted?.unmount(),
});

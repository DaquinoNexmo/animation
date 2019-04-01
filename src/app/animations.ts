import { trigger, state, transition, style, animate} from '@angular/animations';


export let fade = trigger('fade', [
    state('void', style({ opacity: 0})),
    transition('void => *, * => void', [
      animate(2000)
    ]),
  ]);

export let fadeFast = trigger('fadeFast', [
    state('void', style({ opacity: 0})),
    transition('void => *, * => void', [
      animate(2000)
    ]),
  ]);
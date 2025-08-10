import {
  ChoiceInteraction,
  ChoiceVideoSegmentChangeInteraction,
  ChoiceVideoSegmentChangeOption,
  CuePoint as Cue,
  Decision,
  DecisionAdapter,
  TextInteraction,
  InteractionPayload,
  RatingInteraction,
} from './types';
import { I18n } from './i18n';

type InteractionHandler = (payload: InteractionPayload, cue: Cue) => void;
type ResponseHandler = (response: any, cue: Cue) => void;

export class InteractionManager {
  private onPromptCallback?: InteractionHandler;
  private onResponseCallback?: ResponseHandler;
  private container: HTMLElement;
  private interactionDiv: HTMLElement | null = null;
  private interactionStore: Map<number, Cue>;
  private i18n: I18n;
  private decisionAdapter: DecisionAdapter;

  private interactionRenderers = {
    choice: this.renderChoiceInteraction.bind(this) as (
      payload: ChoiceInteraction,
      cue: Cue
    ) => void,
    text: this.renderTextInteraction.bind(this) as (
      payload: TextInteraction,
      cue: Cue
    ) => void,
    rating: this.renderRatingInteraction.bind(this) as (
      payload: RatingInteraction,
      cue: Cue
    ) => void,
    'choice-video-segment-change': this.renderChoiceVideoSegmentChangeInteraction.bind(
      this
    ) as (payload: ChoiceVideoSegmentChangeInteraction, cue: Cue) => void,
    default: this.renderDefaultInteraction.bind(this) as (
      payload: InteractionPayload,
      cue: Cue
    ) => void,
  };

  constructor(container: HTMLElement, i18n: I18n, decisionAdapter: DecisionAdapter) {
    this.container = container;
    this.i18n = i18n;
    this.decisionAdapter = decisionAdapter;
    this.interactionStore = new Map();
  }

  public loadInteractions(interactions: Cue[]) {
    interactions.forEach((cue) => {
      if (cue.time != null && cue.payload?.interaction) {
        this.interactionStore.set(cue.time, cue);
      }
    });
  }

  public onPrompt(handler: InteractionHandler) {
    this.onPromptCallback = handler;
  }

  public onResponse(handler: ResponseHandler) {
    this.onResponseCallback = handler;
  }

  public handleInteractionCue(cue: Cue) {
    const payload = cue.payload?.interaction;
    if (payload) {
      this.onPromptCallback?.(payload, cue);
      this.renderInteraction(payload, cue);
    }
  }

  private renderInteraction(payload: InteractionPayload, cue: Cue) {
    this.clearInteractions();
    this.interactionDiv = document.createElement('div');
    this.interactionDiv.className = 'ivl-interaction-overlay';

    if (payload.title) {
      const title = document.createElement('h3');
      title.textContent = this.i18n.translate(payload.title);
      this.interactionDiv.appendChild(title);
    }

    if (payload.description) {
      const desc = document.createElement('p');
      desc.textContent = this.i18n.translate(payload.description);
      this.interactionDiv.appendChild(desc);
    }

    const renderer =
      this.interactionRenderers[payload.type] || this.interactionRenderers.default;
    renderer(payload as any, cue);

    this.container.appendChild(this.interactionDiv);
  }


  private renderRatingInteraction(payload: InteractionPayload, cue: Cue): void {
  if (!this.interactionDiv) return;

  const question = document.createElement('p');
  question.textContent = this.i18n.translate(payload.question);
  this.interactionDiv.appendChild(question);

  const ratingContainer = document.createElement('div');
  ratingContainer.className = 'ivl-rating-container';

  for (let i = 1; i <= 5; i++) {
    const button = document.createElement('button');
    button.className = 'ivl-rating-button';
    button.dataset.response = String(i);
    button.textContent = `${i} ★`;
    ratingContainer.appendChild(button);
  }

  this.interactionDiv.appendChild(ratingContainer);

  ratingContainer.addEventListener('click', (event) => {
    const target = event.target as HTMLButtonElement;
    if (target.matches('.ivl-rating-button')) {
      this.handleUserResponse(target.dataset.response, cue);
      this.clearInteractions();
    }
  });
}

  private renderChoiceInteraction(payload: ChoiceInteraction, cue: Cue) {
    if (!this.interactionDiv) return;

    const question = document.createElement('p');
    question.textContent = this.i18n.translate(payload.question);
    this.interactionDiv.appendChild(question);

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'ivl-choice-buttons';

    payload.options.forEach((option) => {
      const button = document.createElement('button');
      button.className = 'ivl-choice-button';
      button.dataset.response = option;
      button.textContent = this.i18n.translate(option);
      buttonContainer.appendChild(button);
    });

    this.interactionDiv.appendChild(buttonContainer);

    buttonContainer.addEventListener('click', (event) => {
      const target = event.target as HTMLButtonElement;
      if (target.matches('.ivl-choice-button')) {
        this.handleUserResponse(target.dataset.response, cue);
        this.clearInteractions();
      }
    });
  }

  private renderChoiceVideoSegmentChangeInteraction(
    payload: ChoiceVideoSegmentChangeInteraction,
    cue: Cue
  ) {
    if (!this.interactionDiv) return;

    const question = document.createElement('p');
    question.textContent = this.i18n.translate(payload.question);
    this.interactionDiv.appendChild(question);

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'ivl-choice-buttons';

    payload.options.forEach((option: ChoiceVideoSegmentChangeOption) => {
      const button = document.createElement('button');
      button.className = 'ivl-choice-button';
      button.dataset.response = option.video;
      button.textContent = this.i18n.translate(option.level);
      buttonContainer.appendChild(button);
    });

    this.interactionDiv.appendChild(buttonContainer);

    buttonContainer.addEventListener('click', (event) => {
      const target = event.target as HTMLButtonElement;
      if (target.matches('.ivl-choice-button')) {
        this.handleUserResponse(target.dataset.response, cue);
        this.clearInteractions();
      }
    });
  }

  private renderTextInteraction(payload: TextInteraction, cue: Cue) {
    if (!this.interactionDiv) return;

    const question = document.createElement('p');
    question.textContent = this.i18n.translate(payload.question);
    this.interactionDiv.appendChild(question);

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = this.i18n.translate('Enter your response');
    this.interactionDiv.appendChild(input);

    const button = document.createElement('button');
    button.textContent = this.i18n.translate('Submit');
    this.interactionDiv.appendChild(button);

    button.addEventListener('click', () => {
      this.handleUserResponse(input.value, cue);
      this.clearInteractions();
    });
  }

  private renderDefaultInteraction(payload: InteractionPayload, cue: Cue) {
    if (!this.interactionDiv) return;

    const question = document.createElement('p');
    question.textContent = this.i18n.translate(payload.question);
    this.interactionDiv.appendChild(question);

    const button = document.createElement('button');
    button.textContent = this.i18n.translate('Respond');
    this.interactionDiv.appendChild(button);

    button.addEventListener('click', () => {
      this.handleUserResponse('User responded!', cue);
      this.clearInteractions();
    });
  }

  private clearInteractions() {
    this.interactionDiv?.remove();
    this.interactionDiv = null;
  }

  public handleUserResponse(response: any, cue: Cue) {
    const payload = cue.payload?.interaction;

    if (!this.onResponseCallback) return;

    const decision: Decision = {
      cueId: cue.id,
      choice: response,
      timestamp: Date.now(),
      metadata: { interactionType: payload?.type },
    };

    this.decisionAdapter.saveDecision(decision);

    if (payload?.type === 'choice-video-segment-change') {
      this.onResponseCallback({ nextSegment: response }, cue);
    } else if (payload && typeof payload.response === 'object' && payload.response[response]) {
      this.onResponseCallback(payload.response[response], cue);
    } else {
      this.onResponseCallback(response, cue);
    }
  }

  public destroy() {
    this.onPromptCallback = undefined;
    this.onResponseCallback = undefined;
    this.clearInteractions();
    this.interactionStore.clear();
  }
}

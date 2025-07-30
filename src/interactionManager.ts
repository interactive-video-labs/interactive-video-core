import { ChoiceVideoSegmentChangeOption, CuePoint as Cue } from './types';
import { InteractionPayload } from './types';
import { I18n } from './i18n';

type InteractionHandler = (payload: InteractionPayload, cue: Cue) => void;
type ResponseHandler = (response: any, cue: Cue) => void;
type InteractionRenderer = (payload: InteractionPayload, cue: Cue) => void;

/**
 * Manages the lifecycle of interactions within the player.
 * This class is responsible for rendering interactions, handling user responses,
 * and communicating with the parent application.
 */
export class InteractionManager {
  private onPromptCallback?: InteractionHandler;
  private onResponseCallback?: ResponseHandler;
  private container: HTMLElement;
  private interactionDiv: HTMLElement | null = null;
  private interactionRenderers: Record<string, InteractionRenderer>;
  private interactionStore: Map<number, Cue>;
  private i18n: I18n;

  /**
   * Creates an instance of InteractionManager.
   * @param container - The container element where interactions will be rendered.
   * @param i18n - The I18n instance for localization.
   */
  constructor(container: HTMLElement, i18n: I18n) {
    this.container = container;
    this.i18n = i18n;
    this.interactionStore = new Map();

    this.interactionRenderers = {
      'choice': this.renderChoiceInteraction.bind(this),
      'text': this.renderTextInteraction.bind(this),
      'choice-video-segment-change': this.renderChoiceInteraction.bind(this),
      'default': this.renderDefaultInteraction.bind(this),
    };
  }

  /**
   * Determines if the options array contains only strings.
   * @param options - Array of options to check.
   * @returns True if the array consists of strings only.
   */
  private _isStringOptions(options: (string | ChoiceVideoSegmentChangeOption)[] | undefined): options is string[] {
    return Array.isArray(options) && options.length > 0 && typeof options[0] === 'string';
  }

  /**
   * Loads interactions from a given array of cue points.
   * Stores them internally mapped by cue time.
   * @param interactions - An array of interaction cue objects to be loaded.
   */
  public loadInteractions(interactions: Cue[]) {
    interactions.forEach((cue) => {
      if (cue.time != null && cue.payload?.interaction) {
        this.interactionStore.set(cue.time, cue);
      }
    });
    console.log('Interactions loaded into store:', this.interactionStore);
  }

  /**
   * Registers a callback for when an interaction prompt is triggered.
   * @param handler - The function to call on interaction prompt.
   */
  public onPrompt(handler: InteractionHandler) {
    this.onPromptCallback = handler;
  }

  /**
   * Registers a callback for when a user responds to an interaction.
   * @param handler - The function to call on user response.
   */
  public onResponse(handler: ResponseHandler) {
    this.onResponseCallback = handler;
  }

  /**
   * Handles an interaction cue by rendering it and invoking the prompt handler.
   * @param cue - Cue containing interaction metadata.
   */
  public handleInteractionCue(cue: Cue) {
    const payload = cue.payload?.interaction as InteractionPayload | undefined;
    if (payload) {
      if (this.onPromptCallback) {
        this.onPromptCallback(payload, cue);
      }
      this.renderInteraction(payload, cue);
    }
  }

  /**
   * Renders the interaction UI based on type and cue.
   */
  private renderInteraction(payload: InteractionPayload, cue: Cue): void {
    this.clearInteractions();
    this.interactionDiv = document.createElement('div');
    this.interactionDiv.className = 'ivl-interaction-overlay';

    const title = document.createElement('h3');
    title.textContent = this.i18n.translate(payload.title || 'Interaction');
    this.interactionDiv.appendChild(title);

    if (payload.description) {
      const description = document.createElement('p');
      description.textContent = this.i18n.translate(payload.description);
      this.interactionDiv.appendChild(description);
    }

    const renderer = this.interactionRenderers[payload.type] || this.interactionRenderers['default'];
    renderer(payload, cue);

    this.container.appendChild(this.interactionDiv);
  }

  /**
   * Renders choice-based interactions.
   */
  private renderChoiceInteraction(payload: InteractionPayload, cue: Cue): void {
    if (!this.interactionDiv) return;

    if (payload.question) {
      const question = document.createElement('p');
      question.textContent = this.i18n.translate(payload.question);
      this.interactionDiv.appendChild(question);
    }

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'ivl-choice-buttons';

    if (this._isStringOptions(payload.options)) {
      for (const option of payload.options) {
        const button = document.createElement('button');
        button.className = 'ivl-choice-button';
        button.dataset.response = option;
        button.textContent = this.i18n.translate(option);
        buttonContainer.appendChild(button);
      }
    } else if (payload.options) {
      const choiceOptions = payload.options as ChoiceVideoSegmentChangeOption[];
      for (const option of choiceOptions) {
        const button = document.createElement('button');
        button.className = 'ivl-choice-button';
        button.dataset.response = option.video;
        button.textContent = this.i18n.translate(option.level);
        buttonContainer.appendChild(button);
      }
    }

    this.interactionDiv.appendChild(buttonContainer);

    buttonContainer.addEventListener('click', (event) => {
      const target = event.target as HTMLButtonElement;
      if (target.matches('.ivl-choice-button')) {
        const response = target.dataset.response;
        if (response) {
          this.handleUserResponse(response, cue);
          this.clearInteractions();
        }
      }
    });
  }

  /**
   * Renders text-based interactions.
   */
  private renderTextInteraction(payload: InteractionPayload, cue: Cue): void {
    if (!this.interactionDiv) return;

    if (payload.question) {
      const question = document.createElement('p');
      question.textContent = this.i18n.translate(payload.question);
      this.interactionDiv.appendChild(question);
    }

    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.id = 'ivl-text-input';
    textInput.placeholder = this.i18n.translate('Enter your response');
    this.interactionDiv.appendChild(textInput);

    const submitButton = document.createElement('button');
    submitButton.id = 'ivl-submit-button';
    submitButton.textContent = this.i18n.translate('Submit');
    this.interactionDiv.appendChild(submitButton);

    submitButton.addEventListener('click', () => {
      const response = textInput.value;
      this.handleUserResponse(response, cue);
      this.clearInteractions();
    });
  }

  /**
   * Renders default interaction fallback.
   */
  private renderDefaultInteraction(payload: InteractionPayload, cue: Cue): void {
    if (!this.interactionDiv) return;

    if (payload.question) {
      const question = document.createElement('p');
      question.textContent = this.i18n.translate(payload.question);
      this.interactionDiv.appendChild(question);
    }

    const button = document.createElement('button');
    button.id = 'ivl-interaction-button';
    button.textContent = this.i18n.translate('Respond');
    this.interactionDiv.appendChild(button);

    button.addEventListener('click', () => {
      this.handleUserResponse('User responded!', cue);
      this.clearInteractions();
    });
  }

  /**
   * Clears currently rendered interaction UI.
   */
  private clearInteractions(): void {
    if (this.interactionDiv) {
      this.interactionDiv.remove();
      this.interactionDiv = null;
    }
  }

  /**
   * Invokes the response handler with processed data.
   */
  public handleUserResponse(response: any, cue: Cue) {
    if (this.onResponseCallback) {
      const interactionPayload = cue.payload?.interaction as InteractionPayload | undefined;
      if (interactionPayload?.type === 'choice-video-segment-change') {
        this.onResponseCallback({ nextSegment: response }, cue);
      } else if (interactionPayload?.response?.[response]) {
        this.onResponseCallback(interactionPayload.response[response], cue);
      } else {
        this.onResponseCallback(response, cue);
      }
    }
  }

  /**
   * Destroys the manager and clears memory.
   */
  public destroy() {
    this.onPromptCallback = undefined;
    this.onResponseCallback = undefined;
    this.clearInteractions();
    this.interactionStore.clear();
  }
}

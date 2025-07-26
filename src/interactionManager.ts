import { CuePoint as Cue } from './types'
import { InteractionPayload } from './types'

type InteractionHandler = (payload: InteractionPayload, cue: Cue) => void
type ResponseHandler = (response: any, cue: Cue) => void

/**
 * Manages the lifecycle of interactions within the player.
 * This class is responsible for rendering interactions, handling user responses,
 * and communicating with the parent application.
 */
export class InteractionManager {
  private onPromptCallback?: InteractionHandler
  private onResponseCallback?: ResponseHandler
  private container: HTMLElement
  private interactionDiv: HTMLElement | null = null;

  constructor(container: HTMLElement) {
    this.container = container
  }

  public loadInteractions(interactions: any[]) {
    // TODO: Implement interaction loading logic
    console.log('Loading interactions:', interactions);
  }

  public onPrompt(handler: InteractionHandler) {
    this.onPromptCallback = handler
  }

  public onResponse(handler: ResponseHandler) {
    this.onResponseCallback = handler
  }

  public handleInteractionCue(cue: Cue) {
    const payload = cue.payload?.interaction as InteractionPayload | undefined

    if (payload) {
      if (this.onPromptCallback) {
        this.onPromptCallback(payload, cue)
      }
      this.renderInteraction(payload, cue)
    }
  }

  private renderInteraction(payload: InteractionPayload, cue: Cue): void {
    this.clearInteractions();

    this.interactionDiv = document.createElement('div');
    this.interactionDiv.className = 'ivl-interaction-overlay';

    const title = document.createElement('h3');
    title.textContent = payload.title || 'Interaction';
    this.interactionDiv.appendChild(title);

    if (payload.description) {
      const description = document.createElement('p');
      description.textContent = payload.description;
      this.interactionDiv.appendChild(description);
    }

    switch (payload.type) {
      case 'choice':
        this.renderChoiceInteraction(payload, cue);
        break;
      case 'text':
        this.renderTextInteraction(payload, cue);
        break;
      default:
        this.renderDefaultInteraction(payload, cue);
        break;
    }

    this.container.appendChild(this.interactionDiv);
  }

  private renderChoiceInteraction(payload: InteractionPayload, cue: Cue): void {
    if (!this.interactionDiv) return;

    if (payload.question) {
        const question = document.createElement('p');
        question.textContent = payload.question;
        this.interactionDiv.appendChild(question);
    }

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'ivl-choice-buttons';

    payload.options?.forEach((option: string) => {
      const button = document.createElement('button');
      button.className = 'ivl-choice-button';
      button.dataset.response = option;
      button.textContent = option;
      buttonContainer.appendChild(button);
    });

    this.interactionDiv.appendChild(buttonContainer);

    buttonContainer.addEventListener('click', (event) => {
      const target = event.target as HTMLButtonElement;
      if (target.matches('.ivl-choice-button')) {
        console.log('Choice button clicked!');
        const response = target.dataset.response;
        if (response) {
          this.handleUserResponse(response, cue);
          this.clearInteractions();
        }
      }
    });
  }

  private renderTextInteraction(payload: InteractionPayload, cue: Cue): void {
    if (!this.interactionDiv) return;

    if (payload.question) {
        const question = document.createElement('p');
        question.textContent = payload.question;
        this.interactionDiv.appendChild(question);
    }

    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.id = 'ivl-text-input';
    textInput.placeholder = 'Enter your response';
    this.interactionDiv.appendChild(textInput);

    const submitButton = document.createElement('button');
    submitButton.id = 'ivl-submit-button';
    submitButton.textContent = 'Submit';
    this.interactionDiv.appendChild(submitButton);

    submitButton.addEventListener('click', () => {
      console.log('Submit button clicked!');
      const response = textInput.value;
      this.handleUserResponse(response, cue);
      this.clearInteractions();
    });
  }

  private renderDefaultInteraction(payload: InteractionPayload, cue: Cue): void {
    if (!this.interactionDiv) return;

    if (payload.question) {
        const question = document.createElement('p');
        question.textContent = payload.question;
        this.interactionDiv.appendChild(question);
    }

    const button = document.createElement('button');
    button.id = 'ivl-interaction-button';
    button.textContent = 'Respond';
    this.interactionDiv.appendChild(button);

    button.addEventListener('click', () => {
      console.log('Default interaction button clicked!');
      this.handleUserResponse('User responded!', cue);
      this.clearInteractions();
    });
  }

  private clearInteractions(): void {
    console.log('Clearing interactions.');
    if (this.interactionDiv) {
        this.interactionDiv.remove();
        this.interactionDiv = null;
    }
  }

  public handleUserResponse(response: any, cue: Cue) {
    if (this.onResponseCallback) {
      console.log('Calling onResponseCallback...');
      this.onResponseCallback(response, cue)
    }
  }

  public destroy() {
    this.onPromptCallback = undefined
    this.onResponseCallback = undefined
    this.clearInteractions()
  }
}

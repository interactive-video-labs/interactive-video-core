import { CuePoint as Cue } from './types'
import { InteractionPayload } from './types'

type InteractionHandler = (payload: InteractionPayload, cue: Cue) => void
type ResponseHandler = (response: any, cue: Cue) => void

export class InteractionManager {
  private onPromptCallback?: InteractionHandler
  private onResponseCallback?: ResponseHandler
  private container: HTMLElement // New property to hold the container element

  constructor(container: HTMLElement) { // Modified constructor
    this.container = container
  }

  public loadInteractions(interactions: any[]) {
    // TODO: Implement interaction loading logic
    console.log('Loading interactions:', interactions);
  }

  /**
   * Register a callback to handle user prompts.
   * This is typically where you render UI.
   */
  public onPrompt(handler: InteractionHandler) {
    this.onPromptCallback = handler
  }

  /**
   * Register a callback to receive user responses.
   */
  public onResponse(handler: ResponseHandler) {
    this.onResponseCallback = handler
  }

  /**
   * Called when a cue is reached that includes an interaction.
   */
  public handleInteractionCue(cue: Cue) {
    const payload = cue.payload?.interaction as InteractionPayload | undefined

    if (payload) {
      // Execute the onPrompt callback first, allowing external logic to run before rendering.
      if (this.onPromptCallback) {
        this.onPromptCallback(payload, cue)
      }
      this.renderInteraction(payload, cue) // Call renderInteraction
    }
  }

  /**
   * Renders the interaction UI directly into the container.
   * This is a placeholder implementation.
   */
  private renderInteraction(payload: InteractionPayload, cue: Cue): void {
    this.clearInteractions(); // Clear previous interactions if any

    const interactionDiv = document.createElement('div');
    interactionDiv.className = 'ivl-interaction-overlay'; // Add a class for styling

    let content = `<h3>${payload.title || 'Interaction'}</h3>`;
    if (payload.description) {
      content += `<p>${payload.description}</p>`;
    }

    switch (payload.type) {
      case 'choice':
        content += `<p>${payload.question}</p>`;
        payload.options?.forEach((option: string) => {
          content += `<button class="ivl-choice-button" data-response="${option}">${option}</button>`;
        });
        break;
      case 'text':
        content += `<p>${payload.question}</p>`;
        content += `<input type="text" id="ivl-text-input" placeholder="Enter your response">`;
        content += `<button id="ivl-submit-button">Submit</button>`;
        break;
      default:
        content += `<p>${payload.question || 'Respond to the interaction.'}</p>`;
        content += `<button id="ivl-interaction-button">Respond</button>`;
        break;
    }

    interactionDiv.innerHTML = content;
    this.container.appendChild(interactionDiv);

    // Add event listeners based on interaction type
    switch (payload.type) {
      case 'choice':
        interactionDiv.querySelectorAll('.ivl-choice-button').forEach(button => {
          button.addEventListener('click', (event) => {
            console.log('Choice button clicked!');
            const response = (event.target as HTMLButtonElement).dataset.response;
            if (response) {
              this.handleUserResponse(response, cue);
              this.clearInteractions();
            }
          });
        });
        break;
      case 'text':
        const submitButton = interactionDiv.querySelector('#ivl-submit-button');
        const textInput = interactionDiv.querySelector('#ivl-text-input') as HTMLInputElement;
        if (submitButton && textInput) {
          submitButton.addEventListener('click', () => {
            console.log('Submit button clicked!');
            const response = textInput.value;
            this.handleUserResponse(response, cue);
            this.clearInteractions();
          });
        }
        break;
      default:
        const button = interactionDiv.querySelector('#ivl-interaction-button');
        if (button) {
          button.addEventListener('click', () => {
            console.log('Default interaction button clicked!');
            this.handleUserResponse('User responded!', cue);
            this.clearInteractions();
          });
        }
        break;
    }
  }

  /**
   * Clears any active interactions from the container.
   */
  private clearInteractions(): void {
    console.log('Clearing interactions.')
    const existingInteractions = this.container.querySelectorAll('.ivl-interaction-overlay')
    existingInteractions.forEach(el => el.remove())
  }

  /**
   * Called when user submits a response to the current interaction.
   */
  public handleUserResponse(response: any, cue: Cue) {
    console.log('handleUserResponse called with response:', response, 'and cue:', cue)
    if (this.onResponseCallback) {
      console.log('Calling onResponseCallback...');
      this.onResponseCallback(response, cue)
    }
  }

  public destroy() {
    this.onPromptCallback = undefined
    this.onResponseCallback = undefined
    this.clearInteractions() // Clear interactions on destroy
  }
}

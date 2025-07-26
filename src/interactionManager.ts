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


  /**
   * Creates an instance of InteractionManager.
   * @param container - The container element where interactions will be rendered.
   */
  constructor(container: HTMLElement) {
    this.container = container
  }

  /**
   * Loads interactions from a given source.
   * @param interactions - An array of interaction objects to be loaded.
   */
  public loadInteractions(interactions: any[]) {
    // TODO: Implement interaction loading logic
    console.log('Loading interactions:', interactions);
  }


  /**
   * Registers handlers for interaction prompts and responses.
   * @param handler - The function to be called when an interaction prompt is triggered.
   */
  public onPrompt(handler: InteractionHandler) {
    this.onPromptCallback = handler
  }


  /**
   * Registers a callback function to be invoked when a response event occurs.
   *
   * @param handler - The function to handle the response event.
   */
  public onResponse(handler: ResponseHandler) {
    this.onResponseCallback = handler
  }


  /**
   * Handles an interaction cue by rendering the interaction and invoking the prompt callback.
   * @param cue - The cue point that triggered the interaction.
   */
  public handleInteractionCue(cue: Cue) {
    const payload = cue.payload?.interaction as InteractionPayload | undefined

    if (payload) {
      if (this.onPromptCallback) {
        this.onPromptCallback(payload, cue)
      }
      this.renderInteraction(payload, cue)
    }
  }


  /**
   * Renders the interaction based on the provided payload and cue.
   * This method creates the necessary HTML elements to display the interaction
   * and appends them to the container.
   * @param payload - The interaction payload containing details about the interaction.
   * @param cue - The cue point associated with the interaction.
   */
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


  /**
   * Renders a choice interaction based on the provided payload and cue.
   * This method creates buttons for each choice option and appends them to the interaction div.
   * @param payload - The interaction payload containing choice options.
   * @param cue - The cue point associated with the interaction.
   */
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


  /**
   * Renders a text interaction based on the provided payload and cue.
   * This method creates an input field for user text input and a submit button.
   * @param payload - The interaction payload containing the question and other details.
   * @param cue - The cue point associated with the interaction.
   */
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


  /**
   * Renders a default interaction if no specific type is provided.
   * This method creates a simple interaction with a button to respond.
   * @param payload - The interaction payload containing the question and other details.
   * @param cue - The cue point associated with the interaction.
   */
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


  /**
   * Clears the current interactions from the container.
   * This method removes the interaction div and resets it to null.
   */
  private clearInteractions(): void {
    console.log('Clearing interactions.');
    if (this.interactionDiv) {
        this.interactionDiv.remove();
        this.interactionDiv = null;
    }
  }


  /**
   * Handles the user response by invoking the registered response callback.
   * @param response - The user's response to the interaction.
   * @param cue - The cue point associated with the interaction.
   */
  public handleUserResponse(response: any, cue: Cue) {
    if (this.onResponseCallback) {
      console.log('Calling onResponseCallback...');
      this.onResponseCallback(response, cue)
    }
  }


  /**
   * Destroys the InteractionManager instance.
   * This method clears the interaction callbacks and removes any rendered interactions.
   */
  public destroy() {
    this.onPromptCallback = undefined
    this.onResponseCallback = undefined
    this.clearInteractions()
  }
}

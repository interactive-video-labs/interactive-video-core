import { CuePoint as Cue } from './types'
import { InteractionPayload } from './types'

type InteractionHandler = (payload: InteractionPayload, cue: Cue) => void
type ResponseHandler = (response: any, cue: Cue) => void

export class InteractionManager {
  private onPromptCallback?: InteractionHandler
  private onResponseCallback?: ResponseHandler

  constructor() {}

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

    if (payload && this.onPromptCallback) {
      this.onPromptCallback(payload, cue)
    }
  }

  /**
   * Called when user submits a response to the current interaction.
   */
  public handleUserResponse(response: any, cue: Cue) {
    if (this.onResponseCallback) {
      this.onResponseCallback(response, cue)
    }
  }

  public destroy() {
    this.onPromptCallback = undefined
    this.onResponseCallback = undefined
  }
}

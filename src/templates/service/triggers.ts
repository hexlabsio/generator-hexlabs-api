import {
  CognitoUserPoolTriggerEvent,
  PostConfirmationConfirmSignUpTriggerEvent,
  PreTokenGenerationAuthenticationTriggerEvent,
} from 'aws-lambda';

export class Triggers {
  constructor() {}

  async PostConfirmation_ConfirmSignUp(
    event: PostConfirmationConfirmSignUpTriggerEvent,
  ) {
    const username = event.userName;
    const email = event.request.userAttributes['email'].toLowerCase();
    console.log(`Creating user ${event.triggerSource} (${username}, ${email})`);
    return event;
  }

  async TokenGeneration_Authentication(
    event: PreTokenGenerationAuthenticationTriggerEvent,
  ) {
    const email = event.request.userAttributes['email'].toLowerCase();
    const username = event.userName;
    console.log(`Updating Token ${event.triggerSource} (${username}, ${email})`);

    return {
      ...event,
      response: {
        ...event.response,
        claimsOverrideDetails: {
          ...event.response.claimsOverrideDetails,
          claimsToAddOrOverride: {
            [`x-custom-claim`]: JSON.stringify({hello: 'world'})
          }
        },
      },
    };
  }

  async handle(event: CognitoUserPoolTriggerEvent) {
    console.log(`Received event type ${event.triggerSource}`, event);
    switch (event.triggerSource) {
      case 'TokenGeneration_Authentication':
      case 'TokenGeneration_HostedAuth':
      case 'TokenGeneration_RefreshTokens':
        return this.TokenGeneration_Authentication(event as any);
      case 'CustomMessage_AdminCreateUser':
      case 'PostConfirmation_ConfirmSignUp':
      case 'PreSignUp_AdminCreateUser':
        return this.PostConfirmation_ConfirmSignUp(event as any);
      default: {
        console.log(`No triggers found for ${event.triggerSource}`, event);
        return event;
      }
    }
  }
}

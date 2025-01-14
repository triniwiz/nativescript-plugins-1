import { ChatConfiguration, IAdvizeCommon } from './common';
import { Application, Color, ImageSource, Utils } from '@nativescript/core';
import { Observable } from 'rxjs';
import lazy from '@nativescript/core/utils/lazy';

const IAdvizeSDK = lazy<com.iadvize.conversation.sdk.IAdvizeSDK>(() => {
  const clazz = com.iadvize.conversation.sdk.IAdvizeSDK.class;
  const field = clazz.getDeclaredField('INSTANCE');
  field.setAccessible(true);
  return field.get(null);
});

let instance: IAdvize;
let didInit = false;
export class IAdvize extends IAdvizeCommon {
  constructor() {
    super();
    if (instance) {
      return instance;
    }
    if (!instance) {
      instance = this;
    }
  }

  static getInstance() {
    if (!instance) {
      instance = new IAdvize();
    }
    return instance;
  }

  public activate(projectId: number, userId: string, onSuccess: () => void, onFailure: () => void) {
    IAdvize.initate();

    com.iadvize.conversation.sdk.IAdvizeSDK.activate(
      projectId,
      new com.iadvize.conversation.sdk.feature.authentication.AuthenticationOption.Simple(userId),
      com.iadvize.conversation.sdk.feature.gdpr.GDPROption.Disabled.class.getDeclaredField('INSTANCE').get(null),
      new com.iadvize.conversation.sdk.IAdvizeSDK.Callback({
        onSuccess(): void {
          console.log('iAdvize[Android] activated');
          onSuccess();
        },
        onFailure(error): void {
          console.error('iAdvize[Android] activation failed' + error.getLocalizedMessage());
          onFailure();
        },
      })
    );
  }

  public activateTargetingRule(targetingRuleUUID: string) {
    if (!IAdvizeSDK()) {
      return;
    }

    const listeners = IAdvizeSDK().getTargetingController().getListeners();
    listeners.add(
      new com.iadvize.conversation.sdk.feature.targeting.TargetingListener({
        onActiveTargetingRuleAvailabilityUpdated(param0: boolean): void {
          console.log('iAdvize[Android] Targeting rule available - ' + param0);
          IAdvize.activateChatbot();
        },
      })
    );

    IAdvizeSDK()
      .getTargetingController()
      .activateTargetingRule(new com.iadvize.conversation.sdk.feature.targeting.TargetingRule(java.util.UUID.fromString(targetingRuleUUID), com.iadvize.conversation.sdk.feature.conversation.ConversationChannel.CHAT));

    IAdvize.activateChatbot();
  }

  public logout() {
    com.iadvize.conversation.sdk.IAdvizeSDK.logout(
      new com.iadvize.conversation.sdk.IAdvizeSDK.Callback({
        onSuccess(): void {
          console.log('iAdvize[Android] logout success');
        },
        onFailure(error): void {
          console.error('iAdvize[Android] logout failed' + error.getLocalizedMessage());
        },
      })
    );
    IAdvize.deactivateChatbot();
  }

  public customize(configuration: ChatConfiguration) {
    if (!IAdvizeSDK()) {
      return;
    }
    const mainColor = new Color(configuration.mainColor).android;
    const navigationBarBackgroundColor = new Color(configuration.navigationBarBackgroundColor).android;
    const navigationBarMainColor = new Color(configuration.navigationBarMainColor).android;
    const avatar = ImageSource.fromFileOrResourceSync('res://' + configuration.incomingMessageAvatar).android;

    const chatboxConfiguration = new com.iadvize.conversation.sdk.feature.chatbox.ChatboxConfiguration(mainColor);
    chatboxConfiguration.setToolbarBackgroundColor(java.lang.Integer.valueOf(navigationBarBackgroundColor));
    chatboxConfiguration.setToolbarMainColor(java.lang.Integer.valueOf(navigationBarMainColor));
    chatboxConfiguration.setIncomingMessageAvatar(new com.iadvize.conversation.sdk.feature.conversation.IncomingMessageAvatar.Image(new android.graphics.drawable.BitmapDrawable(Utils.android.getApplicationContext().getResources(), avatar)));
    chatboxConfiguration.setAutomaticMessage(configuration.automaticMessage);
    chatboxConfiguration.setToolbarTitle(configuration.navigationBarTitle);
    chatboxConfiguration.setFontPath(configuration.font);

    IAdvizeSDK().getChatboxController().setupChatbox(chatboxConfiguration);
  }

  public registerConversationListener(openURLCallback: (url: string) => boolean, ongoingConversationStatusDidChange: (hasOngoingConversation: boolean) => void, newMessageReceived: (content: string) => void) {
    if (!IAdvizeSDK()) {
      return;
    }
    const listeners = IAdvizeSDK().getConversationController().getListeners();
    listeners.add(
      new com.iadvize.conversation.sdk.feature.conversation.ConversationListener({
        onOngoingConversationUpdated(param0: com.iadvize.conversation.sdk.feature.conversation.OngoingConversation): void {
          ongoingConversationStatusDidChange(!!param0);
        },
        onNewMessageReceived(_param0: string): void {
          newMessageReceived(_param0);
        },
        handleClickedUrl(param0: globalAndroid.net.Uri): boolean {
          return !openURLCallback(param0.toString());
        },
      })
    );
  }

  public hideDefaultChatButton() {
    if (!IAdvizeSDK()) {
      return;
    }
    IAdvizeSDK().getDefaultFloatingButtonController().setupDefaultFloatingButton(com.iadvize.conversation.sdk.feature.defaultfloatingbutton.DefaultFloatingButtonOption.Disabled.INSTANCE);
  }

  public presentChat() {
    if (!IAdvizeSDK()) {
      return;
    }
    IAdvizeSDK()
      .getChatboxController()
      .presentChatbox(Application.android.foregroundActivity || Application.android.startActivity);
  }

  public dismissChat() {
    const isChatActivity = Application.android.foregroundActivity instanceof com.iadvize.conversation.sdk.feature.chatbox.ChatboxActivity;
    if (isChatActivity) {
      Application.android.foregroundActivity.finish();
    }
  }

  public registerPushToken(token: string, _isProd: boolean) {
    if (!IAdvizeSDK()) {
      return;
    }
    IAdvizeSDK().getNotificationController().registerPushToken(token);
  }

  public isChatPresented() {
    if (!IAdvizeSDK()) {
      return false;
    }
    return IAdvizeSDK().getChatboxController().isChatboxPresented();
  }

  public chatbotActivatedState(): Observable<boolean> {
    return IAdvize.getChatbotActivated().asObservable();
  }

  public setLogLevel(logLevel: number) {
    com.iadvize.conversation.sdk.IAdvizeSDK.setLogLevel(this.logLevelFrom(logLevel));
  }

  private logLevelFrom(logLevel: number): com.iadvize.conversation.sdk.feature.logger.Logger.Level {
    switch (logLevel) {
      case 0:
        return com.iadvize.conversation.sdk.feature.logger.Logger.Level.VERBOSE;
      case 1:
        return com.iadvize.conversation.sdk.feature.logger.Logger.Level.INFO;
      case 3:
        return com.iadvize.conversation.sdk.feature.logger.Logger.Level.ERROR;
      case 2:
      default:
        return com.iadvize.conversation.sdk.feature.logger.Logger.Level.WARNING;
    }
  }

  private static initate() {
    if (didInit) {
      return;
    }
    com.iadvize.conversation.sdk.IAdvizeSDK.initiate(Utils.android.getApplicationContext());
    didInit = true;
  }
}

import PasswordChallengeStrategy from "./PasswordChallengeStrategy";
import SmsChallengeStrategy from "./SmsChallengeStrategy";
//import EmailChallengeStrategy from "./EmailChallengeStrategy";
import AuthorizedDeviceChallengeStrategy from "./AuthorizedDeviceChallengeStrategy";
import AuthorizedIpAddressChallengeStrategy from "./AuthorizedIpAddressChallengeStrategy";
import AccessTokenChallengeStrategy from "./AccessTokenChallengeStrategy";
import ThirdPartyAuthenticatorChallengeStrategy from "./ThirdPartyAuthenticatorChallengeStrategy";


export class LoginChallengeStrategyFactory {
  get(type) {
    switch(type) {
      case "password":
        return new PasswordChallengeStrategy();
      case "sms":
        return new SmsChallengeStrategy();
        //case "email":
        //  return new EmailChallengeStrategy();
      case "device":
        return new AuthorizedDeviceChallengeStrategy();
      case "ipAddress":
        return new AuthorizedIpAddressChallengeStrategy();
      case "accessToken":
        return new AccessTokenChallengeStrategy();
      case "tpa":
        return new ThirdPartyAuthenticatorChallengeStrategy();
      default:
        throw new Error("Invalid login challenge strategy type: " + type)
    }


  }
}



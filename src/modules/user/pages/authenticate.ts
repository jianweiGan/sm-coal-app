import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';

import { AppService } from '../../common/services/app.service';
import { UserService} from '../services/user.service';


@Component({
  selector: 'page-authenticate',
  templateUrl: 'authenticate.html'
})
export class AuthenticatePage {

  signUpModel: {phone?: number, verificationCode?: number} = {};

  getVerificationCodeBtnText: string;
  getVerificationCodeBtnDisabled: boolean = false;

  constructor(
    public heyApp: AppService,
    public userService: UserService,
    public viewCtrl: ViewController,
  ) {

  }

  // cancel modal
  cancelModal() {
    this.viewCtrl.dismiss();
  }


  //
  // sign up handler
  signUpHandler(ngForm) {
    let data: Object = {
      phone: this.signUpModel.phone,
      code: this.signUpModel.verificationCode
    };

    if (ngForm.valid) {
      this.heyApp.utilityComp.presentLoading();

      this.userService.signUp(data)
      .then(ret => {
        this.heyApp.authService.logIn(ret);
        this.viewCtrl.dismiss().then(() => {
          this.heyApp.utilityComp.dismissLoading();
          this.heyApp.utilityComp.presentToast('验证成功, 欢迎你： ' + ret.nickname);
        });
      }, (data) => {
        this.heyApp.utilityComp.dismissLoading().then(() => {
          let body = JSON.parse(data._body);
          this.heyApp.utilityComp.presentAlter({title: '验证失败', subTitle: body[Object.keys(body)[0]]});
        });
      });
    }
  }


  // get verification code
  getVerificationCode() {
    this.userService.getVerificationCode({phone: this.signUpModel.phone}).then((res) => {
      this.getVerificationCodeBtnText = '60s';
      this.getVerificationCodeBtnDisabled = true;

      let verificationCodeInterval = setInterval(() => {
        let t = this.getVerificationCodeBtnText.substr(0, this.getVerificationCodeBtnText.indexOf('s'));

        if (parseInt(t) > 1) {
          this.getVerificationCodeBtnText = parseInt(t) - 1 + 's';
        } else {
          clearInterval(verificationCodeInterval);
          this.getVerificationCodeBtnDisabled = false;
        }
      }, 1000);
    }, (res) => {
      this.heyApp.utilityComp.presentAlter({title: 'Alert', subTitle: res._body});
    });
  }


  //
  // open terms page
  openTermsPage() {
    let url = (<any> window).API_DOMAIN + '/docs/terms.html';
    if (this.heyApp.platform.is('cordova')) {
      // let browser = new InAppBrowser(url, '_system');
      // browser.show();
    } else {
      (<any> window).open(url, '_blank');
    }
  }
}
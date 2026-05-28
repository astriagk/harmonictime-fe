import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { RegisterComponent } from './register/register.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { GstOnboardingComponent } from './gst-onboarding/gst-onboarding.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { CheckEmailComponent } from './check-email/check-email.component';
import { AccountBlockedComponent } from './account-blocked/account-blocked.component';

@NgModule({
  declarations: [
    RegisterComponent,
    LoginComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    GstOnboardingComponent,
    VerifyEmailComponent,
    CheckEmailComponent,
    AccountBlockedComponent,
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class AuthModule {}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { AuthLayoutComponent } from 'src/app/shared/layout/auth-layout/auth-layout.component';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

const routes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'register',
        component: RegisterComponent,
        title: 'Register Page',
      },
      {
        path: 'login',
        component: LoginComponent,
        title: 'Login Page',
      },
      {
        path: 'forgot-password',
        component: ForgotPasswordComponent,
        title: 'Forgot Password Page',
      },
      {
        path: 'reset-password',
        component: ResetPasswordComponent,
        title: 'Reset Password Page',
      },
    ],
  },
  { path: '**', redirectTo: 'register' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}

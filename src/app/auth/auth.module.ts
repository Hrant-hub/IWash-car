import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginPage } from './login/login.page';
import { RegisterPage } from './register/register.page';

@NgModule({
  imports: [SharedModule, FormsModule, ReactiveFormsModule, AuthRoutingModule],
  declarations: [LoginPage, RegisterPage],
})
export class AuthModule {}

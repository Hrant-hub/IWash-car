import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { onboardingGuard } from './core/guards/onboarding.guard';
import { onboardingEntryGuard } from './core/guards/onboarding-entry.guard';
import { customerProfileGuard } from './core/guards/customer-profile.guard';

const routes: Routes = [
  {
    path: 'onboarding',
    loadChildren: () => import('./onboarding/onboarding.module').then(m => m.OnboardingModule),
    canActivate: [onboardingEntryGuard],
  },
  {
    path: 'login',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  {
    path: 'register',
    redirectTo: 'auth/register',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule),
    canActivate: [onboardingGuard],
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule),
  },
  {
    path: 'terms',
    loadChildren: () => import('./terms/terms.module').then(m => m.TermsModule),
  },
  {
    path: 'role-selection',
    loadChildren: () => import('./role-selection/role-selection.module').then(m => m.RoleSelectionModule),
    canActivate: [onboardingGuard, authGuard],
  },
  {
    path: 'complete-profile',
    loadChildren: () => import('./complete-profile/complete-profile.module').then(m => m.CompleteProfileModule),
    canActivate: [onboardingGuard, authGuard, roleGuard],
    data: { roles: ['customer'] },
  },
  {
    path: 'customer',
    loadChildren: () => import('./customer/customer.module').then(m => m.CustomerPageModule),
    canActivate: [onboardingGuard, authGuard, roleGuard, customerProfileGuard],
    data: { roles: ['customer'] },
  },
  {
    path: 'search-helper',
    loadChildren: () => import('./search-helper/search-helper.module').then(m => m.SearchHelperModule),
    canActivate: [onboardingGuard, authGuard, roleGuard, customerProfileGuard],
    data: { roles: ['customer'] },
  },
  {
    path: 'helper',
    loadChildren: () => import('./helper/helper.module').then(m => m.HelperPageModule),
    canActivate: [onboardingGuard, authGuard, roleGuard],
    data: { roles: ['helper'] },
  },
  {
    path: 'order-history',
    loadChildren: () => import('./order-history/order-history.module').then(m => m.OrderHistoryModule),
    canActivate: [onboardingGuard, authGuard],
  },
  {
    path: 'customer-settings',
    loadChildren: () => import('./customer-settings/customer-settings.module').then(m => m.CustomerSettingsModule),
    canActivate: [onboardingGuard, authGuard, roleGuard],
    data: { roles: ['customer'] },
  },
  {
    path: 'helper-settings',
    loadChildren: () => import('./helper-settings/helper-settings.module').then(m => m.HelperSettingsModule),
    canActivate: [onboardingGuard, authGuard, roleGuard],
    data: { roles: ['helper'] },
  },
  {
    path: '',
    redirectTo: 'onboarding',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}

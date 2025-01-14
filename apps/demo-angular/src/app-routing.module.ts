import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { NativeScriptRouterModule } from '@nativescript/angular';

import { HomeComponent } from './home.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'nativescript-appdynamics', loadChildren: () => import('./plugin-demos/nativescript-appdynamics.module').then((m) => m.NativescriptAppdynamicsModule) },
  { path: 'nativescript-iadvize', loadChildren: () => import('./plugin-demos/nativescript-iadvize.module').then((m) => m.NativescriptIadvizeModule) },
  { path: 'nativescript-medallia', loadChildren: () => import('./plugin-demos/nativescript-medallia.module').then((m) => m.NativescriptMedalliaModule) },
  { path: 'nativescript-urban-airship', loadChildren: () => import('./plugin-demos/nativescript-urban-airship.module').then((m) => m.NativescriptUrbanAirshipModule) },
];

@NgModule({
  imports: [NativeScriptRouterModule.forRoot(routes)],
  exports: [NativeScriptRouterModule],
})
export class AppRoutingModule {}

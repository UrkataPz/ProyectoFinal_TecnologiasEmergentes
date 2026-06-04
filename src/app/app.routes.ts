import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { InicioComponent } from './components/inicio/inicio.component';
import { LoginComponent } from './components/login/login.component';
import { RegistroComponent } from './components/registro/registro.component';
import { ClubesComponent } from './components/clubes/clubes.component';
import { DetalleClubComponent } from './components/detalle-club/detalle-club.component';
import { ClubFeedComponent } from './components/club-feed/club-feed.component';
import { PanelUsuarioComponent } from './components/panel-usuario/panel-usuario.component';

export const routes: Routes = [
  {
    path: '',
    title: 'Inicio | Clubes CEUTEC',
    component: InicioComponent
  },
  {
    path: 'login',
    title: 'Login | Clubes CEUTEC',
    component: LoginComponent
  },
  {
    path: 'registro',
    title: 'Registro | Clubes CEUTEC',
    component: RegistroComponent
  },
  {
    path: 'clubes',
    title: 'Clubes | Clubes CEUTEC',
    component: ClubesComponent,
    canActivate: [authGuard]
  },
  {
    path: 'clubes/:id',
    title: 'Detalle de Club | Clubes CEUTEC',
    component: DetalleClubComponent,
    canActivate: [authGuard]
  },
  {
    path: 'clubes/:id/feed',
    title: 'Feed del Club | Clubes CEUTEC',
    component: ClubFeedComponent,
    canActivate: [authGuard]
  },
  {
    path: 'panel-usuario',
    title: 'Panel | Clubes CEUTEC',
    component: PanelUsuarioComponent,
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '' }
];

import { Routes } from '@angular/router';
import { InicioComponent } from './components/inicio/inicio.component';
import { LoginComponent } from './components/login/login.component';
import { RegistroComponent } from './components/registro/registro.component';
import { ClubesComponent } from './components/clubes/clubes.component';
import { DetalleClubComponent } from './components/detalle-club/detalle-club.component';
import { PanelUsuarioComponent } from './components/panel-usuario/panel-usuario.component';

export const routes: Routes = [
  { path: '', title: 'Inicio | Clubes Estudiantiles', component: InicioComponent },
  { path: 'login', title: 'Login | Clubes Estudiantiles', component: LoginComponent },
  { path: 'registro', title: 'Registro | Clubes Estudiantiles', component: RegistroComponent },
  { path: 'clubes', title: 'Clubes | Clubes Estudiantiles', component: ClubesComponent },
  { path: 'clubes/:id', title: 'Detalle de Club | Clubes Estudiantiles', component: DetalleClubComponent },
  { path: 'panel-usuario', title: 'Panel de Usuario | Clubes Estudiantiles', component: PanelUsuarioComponent },
  { path: '**', redirectTo: '' }
];

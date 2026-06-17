import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass } from '@angular/common';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, of, map } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { NotificacionesService } from '../../services/notificaciones.service';
import { UserService } from '../panel-usuario/user.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  readonly authService = inject(AuthService);
  private notifService = inject(NotificacionesService);
  private userService  = inject(UserService);

  readonly isLoggedIn  = this.authService.isLoggedIn;
  readonly displayName = this.authService.displayName;

  readonly fotoUrl = toSignal(
    toObservable(this.authService.uid).pipe(
      switchMap(uid => uid ? this.userService.getProfile(uid) : of(undefined)),
      map(p => p?.fotoUrl ?? null)
    ),
    { initialValue: null }
  );

  menuAbierto   = signal(false);
  notifAbiertas = signal(false);

  readonly notificaciones = toSignal(
    toObservable(this.authService.uid).pipe(
      switchMap(uid => uid ? this.notifService.getByUsuario(uid) : of([]))
    ),
    { initialValue: [] }
  );

  readonly noLeidas = computed(() =>
    this.notificaciones().filter(n => !n.leida).length
  );

  toggleMenu(): void  { this.menuAbierto.update(v => !v); }
  cerrarMenu(): void  { this.menuAbierto.set(false); }

  toggleNotif(): void {
    this.notifAbiertas.update(v => !v);
    this.menuAbierto.set(false);
  }
  cerrarNotif(): void { this.notifAbiertas.set(false); }

  async marcarLeida(id: string): Promise<void> {
    await this.notifService.marcarLeida(id);
  }

  async marcarTodas(): Promise<void> {
    const ids = this.notificaciones().filter(n => !n.leida).map(n => n.id!);
    if (ids.length) await this.notifService.marcarTodasLeidas('', ids);
  }

  async eliminarNotif(id: string, event: Event): Promise<void> {
    event.stopPropagation();
    await this.notifService.delete(id);
  }

  iconoPorTipo(tipo: string): string {
    const mapa: Record<string, string> = {
      solicitud_aprobada:  '✅',
      solicitud_rechazada: '❌',
      evento_nuevo:        '📅'
    };
    return mapa[tipo] ?? '🔔';
  }
}

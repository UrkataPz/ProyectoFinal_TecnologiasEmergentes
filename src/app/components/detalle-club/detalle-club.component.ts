import { Component, inject, input, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, of, combineLatest, map } from 'rxjs';
import { ClubesService } from '../../services/clubes.service';
import { SolicitudesService } from '../../services/solicitudes.service';
import { EventosService } from '../../services/eventos.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../panel-usuario/user.service';
import { Solicitud } from '../../models/solicitud.model';

@Component({
  selector: 'app-detalle-club',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './detalle-club.component.html',
  styleUrl: './detalle-club.component.css'
})
export class DetalleClubComponent {
  id = input<string>('');

  private clubesService      = inject(ClubesService);
  private solicitudesService = inject(SolicitudesService);
  private eventosService     = inject(EventosService);
  private authService        = inject(AuthService);
  private userService        = inject(UserService);
  private router             = inject(Router);

  readonly club = toSignal(
    toObservable(this.id).pipe(
      switchMap(id => id ? this.clubesService.getById(id) : of(undefined))
    ),
    { initialValue: undefined }
  );

  readonly eventos = toSignal(
    toObservable(this.id).pipe(
      switchMap(id => id ? this.eventosService.getByClub(id) : of([]))
    ),
    { initialValue: [] }
  );

  readonly perfil = toSignal(
    toObservable(this.authService.uid).pipe(
      switchMap(uid => uid ? this.userService.getProfile(uid) : of(undefined))
    )
  );

  readonly miSolicitud = toSignal(
    combineLatest([
      toObservable(this.id),
      toObservable(this.authService.uid)
    ]).pipe(
      switchMap(([clubId, uid]) =>
        uid && clubId
          ? this.solicitudesService.getByUsuario(uid).pipe(
              map(sols => sols.find(s => s.clubId === clubId) ?? null)
            )
          : of(null)
      )
    )
  );

  readonly esPrivilegiado = computed(() => {
    const rol = this.perfil()?.rol;
    return rol === 'Admin' || rol === 'Moderador';
  });

  readonly accesoPermitido = computed(() => {
    if (!this.authService.isLoggedIn()) return true;
    if (this.esPrivilegiado()) return true;
    const sol = this.miSolicitud();
    if (sol === undefined) return true;
    if (sol === null) return true;
    return sol.estado === 'aprobada';
  });

  readonly mensajeAccion = signal('');
  readonly enviando      = signal(false);

  readonly isLoggedIn = this.authService.isLoggedIn;

  formatearFecha(fecha: string, hora: string): string {
    try {
      const d = new Date(`${fecha}T${hora}`);
      return d.toLocaleDateString('es-HN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      }) + ' — ' + hora;
    } catch {
      return `${fecha} ${hora}`;
    }
  }

  async solicitar(): Promise<void> {
    const user = this.authService.currentUser();
    if (!user) { this.router.navigate(['/login']); return; }

    const club = this.club();
    if (!club) return;

    if (this.miSolicitud() != null) return;

    this.enviando.set(true);
    try {
      await this.solicitudesService.create({
        usuarioId:     user.uid,
        usuarioNombre: this.perfil()?.nombre || user.displayName || user.email || '',
        usuarioEmail:  user.email ?? '',
        clubId:        club.id!,
        clubNombre:    club.nombre,
        estado:        'pendiente'
      });
      this.mensajeAccion.set('✅ Solicitud enviada correctamente');
    } catch {
      this.mensajeAccion.set('❌ Error al enviar la solicitud');
    } finally {
      this.enviando.set(false);
      setTimeout(() => this.mensajeAccion.set(''), 4000);
    }
  }
}

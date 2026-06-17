import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, of } from 'rxjs';
import { ClubesService } from '../../services/clubes.service';
import { SolicitudesService } from '../../services/solicitudes.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../panel-usuario/user.service';
import { ClubCardComponent } from '../club-card/club-card.component';
import { Club } from '../../models/club.model';

@Component({
  selector: 'app-clubes',
  standalone: true,
  imports: [ClubCardComponent],
  templateUrl: './clubes.component.html',
  styleUrl: './clubes.component.css'
})
export class ClubesComponent {
  private clubesService = inject(ClubesService);
  private solicitudesService = inject(SolicitudesService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);

  readonly clubes = toSignal(this.clubesService.getAll(), { initialValue: [] });
  readonly filtro = signal('');
  readonly mensajeAccion = signal('');

  readonly perfil = toSignal(
    toObservable(this.authService.uid).pipe(
      switchMap(uid => uid ? this.userService.getProfile(uid) : of(undefined))
    )
  );

  readonly misSolicitudes = toSignal(
    toObservable(this.authService.uid).pipe(
      switchMap(uid => uid ? this.solicitudesService.getByUsuario(uid) : of([]))
    ),
    { initialValue: [] }
  );

  readonly solicitudesMapa = computed(() => {
    const mapa: Record<string, string | undefined> = {};
    for (const s of this.misSolicitudes()) {
      mapa[s.clubId] = s.estado;
    }
    return mapa;
  });

  readonly clubesFiltrados = computed(() => {
    const termino = this.filtro().toLowerCase().trim();
    if (!termino) return this.clubes();
    return this.clubes().filter(c =>
      c.nombre.toLowerCase().includes(termino) ||
      c.categoria.toLowerCase().includes(termino)
    );
  });

  readonly totalActivos = computed(() =>
    this.clubes().filter(c => c.activo).length
  );

  irADetalle(id: string): void {
    this.router.navigate(['/clubes', id]);
  }

  async solicitar(club: Club): Promise<void> {
    const user = this.authService.currentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.solicitudesMapa()[club.id!]) return;

    try {
      await this.solicitudesService.create({
        usuarioId: user.uid,
        usuarioNombre: this.perfil()?.nombre || user.displayName || user.email || '',
        usuarioEmail: user.email ?? '',
        clubId: club.id!,
        clubNombre: club.nombre,
        estado: 'pendiente'
      });
      this.mensajeAccion.set(`✅ Solicitud enviada a "${club.nombre}"`);
      setTimeout(() => this.mensajeAccion.set(''), 4000);
    } catch {
      this.mensajeAccion.set('❌ Error al enviar la solicitud');
      setTimeout(() => this.mensajeAccion.set(''), 4000);
    }
  }
}

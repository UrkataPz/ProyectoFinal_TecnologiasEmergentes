import { Component, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, of } from 'rxjs';
import { ClubesService } from '../../services/clubes.service';
import { SolicitudesService } from '../../services/solicitudes.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-detalle-club',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './detalle-club.component.html',
  styleUrl: './detalle-club.component.css'
})
export class DetalleClubComponent {
  // withComponentInputBinding() mapea el param :id de la ruta a este input()
  id = input<string>('');

  private clubesService = inject(ClubesService);
  private solicitudesService = inject(SolicitudesService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Reactivo: cada vez que cambia id(), hace nueva consulta a Firestore
  readonly club = toSignal(
    toObservable(this.id).pipe(
      switchMap(id => id ? this.clubesService.getById(id) : of(undefined))
    ),
    { initialValue: undefined }
  );

  readonly mensajeAccion = signal('');
  readonly enviando = signal(false);

  async solicitar(): Promise<void> {
    const user = this.authService.currentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    const club = this.club();
    if (!club) return;

    this.enviando.set(true);
    try {
      await this.solicitudesService.create({
        usuarioId: user.uid,
        usuarioNombre: user.displayName ?? user.email ?? '',
        usuarioEmail: user.email ?? '',
        clubId: club.id!,
        clubNombre: club.nombre,
        estado: 'pendiente'
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

import { Component, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, of } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ClubesService } from '../../services/clubes.service';
import { SolicitudesService } from '../../services/solicitudes.service';
import { Club } from '../../models/club.model';
import { EstadoSolicitud } from '../../models/solicitud.model';

@Component({
  selector: 'app-panel-usuario',
  standalone: true,
  imports: [RouterLink, FormsModule, NgClass],
  templateUrl: './panel-usuario.component.html',
  styleUrl: './panel-usuario.component.css'
})
export class PanelUsuarioComponent {
  readonly authService = inject(AuthService);
  private clubesService = inject(ClubesService);
  private solicitudesService = inject(SolicitudesService);
  private router = inject(Router);

  // ── Datos del usuario ──────────────────────────────────────────────────────
  readonly nombre = computed(() => this.authService.displayName() || this.authService.email());
  readonly esAdmin = computed(() => {
    // Se considera admin si el displayName contiene "Admin" o por rol guardado
    // La verificación real se haría con datos de Firestore; aquí usamos heurística
    return false;
  });

  // ── Solicitudes del usuario logueado ──────────────────────────────────────
  readonly misSolicitudes = toSignal(
    toObservable(this.authService.uid).pipe(
      switchMap(uid => uid ? this.solicitudesService.getByUsuario(uid) : of([]))
    ),
    { initialValue: [] }
  );

  // ── Todos los clubes (para admin y para stats) ────────────────────────────
  readonly todosClubes = toSignal(this.clubesService.getAll(), { initialValue: [] });

  // ── Todas las solicitudes (admin) ─────────────────────────────────────────
  readonly todasSolicitudes = toSignal(
    this.solicitudesService.getAll(),
    { initialValue: [] }
  );

  // ── Stats ─────────────────────────────────────────────────────────────────
  readonly totalClubes = computed(() => this.todosClubes().length);
  readonly solicitudesPendientes = computed(() =>
    this.misSolicitudes().filter(s => s.estado === 'pendiente').length
  );
  readonly solicitudesAprobadas = computed(() =>
    this.misSolicitudes().filter(s => s.estado === 'aprobada').length
  );

  // ── Tabs del panel ────────────────────────────────────────────────────────
  readonly tabActiva = signal<'solicitudes' | 'clubes' | 'admin-clubes' | 'admin-solicitudes'>('solicitudes');

  // ── Formulario de club ────────────────────────────────────────────────────
  readonly mostrarFormClub = signal(false);
  readonly editandoId = signal<string | null>(null);
  readonly formClub = signal<Partial<Club>>({
    nombre: '', categoria: '', descripcion: '', objetivo: '', requisitos: '', miembros: 0, activo: true
  });
  readonly mensajePanel = signal('');
  readonly cargando = signal(false);

  readonly categorias = ['Tecnología', 'Negocios', 'Social', 'Cultura', 'Deportes', 'Arte', 'Académico'];

  // ── Acciones de club ──────────────────────────────────────────────────────
  abrirFormNuevo(): void {
    this.editandoId.set(null);
    this.formClub.set({ nombre: '', categoria: '', descripcion: '', objetivo: '', requisitos: '', miembros: 0, activo: true });
    this.mostrarFormClub.set(true);
  }

  editarClub(club: Club): void {
    this.editandoId.set(club.id!);
    this.formClub.set({ ...club });
    this.mostrarFormClub.set(true);
  }

  cancelarForm(): void {
    this.mostrarFormClub.set(false);
    this.editandoId.set(null);
  }

  actualizarCampo<K extends keyof Club>(campo: K, valor: Club[K]): void {
    this.formClub.update(f => ({ ...f, [campo]: valor }));
  }

  async guardarClub(): Promise<void> {
    const f = this.formClub();
    if (!f.nombre || !f.categoria || !f.descripcion || !f.objetivo || !f.requisitos) {
      this.mensajePanel.set('❌ Completa todos los campos del club');
      return;
    }

    this.cargando.set(true);
    try {
      const datos: Omit<Club, 'id'> = {
        nombre: f.nombre!,
        categoria: f.categoria!,
        descripcion: f.descripcion!,
        objetivo: f.objetivo!,
        requisitos: f.requisitos!,
        miembros: f.miembros ?? 0,
        activo: f.activo ?? true
      };

      if (this.editandoId()) {
        await this.clubesService.update(this.editandoId()!, datos);
        this.mensajePanel.set('✅ Club actualizado');
      } else {
        await this.clubesService.create(datos);
        this.mensajePanel.set('✅ Club creado');
      }
      this.mostrarFormClub.set(false);
      this.editandoId.set(null);
    } catch {
      this.mensajePanel.set('❌ Error al guardar el club');
    } finally {
      this.cargando.set(false);
      setTimeout(() => this.mensajePanel.set(''), 4000);
    }
  }

  async eliminarClub(id: string, nombre: string): Promise<void> {
    if (!confirm(`¿Eliminar el club "${nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await this.clubesService.delete(id);
      this.mensajePanel.set('✅ Club eliminado');
    } catch {
      this.mensajePanel.set('❌ Error al eliminar el club');
    } finally {
      setTimeout(() => this.mensajePanel.set(''), 4000);
    }
  }

  // ── Acciones de solicitud ─────────────────────────────────────────────────
  async cambiarEstado(id: string, estado: EstadoSolicitud): Promise<void> {
    try {
      await this.solicitudesService.update(id, { estado });
      this.mensajePanel.set(`✅ Solicitud ${estado}`);
    } catch {
      this.mensajePanel.set('❌ Error al actualizar la solicitud');
    } finally {
      setTimeout(() => this.mensajePanel.set(''), 4000);
    }
  }

  async cancelarSolicitud(id: string): Promise<void> {
    if (!confirm('¿Cancelar esta solicitud?')) return;
    try {
      await this.solicitudesService.delete(id);
      this.mensajePanel.set('✅ Solicitud cancelada');
    } catch {
      this.mensajePanel.set('❌ Error al cancelar');
    } finally {
      setTimeout(() => this.mensajePanel.set(''), 4000);
    }
  }

  async cerrarSesion(): Promise<void> {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }

  estadoBadge(estado: string): string {
    const mapa: Record<string, string> = {
      pendiente: 'badge-pending',
      aprobada: 'badge-success',
      rechazada: 'badge-danger'
    };
    return mapa[estado] ?? '';
  }
}

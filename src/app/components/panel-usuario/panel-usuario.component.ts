import { Component, inject, signal, computed, effect } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, of } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ClubesService } from '../../services/clubes.service';
import { SolicitudesService } from '../../services/solicitudes.service';
import { EventosService } from '../../services/eventos.service';
import { NotificacionesService } from '../../services/notificaciones.service';
import { UserService } from './user.service';
import { Club } from '../../models/club.model';
import { Evento } from '../../models/evento.model';
import { EstadoSolicitud } from '../../models/solicitud.model';

type PanelTab = 'solicitudes' | 'clubes' | 'admin-clubes' | 'admin-solicitudes' | 'admin-eventos';

@Component({
  selector: 'app-panel-usuario',
  standalone: true,
  imports: [RouterLink, FormsModule, NgClass],
  templateUrl: './panel-usuario.component.html',
  styleUrl: './panel-usuario.component.css'
})
export class PanelUsuarioComponent {
  readonly authService = inject(AuthService);
  private clubesService        = inject(ClubesService);
  private solicitudesService   = inject(SolicitudesService);
  private eventosService       = inject(EventosService);
  private notificacionesService = inject(NotificacionesService);
  private userService          = inject(UserService);
  private router               = inject(Router);

  readonly perfil = toSignal(
    toObservable(this.authService.uid).pipe(
      switchMap(uid => uid ? this.userService.getProfile(uid) : of(undefined))
    )
  );

  readonly nombre = computed(() => this.perfil()?.nombre || this.authService.displayName() || this.authService.email());
  readonly inicialUsuario = computed(() => (this.nombre()?.trim().charAt(0) || 'U').toUpperCase());
  readonly esAdmin = computed(() =>
    this.perfil()?.rol === 'Admin' || this.perfil()?.rol === 'Moderador'
  );

  readonly formPerfil = signal({ nombre: '', correo: '', carrera: '' });

  constructor() {
    effect(() => {
      const p = this.perfil();
      this.formPerfil.set({
        nombre: p?.nombre || this.authService.displayName() || '',
        correo: p?.correo || this.authService.email() || '',
        carrera: p?.carrera || ''
      });
    });
  }

  readonly misSolicitudes = toSignal(
    toObservable(this.authService.uid).pipe(
      switchMap(uid => uid ? this.solicitudesService.getByUsuario(uid) : of([]))
    ),
    { initialValue: [] }
  );

  readonly todosClubes = toSignal(this.clubesService.getAll(), { initialValue: [] });

  readonly todasSolicitudes = toSignal(
    this.solicitudesService.getAll(),
    { initialValue: [] }
  );

  readonly miembrosPorClub = computed(() => {
    const map: Record<string, number | undefined> = {};
    this.todasSolicitudes()
      .filter(s => s.estado === 'aprobada')
      .forEach(s => { map[s.clubId] = (map[s.clubId] ?? 0) + 1; });
    return map;
  });

  readonly totalClubes = computed(() => this.todosClubes().length);
  readonly solicitudesPendientes = computed(() =>
    this.misSolicitudes().filter(s => s.estado === 'pendiente').length
  );
  readonly solicitudesAprobadas = computed(() =>
    this.misSolicitudes().filter(s => s.estado === 'aprobada').length
  );

  readonly tabsPanel: { id: PanelTab; label: string; adminOnly: boolean }[] = [
    { id: 'solicitudes',       label: 'Mis solicitudes',       adminOnly: false },
    { id: 'clubes',            label: 'Directorio',            adminOnly: false },
    { id: 'admin-clubes',      label: 'Gestión de clubes',     adminOnly: true  },
    { id: 'admin-eventos',     label: 'Gestión de eventos',    adminOnly: true  },
    { id: 'admin-solicitudes', label: 'Todas las solicitudes', adminOnly: true  }
  ];

  readonly todosEventos = toSignal(this.eventosService.getAll(), { initialValue: [] });

  readonly mostrarFormEvento = signal(false);
  readonly editandoEventoId  = signal<string | null>(null);
  readonly formEvento = signal<Partial<Evento>>({
    clubId: '', clubNombre: '', titulo: '', descripcion: '',
    fecha: '', hora: '08:00', lugar: '', activo: true
  });

  clubSeleccionado = computed(() => {
    const id = this.formEvento().clubId;
    return this.todosClubes().find(c => c.id === id);
  });

  tabActiva: PanelTab = 'solicitudes';

  cambiarTab(tab: PanelTab, event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    this.tabActiva = tab;
  }

  esTabActiva(tab: PanelTab): boolean {
    return this.tabActiva === tab;
  }

  readonly mostrarFormClub = signal(false);
  readonly editandoId = signal<string | null>(null);
  readonly formClub = signal<Partial<Club>>({
    nombre: '', categoria: '', descripcion: '', objetivo: '', requisitos: '', activo: true
  });
  readonly mensajePanel = signal('');
  readonly cargando = signal(false);

  readonly categorias = ['Tecnología', 'Negocios', 'Social', 'Cultura', 'Deportes', 'Arte', 'Académico'];

  abrirFormNuevo(): void {
    this.editandoId.set(null);
    this.formClub.set({ nombre: '', categoria: '', descripcion: '', objetivo: '', requisitos: '', activo: true });
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
        miembros: this.miembrosPorClub()[this.editandoId() ?? ''] ?? 0,
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

  actualizarCampoPerfil(campo: string, valor: string): void {
    this.formPerfil.update(p => ({ ...p, [campo]: valor }));
  }

  async guardarPerfil(): Promise<void> {
    const uid = this.authService.uid();
    if (!uid) return;

    this.cargando.set(true);
    try {
      await this.userService.updateProfile(uid, this.formPerfil());
      this.mensajePanel.set('✅ Perfil actualizado correctamente');
    } catch {
      this.mensajePanel.set('❌ Error al actualizar el perfil');
    } finally {
      this.cargando.set(false);
      setTimeout(() => this.mensajePanel.set(''), 4000);
    }
  }

  async inicializarDatos(): Promise<void> {
    this.cargando.set(true);
    try {
      const { insertados } = await this.clubesService.seedSiVacio();
      this.mensajePanel.set(
        insertados > 0
          ? `✅ ${insertados} clubes cargados correctamente`
          : '✅ La base de datos ya tiene clubes registrados'
      );
    } catch {
      this.mensajePanel.set('❌ Error al cargar los datos iniciales');
    } finally {
      this.cargando.set(false);
      setTimeout(() => this.mensajePanel.set(''), 5000);
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

  abrirFormEvento(): void {
    this.editandoEventoId.set(null);
    this.formEvento.set({
      clubId: '', clubNombre: '', titulo: '', descripcion: '',
      fecha: '', hora: '08:00', lugar: '', activo: true
    });
    this.mostrarFormEvento.set(true);
  }

  editarEvento(ev: Evento): void {
    this.editandoEventoId.set(ev.id!);
    this.formEvento.set({ ...ev });
    this.mostrarFormEvento.set(true);
  }

  cancelarFormEvento(): void {
    this.mostrarFormEvento.set(false);
    this.editandoEventoId.set(null);
  }

  actualizarCampoEvento<K extends keyof Evento>(campo: K, valor: Evento[K]): void {
    this.formEvento.update(f => {
      const updated = { ...f, [campo]: valor };
      if (campo === 'clubId') {
        const club = this.todosClubes().find(c => c.id === (valor as string));
        updated.clubNombre = club?.nombre ?? '';
      }
      return updated;
    });
  }

  async guardarEvento(): Promise<void> {
    const f = this.formEvento();
    if (!f.clubId || !f.titulo || !f.descripcion || !f.fecha || !f.lugar) {
      this.mensajePanel.set('❌ Completa todos los campos del evento');
      return;
    }

    this.cargando.set(true);
    try {
      const datos: Omit<Evento, 'id'> = {
        clubId:      f.clubId!,
        clubNombre:  f.clubNombre!,
        titulo:      f.titulo!,
        descripcion: f.descripcion!,
        fecha:       f.fecha!,
        hora:        f.hora ?? '08:00',
        lugar:       f.lugar!,
        activo:      f.activo ?? true
      };

      if (this.editandoEventoId()) {
        await this.eventosService.update(this.editandoEventoId()!, datos);
        this.mensajePanel.set('✅ Evento actualizado');
      } else {
        await this.eventosService.create(datos);
        this.mensajePanel.set('✅ Evento creado');
      }
      this.mostrarFormEvento.set(false);
      this.editandoEventoId.set(null);
    } catch {
      this.mensajePanel.set('❌ Error al guardar el evento');
    } finally {
      this.cargando.set(false);
      setTimeout(() => this.mensajePanel.set(''), 4000);
    }
  }

  async eliminarEvento(id: string, titulo: string): Promise<void> {
    if (!confirm(`¿Eliminar el evento "${titulo}"?`)) return;
    try {
      await this.eventosService.delete(id);
      this.mensajePanel.set('✅ Evento eliminado');
    } catch {
      this.mensajePanel.set('❌ Error al eliminar el evento');
    } finally {
      setTimeout(() => this.mensajePanel.set(''), 4000);
    }
  }

  async cambiarEstado(id: string, estado: EstadoSolicitud): Promise<void> {
    const solicitud = this.todasSolicitudes().find(s => s.id === id);
    try {
      await this.solicitudesService.update(id, { estado });

      if (solicitud) {
        const prevEstado = solicitud.estado;
        const clubId = solicitud.clubId;
        const currentCount = this.miembrosPorClub()[clubId] ?? 0;
        let newCount = currentCount;
        if (estado === 'aprobada' && prevEstado !== 'aprobada') newCount++;
        else if (estado !== 'aprobada' && prevEstado === 'aprobada') newCount = Math.max(0, newCount - 1);
        if (newCount !== currentCount) {
          await this.clubesService.update(clubId, { miembros: newCount });
        }
      }

      if (solicitud) {
        const titulo  = estado === 'aprobada'
          ? `¡Ingreso aprobado al ${solicitud.clubNombre}!`
          : `Solicitud rechazada — ${solicitud.clubNombre}`;
        const mensaje = estado === 'aprobada'
          ? `Tu solicitud de ingreso al club "${solicitud.clubNombre}" fue aprobada. ¡Bienvenido!`
          : `Tu solicitud de ingreso al club "${solicitud.clubNombre}" no fue aprobada en esta ocasión.`;

        await this.notificacionesService.crear(
          solicitud.usuarioId,
          estado === 'aprobada' ? 'solicitud_aprobada' : 'solicitud_rechazada',
          titulo,
          mensaje,
          id
        );
      }

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

import { Component, inject, input, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, of, combineLatest, map } from 'rxjs';
import { ClubesService } from '../../services/clubes.service';
import { EventosService } from '../../services/eventos.service';
import { PostsService } from '../../services/posts.service';
import { CommentsService } from '../../services/comments.service';
import { SolicitudesService } from '../../services/solicitudes.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../panel-usuario/user.service';
import { Post } from '../../models/post.model';
import { Comment } from '../../models/comment.model';
import { RolClub } from '../../models/solicitud.model';

type Vista     = 'inicio' | 'miembros' | 'eventos';
type Categoria = 'Todos' | 'Anuncios' | 'Eventos' | 'Proyectos' | 'Social';

interface CalendarDay {
  date: Date;
  iso: string;
  enMesActual: boolean;
  eventos: any[];
}

@Component({
  selector: 'app-club-feed',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './club-feed.component.html',
  styleUrl: './club-feed.component.css'
})
export class ClubFeedComponent {
  id = input<string>('');

  private clubesService      = inject(ClubesService);
  private eventosService     = inject(EventosService);
  private postsService       = inject(PostsService);
  private commentsService    = inject(CommentsService);
  private solicitudesService = inject(SolicitudesService);
  private authService        = inject(AuthService);
  private userService        = inject(UserService);

  readonly club = toSignal(
    toObservable(this.id).pipe(
      switchMap(id => id ? this.clubesService.getById(id) : of(undefined))
    )
  );

  readonly eventos = toSignal(
    toObservable(this.id).pipe(
      switchMap(id => id ? this.eventosService.getByClub(id) : of([]))
    ),
    { initialValue: [] }
  );

  readonly posts = toSignal(
    toObservable(this.id).pipe(
      switchMap(id => id ? this.postsService.getByClub(id) : of([]))
    ),
    { initialValue: [] }
  );

  readonly comentarios = toSignal(
    toObservable(this.id).pipe(
      switchMap(id => id ? this.commentsService.getByClub(id) : of([]))
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

  readonly miembrosClub = toSignal(
    toObservable(this.id).pipe(
      switchMap(id => id ? this.solicitudesService.getByClub(id) : of([]))
    ),
    { initialValue: [] }
  );

  readonly uid = this.authService.uid;

  readonly esPrivilegiado = computed(() => {
    const rol = this.perfil()?.rol;
    return rol === 'Admin' || rol === 'Moderador';
  });

  readonly esModerador = computed(() => {
    if (this.esPrivilegiado()) return true;
    const sol = this.miSolicitud();
    return sol?.estado === 'aprobada' && sol?.esModeradorClub === true;
  });

  readonly accesoPermitido = computed(() => {
    if (!this.authService.isLoggedIn()) return false;
    if (this.esPrivilegiado()) return true;
    const sol = this.miSolicitud();
    const perfilCargado = this.perfil() !== undefined;
    if (sol === undefined || !perfilCargado) return true;
    if (sol === null) return false;
    return sol.estado === 'aprobada';
  });

  readonly vistaActiva = signal<Vista>('inicio');

  readonly categorias: Categoria[] = ['Todos', 'Anuncios', 'Eventos', 'Proyectos', 'Social'];
  readonly categoriasPost: Exclude<Categoria, 'Todos'>[] = ['Anuncios', 'Eventos', 'Proyectos', 'Social'];

  readonly categoriaActiva = signal<Categoria>('Todos');
  readonly nuevoContenido  = signal('');
  readonly categoriaNuevo  = signal<Exclude<Categoria, 'Todos'>>('Anuncios');
  readonly publicando      = signal(false);

  readonly postExpandido     = signal<string | null>(null);
  readonly comentariosTexto  = signal<Record<string, string>>({});
  readonly enviandoComentario = signal(false);

  readonly postsFiltrados = computed(() => {
    const cat = this.categoriaActiva();
    if (cat === 'Todos') return this.posts();
    return this.posts().filter(p => p.categoria === cat);
  });

  readonly comentariosAgrupados = computed(() => {
    const agrupado: Record<string, Comment[] | undefined> = {};
    for (const c of this.comentarios()) {
      if (!agrupado[c.postId]) agrupado[c.postId] = [];
      agrupado[c.postId]!.push(c);
    }
    return agrupado;
  });

  readonly MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  readonly DIAS_SEM = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];

  readonly calYear  = signal(new Date().getFullYear());
  readonly calMonth = signal(new Date().getMonth());
  readonly diaSeleccionado = signal<string | null>(null);

  readonly mostrarFormEvento = signal(false);
  readonly guardandoEvento   = signal(false);
  readonly evTitulo      = signal('');
  readonly evDescripcion = signal('');
  readonly evFecha       = signal('');
  readonly evHora        = signal('08:00');
  readonly evLugar       = signal('');

  readonly diasCalendario = computed<CalendarDay[]>(() => {
    const year   = this.calYear();
    const month  = this.calMonth();
    const primer = new Date(year, month, 1);
    const ultimo = new Date(year, month + 1, 0).getDate();
    const offset = (primer.getDay() + 6) % 7;
    const dias: CalendarDay[] = [];

    for (let i = offset - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      dias.push({ date, iso: toISO(date), enMesActual: false, eventos: [] });
    }
    for (let d = 1; d <= ultimo; d++) {
      const date = new Date(year, month, d);
      const iso  = toISO(date);
      const ev   = this.eventos().filter(e => e.fecha === iso && e.activo);
      dias.push({ date, iso, enMesActual: true, eventos: ev });
    }
    const restante = (7 - (dias.length % 7)) % 7;
    for (let d = 1; d <= restante; d++) {
      const date = new Date(year, month + 1, d);
      dias.push({ date, iso: toISO(date), enMesActual: false, eventos: [] });
    }
    return dias;
  });

  readonly eventosDelDia = computed(() => {
    const dia = this.diaSeleccionado();
    if (!dia) return [];
    return this.eventos().filter(e => e.fecha === dia && e.activo);
  });

  readonly proximosEventos = computed(() => {
    const hoy = toISO(new Date());
    return this.eventos()
      .filter(e => e.activo && e.fecha >= hoy)
      .slice(0, 3);
  });

  readonly mesaDirectiva = computed(() => {
    const roles: RolClub[] = ['Presidente', 'Vicepresidente', 'Secretario', 'Tesorero'];
    const miembros = this.miembrosClub();
    return roles.map(rol => ({
      rol,
      icono: { Presidente: '👑', Vicepresidente: '🛡️', Secretario: '✉️', Tesorero: '💰' }[rol],
      miembro: miembros.find(m => m.rolClub === rol) ?? null
    }));
  });

  prevMes(): void {
    if (this.calMonth() === 0) { this.calYear.update(y => y - 1); this.calMonth.set(11); }
    else { this.calMonth.update(m => m - 1); }
    this.diaSeleccionado.set(null);
  }

  nextMes(): void {
    if (this.calMonth() === 11) { this.calYear.update(y => y + 1); this.calMonth.set(0); }
    else { this.calMonth.update(m => m + 1); }
    this.diaSeleccionado.set(null);
  }

  seleccionarDia(iso: string): void {
    this.diaSeleccionado.set(this.diaSeleccionado() === iso ? null : iso);
  }

  esHoy(date: Date): boolean {
    return toISO(date) === toISO(new Date());
  }

  async asignarRol(solicitudId: string, rolClub: string): Promise<void> {
    await this.solicitudesService.update(solicitudId, { rolClub: (rolClub as RolClub) || null });
  }

  async toggleModerador(solicitudId: string, actual: boolean | undefined): Promise<void> {
    await this.solicitudesService.update(solicitudId, { esModeradorClub: !actual });
  }

  estaLikeado(post: Post): boolean {
    const uid = this.uid();
    return uid ? post.likes.includes(uid) : false;
  }

  async toggleLike(post: Post): Promise<void> {
    const uid = this.uid();
    if (!uid || !post.id) return;
    await this.postsService.toggleLike(post.id, uid, this.estaLikeado(post));
  }

  async publicar(): Promise<void> {
    const user = this.authService.currentUser();
    const club = this.club();
    const contenido = this.nuevoContenido().trim();
    if (!user || !club || !contenido) return;

    this.publicando.set(true);
    try {
      await this.postsService.create({
        clubId:       club.id!,
        autorId:      user.uid,
        autorNombre:  user.displayName ?? user.email ?? '',
        autorRolClub: this.miSolicitud()?.rolClub ?? null,
        categoria:    this.categoriaNuevo(),
        contenido,
        likes: []
      });
      this.nuevoContenido.set('');
    } finally {
      this.publicando.set(false);
    }
  }

  async eliminarPost(id: string): Promise<void> {
    await this.postsService.delete(id);
  }

  puedeEliminar(post: Post): boolean {
    return this.uid() === post.autorId || this.esModerador();
  }

  toggleComentarios(postId: string): void {
    this.postExpandido.set(this.postExpandido() === postId ? null : postId);
  }

  getTextoComentario(postId: string): string {
    return this.comentariosTexto()[postId] ?? '';
  }

  setTextoComentario(postId: string, texto: string): void {
    this.comentariosTexto.update(m => ({ ...m, [postId]: texto }));
  }

  async publicarComentario(postId: string): Promise<void> {
    const user = this.authService.currentUser();
    const club = this.club();
    const contenido = this.getTextoComentario(postId).trim();
    if (!user || !club || !contenido) return;

    this.enviandoComentario.set(true);
    try {
      await this.commentsService.create({
        postId,
        clubId:       club.id!,
        autorId:      user.uid,
        autorNombre:  user.displayName ?? user.email ?? '',
        autorRolClub: this.miSolicitud()?.rolClub ?? null,
        contenido
      });
      this.setTextoComentario(postId, '');
    } finally {
      this.enviandoComentario.set(false);
    }
  }

  async eliminarComentario(id: string): Promise<void> {
    await this.commentsService.delete(id);
  }

  puedeEliminarComentario(comment: Comment): boolean {
    return this.uid() === comment.autorId || this.esModerador();
  }

  async crearEvento(): Promise<void> {
    const club  = this.club();
    const titulo = this.evTitulo().trim();
    const fecha  = this.evFecha();
    if (!club || !titulo || !fecha) return;

    this.guardandoEvento.set(true);
    try {
      await this.eventosService.create({
        clubId:      club.id!,
        clubNombre:  club.nombre,
        titulo,
        descripcion: this.evDescripcion().trim(),
        fecha,
        hora:        this.evHora(),
        lugar:       this.evLugar().trim(),
        activo:      true
      });
      this.evTitulo.set('');
      this.evDescripcion.set('');
      this.evFecha.set('');
      this.evHora.set('08:00');
      this.evLugar.set('');
      this.mostrarFormEvento.set(false);
    } finally {
      this.guardandoEvento.set(false);
    }
  }

  tiempoRelativo(ts: any): string {
    if (!ts?.toDate) return '';
    const diff = Date.now() - (ts.toDate() as Date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'ahora';
    if (mins < 60) return `hace ${mins} min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `hace ${hrs} h`;
    return `hace ${Math.floor(hrs / 24)} d`;
  }

  iniciales(nombre: string): string {
    if (!nombre) return '?';
    return nombre.split(' ').map(w => w[0] ?? '').filter(Boolean).slice(0, 2).join('').toUpperCase();
  }

  colorAvatar(nombre: string): string {
    const colores = ['#6366f1','#8b5cf6','#ec4899','#0ea5e9','#22c55e','#f59e0b','#ef4444'];
    let h = 0;
    for (let i = 0; i < nombre.length; i++) h = nombre.charCodeAt(i) + ((h << 5) - h);
    return colores[Math.abs(h) % colores.length];
  }

  colorRolClub(rol: string): string {
    const map: Record<string, string> = {
      'Presidente':    '#dc2626',
      'Vicepresidente':'#2563eb',
      'Secretario':    '#7c3aed',
      'Tesorero':      '#059669'
    };
    return map[rol] ?? 'var(--primary)';
  }

  colorCategoria(cat: string): string {
    const m: Record<string, string> = {
      Anuncios: 'var(--danger)', Eventos: 'var(--primary)',
      Proyectos: 'var(--accent)', Social: '#22c55e'
    };
    return m[cat] ?? 'var(--muted)';
  }

  formatearFechaEvento(fecha: string, hora: string): string {
    try {
      const d = new Date(`${fecha}T${hora}`);
      return d.toLocaleDateString('es-HN', { weekday: 'short', month: 'long', day: 'numeric' }) + ' · ' + hora;
    } catch {
      return `${fecha} ${hora}`;
    }
  }
}

function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

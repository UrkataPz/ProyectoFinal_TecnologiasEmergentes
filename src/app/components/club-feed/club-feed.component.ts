import { Component, inject, input, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, of, combineLatest, map } from 'rxjs';
import { ClubesService } from '../../services/clubes.service';
import { EventosService } from '../../services/eventos.service';
import { PostsService } from '../../services/posts.service';
import { SolicitudesService } from '../../services/solicitudes.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../panel-usuario/user.service';
import { Post } from '../../models/post.model';

type Categoria = 'Todos' | 'Anuncios' | 'Eventos' | 'Proyectos' | 'Social';

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
    if (!this.authService.isLoggedIn()) return false;
    if (this.esPrivilegiado()) return true;
    const sol = this.miSolicitud();
    if (sol === undefined) return true;
    if (sol === null) return false;
    return sol.estado === 'aprobada';
  });

  readonly uid = this.authService.uid;

  readonly categorias: Categoria[] = ['Todos', 'Anuncios', 'Eventos', 'Proyectos', 'Social'];
  readonly categoriasPost: Exclude<Categoria, 'Todos'>[] = ['Anuncios', 'Eventos', 'Proyectos', 'Social'];

  readonly categoriaActiva = signal<Categoria>('Todos');
  readonly nuevoContenido  = signal('');
  readonly categoriaNuevo  = signal<Exclude<Categoria, 'Todos'>>('Anuncios');
  readonly publicando      = signal(false);

  readonly postsFiltrados = computed(() => {
    const cat = this.categoriaActiva();
    if (cat === 'Todos') return this.posts();
    return this.posts().filter(p => p.categoria === cat);
  });

  readonly proximosEventos = computed(() =>
    this.eventos()
      .filter(e => e.activo && e.fecha >= new Date().toISOString().slice(0, 10))
      .slice(0, 3)
  );

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
        clubId:      club.id!,
        autorId:     user.uid,
        autorNombre: user.displayName ?? user.email ?? '',
        categoria:   this.categoriaNuevo(),
        contenido,
        likes:       []
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
    return this.uid() === post.autorId || this.esPrivilegiado();
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

  colorCategoria(cat: string): string {
    const map: Record<string, string> = {
      Anuncios: 'var(--danger)',
      Eventos:  'var(--primary)',
      Proyectos:'var(--accent)',
      Social:   '#22c55e'
    };
    return map[cat] ?? 'var(--muted)';
  }
}

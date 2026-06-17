import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Club } from '../../models/club.model';
import { ClubesService } from '../../services/clubes.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent {
  private clubesService = inject(ClubesService);

  readonly clubes = toSignal(this.clubesService.getAll(), { initialValue: [] });
  readonly filtro = signal('');

  readonly clubesActivos = computed(() =>
    this.clubes().filter(club => club.activo)
  );

  readonly resumenes = computed(() => {
    const activos = this.clubesActivos();
    const categorias = new Set(
      activos
        .map(club => club.categoria?.trim())
        .filter((categoria): categoria is string => Boolean(categoria))
    );
    const miembros = activos.reduce((total, club) => total + (Number(club.miembros) || 0), 0);

    return [
      { titulo: 'Clubes activos', valor: `${activos.length}`, texto: 'Organizaciones estudiantiles disponibles.' },
      { titulo: 'Categorías disponibles', valor: `${categorias.size}`, texto: 'Tecnología, deportes, cultura, liderazgo y más.' },
      { titulo: 'Miembros registrados', valor: `${miembros}+`, texto: 'Estudiantes participando en la comunidad CEUTEC.' }
    ];
  });

  readonly clubesFiltrados = computed(() => {
    const termino = this.filtro().toLowerCase().trim();
    if (!termino) return this.clubesActivos();

    return this.clubesActivos().filter(club =>
      club.nombre.toLowerCase().includes(termino) ||
      club.categoria.toLowerCase().includes(termino) ||
      (club.descripcion ?? '').toLowerCase().includes(termino)
    );
  });

  readonly clubesDestacados = computed(() =>
    [...this.clubesActivos()]
      .sort((a, b) => (Number(b.miembros) || 0) - (Number(a.miembros) || 0))
      .slice(0, 3)
  );

  readonly carouselSlides = signal([
    {
      src: 'images/slider1.jpg'
    },
    {
      src: 'images/slider2.jpg'
    },
    {
      src: 'images/slider3.jpg'
    }
  ]);

  readonly beneficios = signal([
    {
      icono: '🎓',
      titulo: 'Desarrollo profesional',
      desc: 'Fortalece habilidades académicas y profesionales mientras colaboras con otros estudiantes.'
    },
    {
      icono: '🤝',
      titulo: 'Networking',
      desc: 'Crea contactos con compañeros, docentes y líderes de distintas áreas de CEUTEC.'
    },
    {
      icono: '🏆',
      titulo: 'Participación en eventos',
      desc: 'Forma parte de actividades, competencias, talleres y experiencias universitarias.'
    },
    {
      icono: '📜',
      titulo: 'Certificados y experiencia',
      desc: 'Suma participación relevante para tu desarrollo curricular y vida profesional.'
    },
    {
      icono: '💡',
      titulo: 'Proyectos reales',
      desc: 'Aprende de forma práctica resolviendo retos y construyendo iniciativas con impacto.'
    }
  ]);

  imagenClub(club: Club): string {
    return club.imagenUrl || club.logoUrl || '';
  }
}

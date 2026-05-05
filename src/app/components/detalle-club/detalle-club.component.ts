import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

interface ClubDetalle {
  id: number;
  nombre: string;
  categoria: string;
  descripcion: string;
  objetivo: string;
  directiva: string;
  eventos: string[];
}

@Component({
  selector: 'app-detalle-club',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './detalle-club.component.html',
  styleUrl: './detalle-club.component.css'
})
export class DetalleClubComponent {
  private route = inject(ActivatedRoute);

  clubes: ClubDetalle[] = [
    {
      id: 1,
      nombre: 'Club de Tecnología e Innovación',
      categoria: 'Tecnología',
      descripcion: 'Espacio para estudiantes interesados en programación, innovación y proyectos tecnológicos.',
      objetivo: 'Promover el desarrollo de habilidades tecnológicas mediante talleres, retos y proyectos colaborativos.',
      directiva: 'Coordinador tecnológico y equipo de estudiantes líderes.',
      eventos: ['Taller de Angular', 'Charla sobre Firebase', 'Hackatón universitaria']
    },
    {
      id: 2,
      nombre: 'Club de Emprendimiento',
      categoria: 'Negocios',
      descripcion: 'Organización orientada a ideas de negocio, liderazgo y desarrollo de proyectos estudiantiles.',
      objetivo: 'Impulsar la creatividad, liderazgo y validación de ideas de negocio dentro de la comunidad estudiantil.',
      directiva: 'Presidente, secretario y equipo de logística.',
      eventos: ['Pitch de ideas', 'Feria de emprendimiento', 'Mentoría de negocios']
    },
    {
      id: 3,
      nombre: 'Club de Voluntariado',
      categoria: 'Social',
      descripcion: 'Grupo enfocado en actividades de apoyo social, servicio comunitario y participación universitaria.',
      objetivo: 'Organizar actividades de impacto social y promover la participación responsable de los estudiantes.',
      directiva: 'Coordinador social y voluntarios líderes.',
      eventos: ['Campaña solidaria', 'Jornada de recolección', 'Actividad comunitaria']
    },
    {
      id: 4,
      nombre: 'Club de Arte y Cultura',
      categoria: 'Cultura',
      descripcion: 'Comunidad para promover actividades artísticas, culturales y creativas dentro de la universidad.',
      objetivo: 'Crear espacios de expresión artística y cultural para la comunidad universitaria.',
      directiva: 'Coordinador cultural y equipo creativo.',
      eventos: ['Exposición artística', 'Noche cultural', 'Taller de fotografía']
    }
  ];

  get club(): ClubDetalle | undefined {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    return this.clubes.find((club) => club.id === id);
  }
}

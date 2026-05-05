import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Club {
  id: number;
  nombre: string;
  categoria: string;
  descripcion: string;
  miembros: number;
}

@Component({
  selector: 'app-clubes',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './clubes.component.html',
  styleUrl: './clubes.component.css'
})
export class ClubesComponent {
  clubes: Club[] = [
    {
      id: 1,
      nombre: 'Club de Tecnología e Innovación',
      categoria: 'Tecnología',
      descripcion: 'Espacio para estudiantes interesados en programación, innovación y proyectos tecnológicos.',
      miembros: 28
    },
    {
      id: 2,
      nombre: 'Club de Emprendimiento',
      categoria: 'Negocios',
      descripcion: 'Organización orientada a ideas de negocio, liderazgo y desarrollo de proyectos estudiantiles.',
      miembros: 18
    },
    {
      id: 3,
      nombre: 'Club de Voluntariado',
      categoria: 'Social',
      descripcion: 'Grupo enfocado en actividades de apoyo social, servicio comunitario y participación universitaria.',
      miembros: 35
    },
    {
      id: 4,
      nombre: 'Club de Arte y Cultura',
      categoria: 'Cultura',
      descripcion: 'Comunidad para promover actividades artísticas, culturales y creativas dentro de la universidad.',
      miembros: 22
    }
  ];
}

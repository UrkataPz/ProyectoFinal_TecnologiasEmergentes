import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent {
  resumenes = [
    { titulo: 'Clubes registrados', valor: '6+', texto: 'Directorio inicial de organizaciones estudiantiles.' },
    { titulo: 'Eventos activos', valor: '12', texto: 'Actividades, reuniones y anuncios por club.' },
    { titulo: 'Roles del sistema', valor: '4', texto: 'Administrador, directivo, miembro y estudiante.' }
  ];
}

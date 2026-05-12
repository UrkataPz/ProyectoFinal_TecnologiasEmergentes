import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent {
  readonly resumenes = signal([
    { titulo: 'Clubes registrados', valor: '6+', texto: 'Directorio de organizaciones estudiantiles activas.' },
    { titulo: 'Categorías',         valor: '7',  texto: 'Tecnología, deportes, cultura, arte y más.' },
    { titulo: 'Estudiantes',        valor: '∞',  texto: 'Cualquier estudiante puede solicitar su ingreso.' }
  ]);

  readonly pasos = signal([
    { num: '1', titulo: 'Crea tu cuenta',       desc: 'Regístrate con tu correo institucional.' },
    { num: '2', titulo: 'Explora los clubes',   desc: 'Navega el directorio y conoce cada organización.' },
    { num: '3', titulo: 'Solicita tu ingreso',  desc: 'Envía una solicitud y espera la aprobación.' }
  ]);
}

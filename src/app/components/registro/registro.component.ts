import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {
  usuario = {
    nombre: '',
    correo: '',
    carrera: '',
    rol: 'Estudiante'
  };

  mensaje = '';

  registrar(): void {
    this.mensaje = `Registro de ejemplo creado para ${this.usuario.nombre || 'nuevo usuario'}.`;
  }
}

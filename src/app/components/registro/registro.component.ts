import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  nombre = signal('');
  correo = signal('');
  carrera = signal('');
  password = signal('');
  confirmPassword = signal('');
  mensaje = signal('');
  isLoading = signal(false);

  readonly passwordsCoinciden = computed(() => this.password() === this.confirmPassword());

  async registrar(): Promise<void> {
    if (!this.nombre() || !this.correo() || !this.password() || !this.carrera()) {
      this.mensaje.set('❌ Por favor complete todos los campos');
      return;
    }

    if (!this.passwordsCoinciden()) {
      this.mensaje.set('❌ Las contraseñas no coinciden');
      return;
    }

    if (this.password().length < 6) {
      this.mensaje.set('❌ La contraseña debe tener al menos 6 caracteres');
      return;
    }

    this.isLoading.set(true);
    this.mensaje.set('🔄 Creando cuenta en Firebase...');

    try {
      const result = await this.authService.register(
        this.correo(),
        this.password(),
        this.nombre(),
        this.carrera(),
        'Estudiante'
      );

      if (result.success) {
        this.mensaje.set(`✅ ${result.message}. Redirigiendo al login...`);
        this.nombre.set('');
        this.correo.set('');
        this.carrera.set('');
        this.password.set('');
        this.confirmPassword.set('');
        setTimeout(() => this.router.navigate(['/login']), 2000);
      } else {
        this.mensaje.set(`❌ ${result.message}`);
        this.isLoading.set(false);
      }
    } catch {
      this.mensaje.set('❌ Error al conectar con Firebase');
      this.isLoading.set(false);
    }
  }
}

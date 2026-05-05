import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  correo = '';
  password = '';
  mensaje = '';
  isLoading = false;

  async iniciarSesion(): Promise<void> {
    // Validar campos
    if (!this.correo || !this.password) {
      this.mensaje = '❌ Por favor complete todos los campos';
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.correo)) {
      this.mensaje = '❌ Ingrese un correo electrónico válido';
      return;
    }

    this.isLoading = true;
    this.mensaje = '🔄 Verificando credenciales...';

    const result = await this.authService.login(this.correo, this.password);
    
    if (result.success) {
      this.mensaje = '✅ ' + result.message + ' Redirigiendo...';
      setTimeout(() => {
        this.router.navigate(['/dashboard']); 
      }, 1500);
    } else {
      this.mensaje = '❌ ' + result.message;
      this.isLoading = false;
      this.password = '';
    }
  }
}
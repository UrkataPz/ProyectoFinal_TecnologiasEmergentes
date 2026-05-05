import { Injectable, inject } from '@angular/core';
import { 
  Auth, 
  signInWithEmailAndPassword,  
  createUserWithEmailAndPassword,  
  updateProfile 
} from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);


  async login(email: string, password: string): Promise<{ success: boolean; message: string }> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
      return { success: true, message: 'Inicio de sesión exitoso' };
    } catch (error: any) {
      console.error('Error de login:', error);
      let mensajeError = 'Error al iniciar sesión';
      
      switch (error.code) {
        case 'auth/invalid-credential':
          mensajeError = 'Correo o contraseña incorrectos';
          break;
        case 'auth/user-not-found':
          mensajeError = 'Usuario no encontrado';
          break;
        case 'auth/wrong-password':
          mensajeError = 'Contraseña incorrecta';
          break;
        case 'auth/invalid-email':
          mensajeError = 'Formato de correo inválido';
          break;
        case 'auth/too-many-requests':
          mensajeError = 'Demasiados intentos. Intente más tarde';
          break;
        default:
          mensajeError = error.message;
      }
      
      return { success: false, message: mensajeError };
    }
  }

  // ============ REGISTRO ============
  async register(
    email: string, 
    password: string, 
    nombre: string, 
    carrera: string, 
    rol: string
  ): Promise<{ success: boolean; message: string }> {
    try {
   
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      
     
      await updateProfile(user, {
        displayName: nombre
      });
      
  
      await setDoc(doc(this.firestore, 'usuarios', user.uid), {
        nombre: nombre,
        email: email,
        carrera: carrera,
        rol: rol,
        createdAt: new Date(),
        uid: user.uid
      });
      
      console.log('Usuario registrado:', { email, nombre, carrera, rol });
      return { success: true, message: 'Cuenta creada exitosamente' };
      
    } catch (error: any) {
      console.error('Error Firebase:', error);
      let mensajeError = 'Error al registrarse';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          mensajeError = 'Este correo ya está registrado. Usa otro o inicia sesión';
          break;
        case 'auth/invalid-email':
          mensajeError = 'Formato de correo inválido';
          break;
        case 'auth/weak-password':
          mensajeError = 'La contraseña debe tener al menos 6 caracteres';
          break;
        case 'auth/operation-not-allowed':
          mensajeError = 'El registro de email/contraseña no está habilitado en Firebase Console';
          break;
        default:
          mensajeError = error.message;
      }
      
      return { success: false, message: mensajeError };
    }
  }

  // ============ CERRAR SESIÓN ============
  async logout(): Promise<void> {
    await this.auth.signOut();
  }

  // ============ OBTENER USUARIO ACTUAL ============
  getCurrentUser() {
    return this.auth.currentUser;
  }
}
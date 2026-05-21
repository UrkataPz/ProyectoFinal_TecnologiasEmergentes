import { Injectable, Injector, inject, runInInjectionContext } from '@angular/core';
import { Firestore, doc, docData, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface UserProfile {
  uid: string;
  nombre: string;
  correo: string;
  carrera: string;
  rol: 'Estudiante' | 'Admin' | 'Moderador';
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private firestore = inject(Firestore);
  private injector = inject(Injector);

  getProfile(uid: string): Observable<UserProfile | undefined> {
    const userDoc = doc(this.firestore, `usuarios/${uid}`);
    return runInInjectionContext(
      this.injector,
      () => docData(userDoc) as Observable<UserProfile | undefined>
    );
  }

  updateProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    const userDoc = doc(this.firestore, `usuarios/${uid}`);
    return updateDoc(userDoc, data);
  }
}

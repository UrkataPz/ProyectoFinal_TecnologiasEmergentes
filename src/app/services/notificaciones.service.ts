import { Injectable, Injector, inject, runInInjectionContext } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  orderBy
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Notificacion, TipoNotificacion } from '../models/notificacion.model';

@Injectable({ providedIn: 'root' })
export class NotificacionesService {
  private firestore = inject(Firestore);
  private injector  = inject(Injector);
  private colRef    = collection(this.firestore, 'notificaciones');

  getByUsuario(usuarioId: string): Observable<Notificacion[]> {
    const q = query(
      this.colRef,
      where('usuarioId', '==', usuarioId),
      orderBy('creadaEn', 'desc')
    );
    return runInInjectionContext(
      this.injector,
      () => collectionData(q, { idField: 'id' }) as Observable<Notificacion[]>
    );
  }

  async crear(
    usuarioId: string,
    tipo: TipoNotificacion,
    titulo: string,
    mensaje: string,
    referenciaId?: string
  ): Promise<void> {
    await addDoc(this.colRef, {
      usuarioId,
      tipo,
      titulo,
      mensaje,
      leida: false,
      referenciaId: referenciaId ?? null,
      creadaEn: serverTimestamp()
    });
  }

  async marcarLeida(id: string): Promise<void> {
    await updateDoc(doc(this.firestore, 'notificaciones', id), { leida: true });
  }

  async marcarTodasLeidas(usuarioId: string, ids: string[]): Promise<void> {
    await Promise.all(
      ids.map(id => updateDoc(doc(this.firestore, 'notificaciones', id), { leida: true }))
    );
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(this.firestore, 'notificaciones', id));
  }
}

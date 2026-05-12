import { Injectable, inject } from '@angular/core';
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
import { Solicitud } from '../models/solicitud.model';

@Injectable({ providedIn: 'root' })
export class SolicitudesService {
  private firestore = inject(Firestore);
  private colRef = collection(this.firestore, 'solicitudes');

  getAll(): Observable<Solicitud[]> {
    const q = query(this.colRef, orderBy('fechaSolicitud', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<Solicitud[]>;
  }

  getByUsuario(usuarioId: string): Observable<Solicitud[]> {
    const q = query(
      this.colRef,
      where('usuarioId', '==', usuarioId),
      orderBy('fechaSolicitud', 'desc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<Solicitud[]>;
  }

  async create(solicitud: Omit<Solicitud, 'id'>): Promise<void> {
    await addDoc(this.colRef, { ...solicitud, fechaSolicitud: serverTimestamp() });
  }

  async update(id: string, data: Partial<Omit<Solicitud, 'id'>>): Promise<void> {
    await updateDoc(doc(this.firestore, 'solicitudes', id), data as Record<string, any>);
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(this.firestore, 'solicitudes', id));
  }
}

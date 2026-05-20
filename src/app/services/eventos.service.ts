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
import { Evento } from '../models/evento.model';

@Injectable({ providedIn: 'root' })
export class EventosService {
  private firestore = inject(Firestore);
  private injector  = inject(Injector);
  private colRef    = collection(this.firestore, 'eventos');

  getAll(): Observable<Evento[]> {
    const q = query(this.colRef, orderBy('fecha', 'asc'));
    return runInInjectionContext(
      this.injector,
      () => collectionData(q, { idField: 'id' }) as Observable<Evento[]>
    );
  }

  getByClub(clubId: string): Observable<Evento[]> {
    const q = query(
      this.colRef,
      where('clubId', '==', clubId),
      orderBy('fecha', 'asc')
    );
    return runInInjectionContext(
      this.injector,
      () => collectionData(q, { idField: 'id' }) as Observable<Evento[]>
    );
  }

  async create(evento: Omit<Evento, 'id'>): Promise<void> {
    await addDoc(this.colRef, { ...evento, creadoEn: serverTimestamp() });
  }

  async update(id: string, data: Partial<Omit<Evento, 'id'>>): Promise<void> {
    await updateDoc(doc(this.firestore, 'eventos', id), data as Record<string, any>);
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(this.firestore, 'eventos', id));
  }
}

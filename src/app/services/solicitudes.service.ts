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
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Solicitud } from '../models/solicitud.model';

@Injectable({ providedIn: 'root' })
export class SolicitudesService {
  private firestore = inject(Firestore);
  private injector = inject(Injector);
  private colRef = collection(this.firestore, 'solicitudes');

  getByClub(clubId: string): Observable<Solicitud[]> {
    const q = query(this.colRef, where('clubId', '==', clubId));
    return runInInjectionContext(
      this.injector,
      () => collectionData(q, { idField: 'id' }) as Observable<Solicitud[]>
    ).pipe(
      map(sols => sols.filter(s => s.estado === 'aprobada')),
      catchError(err => {
        console.error('[getByClub]', clubId, err);
        return of([]);
      })
    );
  }

  getAll(): Observable<Solicitud[]> {
    const q = query(this.colRef, orderBy('fechaSolicitud', 'desc'));
    return runInInjectionContext(
      this.injector,
      () => collectionData(q, { idField: 'id' }) as Observable<Solicitud[]>
    );
  }

  getByUsuario(usuarioId: string): Observable<Solicitud[]> {
    const q = query(
      this.colRef,
      where('usuarioId', '==', usuarioId)
    );
    return runInInjectionContext(
      this.injector,
      () => collectionData(q, { idField: 'id' }) as Observable<Solicitud[]>
    ).pipe(
      map(solicitudes => [...solicitudes].sort((a, b) => this.fechaMillis(b) - this.fechaMillis(a)))
    );
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

  private fechaMillis(solicitud: Solicitud): number {
    const fecha = solicitud.fechaSolicitud;
    if (!fecha) return 0;
    if (typeof fecha.toMillis === 'function') return fecha.toMillis();
    if (fecha instanceof Date) return fecha.getTime();
    return Number(fecha) || 0;
  }
}

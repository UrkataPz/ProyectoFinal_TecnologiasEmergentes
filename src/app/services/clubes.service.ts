import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Club } from '../models/club.model';

@Injectable({ providedIn: 'root' })
export class ClubesService {
  private firestore = inject(Firestore);
  private colRef = collection(this.firestore, 'clubes');

  getAll(): Observable<Club[]> {
    const q = query(this.colRef, orderBy('nombre'));
    return collectionData(q, { idField: 'id' }) as Observable<Club[]>;
  }

  getById(id: string): Observable<Club | undefined> {
    return docData(doc(this.firestore, 'clubes', id), { idField: 'id' }) as Observable<Club | undefined>;
  }

  async create(club: Omit<Club, 'id'>): Promise<void> {
    await addDoc(this.colRef, { ...club, creadoEn: serverTimestamp() });
  }

  async update(id: string, data: Partial<Omit<Club, 'id'>>): Promise<void> {
    await updateDoc(doc(this.firestore, 'clubes', id), data as Record<string, any>);
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(this.firestore, 'clubes', id));
  }
}

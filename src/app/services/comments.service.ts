import { Injectable, Injector, inject, runInInjectionContext } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  addDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  orderBy
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Comment } from '../models/comment.model';

@Injectable({ providedIn: 'root' })
export class CommentsService {
  private firestore = inject(Firestore);
  private injector  = inject(Injector);
  private colRef    = collection(this.firestore, 'comments');

  getByClub(clubId: string): Observable<Comment[]> {
    const q = query(
      this.colRef,
      where('clubId', '==', clubId),
      orderBy('creadoEn', 'asc')
    );
    return runInInjectionContext(
      this.injector,
      () => collectionData(q, { idField: 'id' }) as Observable<Comment[]>
    );
  }

  async create(comment: Omit<Comment, 'id'>): Promise<void> {
    await addDoc(this.colRef, { ...comment, creadoEn: serverTimestamp() });
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(this.firestore, 'comments', id));
  }
}

import { Injectable, Injector, inject, runInInjectionContext } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  arrayUnion,
  arrayRemove
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Post } from '../models/post.model';

@Injectable({ providedIn: 'root' })
export class PostsService {
  private firestore = inject(Firestore);
  private injector = inject(Injector);
  private colRef = collection(this.firestore, 'posts');

  getByClub(clubId: string): Observable<Post[]> {
    const q = query(
      this.colRef,
      where('clubId', '==', clubId),
      orderBy('creadoEn', 'desc')
    );
    return runInInjectionContext(
      this.injector,
      () => collectionData(q, { idField: 'id' }) as Observable<Post[]>
    );
  }

  async create(post: Omit<Post, 'id'>): Promise<void> {
    await addDoc(this.colRef, { ...post, creadoEn: serverTimestamp() });
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(this.firestore, 'posts', id));
  }

  async toggleLike(id: string, userId: string, alreadyLiked: boolean): Promise<void> {
    await updateDoc(doc(this.firestore, 'posts', id), {
      likes: alreadyLiked ? arrayRemove(userId) : arrayUnion(userId)
    });
  }
}

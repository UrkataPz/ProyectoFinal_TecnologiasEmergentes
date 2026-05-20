import { Injectable, Injector, inject, runInInjectionContext } from '@angular/core';
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
  orderBy,
  getDocs
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Club } from '../models/club.model';

const CLUBES_INICIALES: Omit<Club, 'id'>[] = [
  {
    nombre: 'Club de Ingeniería y Tecnología',
    categoria: 'Tecnología',
    descripcion: 'Espacio para estudiantes apasionados por la programación, el desarrollo de software y la innovación tecnológica.',
    objetivo: 'Desarrollar habilidades técnicas mediante proyectos colaborativos, hackathones y talleres especializados.',
    requisitos: 'Estar matriculado en cualquier carrera de CEUTEC y tener interés en tecnología.',
    miembros: 32,
    activo: true
  },
  {
    nombre: 'Club de Emprendimiento CEUTEC',
    categoria: 'Negocios',
    descripcion: 'Organización orientada al desarrollo de ideas de negocio, liderazgo empresarial y mentoría estudiantil.',
    objetivo: 'Impulsar el espíritu emprendedor, validar ideas de negocio y conectar estudiantes con el ecosistema empresarial.',
    requisitos: 'Ser estudiante activo con una idea de negocio o deseo de aprender sobre emprendimiento.',
    miembros: 24,
    activo: true
  },
  {
    nombre: 'Club Deportivo UNITEC',
    categoria: 'Deportes',
    descripcion: 'Club que agrupa todas las disciplinas deportivas: fútbol, básquetbol, voleibol y atletismo universitario.',
    objetivo: 'Fomentar la vida deportiva y el bienestar físico dentro de la comunidad estudiantil de CEUTEC.',
    requisitos: 'Ser estudiante activo y pasar una prueba de aptitud física básica.',
    miembros: 48,
    activo: true
  },
  {
    nombre: 'Club de Arte y Cultura',
    categoria: 'Arte',
    descripcion: 'Comunidad creativa para promover las artes visuales, música, teatro y expresión cultural universitaria.',
    objetivo: 'Crear espacios de expresión artística y representar a CEUTEC en eventos culturales nacionales.',
    requisitos: 'Tener interés en alguna disciplina artística. No se requiere experiencia previa.',
    miembros: 20,
    activo: true
  },
  {
    nombre: 'Club de Voluntariado y Servicio Social',
    categoria: 'Social',
    descripcion: 'Grupo estudiantil dedicado al servicio comunitario, campañas solidarias y responsabilidad social universitaria.',
    objetivo: 'Organizar actividades de impacto social que beneficien a comunidades vulnerables en Honduras.',
    requisitos: 'Compromiso con al menos 2 actividades de voluntariado por semestre.',
    miembros: 38,
    activo: true
  },
  {
    nombre: 'Club de Robótica e Inteligencia Artificial',
    categoria: 'Tecnología',
    descripcion: 'Club especializado en robótica educativa, IA aplicada y participación en competencias nacionales e internacionales.',
    objetivo: 'Representar a CEUTEC en competencias de robótica y desarrollar proyectos de IA con impacto social.',
    requisitos: 'Estudiante de Ingeniería, Sistemas o carreras afines. Conocimientos básicos de programación.',
    miembros: 15,
    activo: true
  }
];

@Injectable({ providedIn: 'root' })
export class ClubesService {
  private firestore = inject(Firestore);
  private injector   = inject(Injector);
  private colRef     = collection(this.firestore, 'clubes');

  getAll(): Observable<Club[]> {
    const q = query(this.colRef, orderBy('nombre'));
    return runInInjectionContext(
      this.injector,
      () => collectionData(q, { idField: 'id' }) as Observable<Club[]>
    );
  }

  getById(id: string): Observable<Club | undefined> {
    return runInInjectionContext(
      this.injector,
      () => docData(doc(this.firestore, 'clubes', id), { idField: 'id' }) as Observable<Club | undefined>
    );
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

  async seedSiVacio(): Promise<{ insertados: number }> {
    const snapshot = await getDocs(this.colRef);
    if (!snapshot.empty) return { insertados: 0 };

    for (const club of CLUBES_INICIALES) {
      await addDoc(this.colRef, { ...club, creadoEn: serverTimestamp() });
    }
    return { insertados: CLUBES_INICIALES.length };
  }
}

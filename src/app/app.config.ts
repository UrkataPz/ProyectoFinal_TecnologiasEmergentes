import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCvweCtB2eMBeny1f5hNElBnB5CQnJvSKY",
  authDomain: "sistema-clubes-estudiantiles.firebaseapp.com",
  projectId: "sistema-clubes-estudiantiles",
  storageBucket: "sistema-clubes-estudiantiles.firebasestorage.app",
  messagingSenderId: "536110659846",
  appId: "1:536110659846:web:829b26b6565e06eec00687",
  measurementId: "G-81QSR2C99T"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage())
  ]
};
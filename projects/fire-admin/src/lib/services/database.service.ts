import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class DatabaseService {

  constructor(private db: AngularFirestore) { }

  /**
   * Add collection
   * 
   * @param path 
   * @param data 
   */
  addCollection(path: string, data: any): Promise<DocumentReference> {
    return this.db.collection(path).add(data);
  }

  /**
   * Get collection
   * 
   * @param path 
   */
  getCollection(path: string): Observable<any> {
    return this.db.collection(path).snapshotChanges().pipe(map((changes) => {
        // console.log(changes);
        let docs = [];
        changes.forEach(({ payload: { doc } }) => {
          // console.log(change);
          docs.push({ id: doc.id, ...(doc.data() as object) });
        });
        // console.log(docs);
        return docs;
      })
    );
  }

  /**
   * Add document
   * 
   * @param collectionPath 
   * @param data 
   * @param documentPath 
   */
  addDocument(collectionPath: string, data: any, documentPath?: string): Promise<any> {
    if (documentPath && documentPath.length) {
      return this.setDocument(collectionPath, documentPath, data);
    } else {
      return this.addCollection(collectionPath, data);
    }
  }

  /**
   * Set document
   * 
   * @param collectionPath 
   * @param documentPath 
   * @param data 
   */
  setDocument(collectionPath: string, documentPath: string, data: any, merge: boolean = true): Promise<void> {
    return this.db.collection(collectionPath).doc(documentPath).set(data, { merge: merge });
  }

  /**
   * Get document
   * 
   * @param collectionPath 
   * @param documentPath 
   */
  getDocument(collectionPath: string, documentPath: string): Observable<any> {
    return this.db.collection(collectionPath).doc(documentPath).valueChanges();
  }

  /**
   * Delete document
   * 
   * @param collectionPath 
   * @param documentPath 
   */
  deleteDocument(collectionPath: string, documentPath: string): Promise<void> {
    return this.db.collection(collectionPath).doc(documentPath).delete();
  }

}
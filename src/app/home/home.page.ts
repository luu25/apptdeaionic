import { Component } from '@angular/core';
import { LoadingController, NavController, ToastController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore'; // Importa Firestore

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  posts: any[] = []; // Inicializa como un array vacío

  constructor(
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private afAuth: AngularFireAuth,
    private navCtrl: NavController,
    private firestore: AngularFirestore // Asegúrate de inyectar Firestore
  ) {}

  ionViewWillEnter() {
    this.getPosts();
  }

  async getPosts() {
    let loader = await this.loadingCtrl.create({
      message: 'Espere por favor...',
    });
    await loader.present();

    try {
      // Utiliza snapshotChanges correctamente
      this.firestore
        .collection('posts')
        .snapshotChanges()
        .subscribe((data: any[]) => {
          this.posts = data.map((e: any) => {
            return {
              id: e.payload.doc.id,
              title: e.payload.doc.data()['title'],
              details: e.payload.doc.data()['details'],
            };
          });
        });

      await loader.dismiss();
    } catch (e: any) {
      console.error(e); // Para diagnosticar el error
      this.showToast('Error al obtener los datos');
      await loader.dismiss();
    }
  }

  async deletePost(id: string) {
    let loader = await this.loadingCtrl.create({
      message: 'Espere un momento por favor...',
    });
    await loader.present();

    try {
      // Elimina el documento con el ID proporcionado
      await this.firestore.doc('posts/' + id).delete();
      this.showToast('Post eliminado correctamente');
    } catch (e: any) {
      console.error(e); // Diagnostica el error en la consola
      this.showToast('Error al eliminar el post');
    } finally {
      await loader.dismiss();
    }
  }

  showToast(message: string) {
    this.toastCtrl
      .create({
        message: message,
        duration: 5000,
      })
      .then((toastData) => toastData.present());
  }
}

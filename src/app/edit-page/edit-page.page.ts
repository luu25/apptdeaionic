import { Component, OnInit } from '@angular/core';
import { Post } from '../models/post.model';
import { LoadingController, NavController, ToastController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute, Router } from '@angular/router'; // Importa ActivatedRoute y Router

@Component({
  selector: 'app-edit-page',
  templateUrl: './edit-page.page.html',
  styleUrls: ['./edit-page.page.scss'],
})
export class EditPagePage implements OnInit {
  post = {} as Post;
  id: string | null = null;

  constructor(
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private afAuth: AngularFireAuth,
    private navCtrl: NavController,
    private firestore: AngularFirestore,
    private actRoute: ActivatedRoute,
    private router: Router
  ) {
    this.id = this.actRoute.snapshot.paramMap.get('id');
  }

  ngOnInit() {
    if (this.id) {
      this.getPostById(this.id);
    }
  }

  async getPostById(id: string) {
    const loader = await this.loadingCtrl.create({
      message: 'Espere por favor...',
    });
    await loader.present();

    try {
      this.firestore
        .doc(`posts/${id}`)
        .valueChanges()
        .subscribe((data: any) => {
          if (data) {
            this.post.title = data.title;
            this.post.details = data.details;
          }
          loader.dismiss();
        });
    } catch (e: any) {
      console.error(e);
      loader.dismiss();
      this.showToast('Error al obtener el post.');
    }
  }

  async updatePost(post: Post) {
    if (!this.formValidation()) {
      return;
    }

    const loader = await this.loadingCtrl.create({
      message: 'Actualizando...',
    });
    await loader.present();

    try {
      await this.firestore.doc(`posts/${this.id}`).update(post);
      loader.dismiss();
      this.showToast('Post actualizado correctamente.');
      this.router.navigate(['/home']); 
    } catch (error) {
      console.error('Error al actualizar el elemento', error);
      loader.dismiss();
      this.showToast('Error al actualizar el post.');
    }
  }

  formValidation() {
    if (!this.post.title) {
      this.showToast('Ingrese un título.');
      return false;
    }
    if (!this.post.details) {
      this.showToast('Ingrese una descripción.');
      return false;
    }
    return true;
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

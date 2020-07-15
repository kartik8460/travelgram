import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

// Angular Forms
import { finalize } from 'rxjs/operators';

// Firebase
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFireDatabase } from '@angular/fire/database';

// Browser Image Resizer
import { readAndCompressImage } from 'browser-image-resizer';
import { imageConfig } from './../../../utils/Image-resize-config';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-addpost',
  templateUrl: './addpost.component.html',
  styleUrls: ['./addpost.component.css'],
})
export class AddpostComponent implements OnInit {
  locationName: string;
  description: string;
  picture: string = null;

  user = null;
  uploadPercent: number = null;

  constructor(
    private auth: AuthService,
    private router: Router,
    private db: AngularFireDatabase,
    private toastr: ToastrService,
    private storage: AngularFireStorage
  ) {
    auth.getUser().subscribe((user) => {
      this.db
        .object(`/users/${user.uid}`)
        .valueChanges()
        .subscribe((user) => (this.user = user));
    });
  }

  ngOnInit(): void {}

  onSubmit() {
    const uid = uuidv4();
    this.db
      .object(`/posts/${uid}`)
      .set({
        id: uid,
        locationName: this.locationName,
        description: this.description,
        picture: this.picture,
        by: this.user.name,
        instaId: this.user.instaUserName,
        date: Date.now(),
      })
      .then(() => {
        this.toastr.success('Hurrah! Post Added Successfull');
        this.router.navigateByUrl('/');
      })
      .catch((err) => {
        this.toastr.error('Alas! Failed to Add Post');
      });
  }

  async uploadFile(event) {
    const file = event.target.files[0];

    let resizedImage = await readAndCompressImage(file, imageConfig);

    const filepath =
      file.name.split('.')[0] + Date.now() + '.' + file.name.split('.').pop();
    const fileRef = this.storage.ref(filepath);

    const task = this.storage.upload(filepath, resizedImage);

    task.percentageChanges().subscribe((percentage) => {
      this.uploadPercent = percentage;
    });

    task
      .snapshotChanges()
      .pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe((url) => {
            this.picture = url;
            this.toastr.success('Image Upload SuccessFully!');
          });
        })
      )
      .subscribe();
  }
}

import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

// Angular Forms
import { NgForm } from '@angular/forms';
import { finalize } from 'rxjs/operators';

// Firebase
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFireDatabase } from '@angular/fire/database';

// Browser Image Resizer
import { readAndCompressImage } from 'browser-image-resizer';
import { imageConfig } from './../../../utils/Image-resize-config';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit {
  picture: string =
    'https://learnyst.s3.amazonaws.com/assets/schools/2410/resources/images/logo_lco_i3oab.png';

  uploadPercentage: number = null;

  constructor(
    private auth: AuthService,
    private router: Router,
    private db: AngularFireDatabase,
    private storage: AngularFireStorage,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {}

  onSubmit(f: NgForm) {
    const { name, email, password, username, country, bio } = f.form.value;
    // further Sanitization - do here

    this.auth
      .signUp(email, password)
      .then((res) => {
        console.log(res);
        const { uid } = res.user;
        this.db.object(`/users/${uid}`).set({
          id: uid,
          name: name,
          email: email,
          instaUserName: username,
          country: country,
          bio: bio,
          picture: this.picture,
        });
      })
      .then(() => {
        this.router.navigateByUrl('/');
        this.toastr.success('SignUp Success');
      })
      .catch((err) => {
        console.log(err);
        this.toastr.error('SignUp Failed!');
      });
  }

  async uploadFile(event) {
    const file = event.target.files[0];
    let resizedImage = await readAndCompressImage(file, imageConfig);

    const filePath = file.name; // rename the image with uuid (Todo)
    const fileRef = this.storage.ref(filePath);

    const task = this.storage.upload(filePath, resizedImage);
    task.percentageChanges().subscribe((pertentage: number) => {
      this.uploadPercentage = pertentage;
    });

    task
      .snapshotChanges()
      .pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe((url) => {
            this.picture = url;
            this.toastr.success('Image Upload Successfully');
          });
        })
      )
      .subscribe();
  }
}

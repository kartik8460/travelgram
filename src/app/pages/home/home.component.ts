import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AngularFireDatabase } from '@angular/fire/database';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  users = [];
  posts = [];
  isLoading: boolean = false;

  constructor(private db: AngularFireDatabase, private toastr: ToastrService) {
    this.isLoading = true;

    // get all users from firebase
    db.object('/users')
      .valueChanges()
      .subscribe((users) => {
        if (users) {
          this.users = Object.values(users);
          this.isLoading = false;
        } else {
          toastr.error('NO User Not Found');
          this.users = [];
          this.isLoading = false;
        }
      });

    // get all posts from firebase
    db.object('/posts')
      .valueChanges()
      .subscribe((posts) => {
        if (posts) {
          this.posts = Object.values(posts).sort((a, b) => b.date - a.date);
          this.isLoading = false;
        } else {
          toastr.error('No Posts to display');
          this.posts = [];
          this.isLoading = false;
        }
      });
  }

  ngOnInit(): void {}
}

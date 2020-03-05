import { Component, OnInit, AfterViewInit } from '@angular/core';
import { initTextEditor } from '../../../helpers/posts.helper';
import { I18nService } from '../../../services/i18n.service';
import { SettingsService } from '../../../services/settings.service';
import { slugify } from '../../../helpers/functions.helper';
import { Language } from '../../../models/language.model';
import { CategoriesService } from '../../../services/collections/categories.service';
import { Category } from '../../../models/collections/category.model';
import { Observable, Subject } from 'rxjs';
import { map, take, takeUntil } from 'rxjs/operators';
import { AlertService } from '../../../services/alert.service';
import { PostsService } from '../../../services/collections/posts.service';
import { NavigationService } from '../../../services/navigation.service';
import { Post, PostStatus } from '../../../models/collections/post.model';

@Component({
  selector: 'fa-posts-add',
  templateUrl: './posts-add.component.html',
  styleUrls: ['./posts-add.component.css']
})
export class PostsAddComponent implements OnInit, AfterViewInit {

  title: string;
  editor: any;
  status: PostStatus;
  language: string;
  languages: Language[];
  slug: string;
  date: string;
  private image: File;
  checkedCategories: string[] = [];
  categoriesObservable: Observable<Category[]>;
  newCategory: string;
  isSubmitButtonsDisabled: boolean = false;
  private languageChange: Subject<void> = new Subject<void>();

  constructor(
    private i18n: I18nService,
    private settings: SettingsService,
    private categories: CategoriesService,
    private alert: AlertService,
    private posts: PostsService,
    private navigation: NavigationService
  ) { }

  ngOnInit() {
    this.status = PostStatus.Draft;
    this.languages = this.settings.getActiveSupportedLanguages();
    this.language = this.languages[0].key;
    this.date = new Date().toISOString().slice(0, 10);
    this.image = null;
    this.setCategoriesObservable();
  }

  ngAfterViewInit() {
    this.editor = initTextEditor('#editor-container', this.i18n.get('PostContent'));
  }

  private setCategoriesObservable() {
    this.categoriesObservable = this.categories.getWhere('lang', '==', this.language).pipe(
      map((categories: Category[]) => {
        return categories.sort((a: Category, b: Category) => b.createdAt - a.createdAt);
      }),
      takeUntil(this.languageChange)
    );
  }

  onTitleInput() {
    this.slug = slugify(this.title).substr(0, 50);
  }

  onLanguageChange() {
    this.languageChange.next();
    this.checkedCategories = [];
    this.setCategoriesObservable();
  }

  addCategory(event: Event) {
    const target = event.target as any;
    target.disabled = true;
    this.categories.add({
      label: this.newCategory,
      slug: slugify(this.newCategory),
      lang: this.language
    }).catch((error: Error) => {
      this.alert.error(error.message);
    }).finally(() => {
      this.newCategory = '';
    });
  }

  onCategoryCheck(category: Category, event: Event|any) {
    if (event.target.checked) {
      this.checkedCategories.push(category.id);
    } else {
      const index = this.checkedCategories.indexOf(category.id);
      if (index !== -1) {
        this.checkedCategories.splice(index, 1);
      }
    }
  }

  onImageChange(event: Event, postImageButton: HTMLButtonElement) {
    const imageFile = (event.target as HTMLInputElement).files[0];
    postImageButton.innerHTML = imageFile.name;
    this.image = imageFile;
  }

  addPost(status?: PostStatus) {
    this.isSubmitButtonsDisabled = true;
    // Check if post slug is duplicated
    this.posts.getWhere(this.language + '.slug', '==', this.slug).pipe(take(1)).toPromise().then((posts: Post[]) => {
      //console.log(posts);
      if (posts && posts.length) {
        // Warn user about post slug
        this.alert.warning(this.i18n.get('PostSlugAlreadyExists'), false, 5000);
        this.isSubmitButtonsDisabled = false;
      } else {
        // Add post
        if (status) {
          this.status = status;
        }
        this.posts.add({
          lang: this.language,
          title: this.title,
          slug: this.slug,
          date: new Date(this.date).getTime(),
          content: this.editor.root.innerHTML,
          image: this.image,
          status: this.status,
          categories: this.checkedCategories
        }).then(() => {
          this.alert.success(this.i18n.get('PostAdded'), false, 5000, true);
          this.navigation.redirectTo('posts', 'list');
        }).catch((error: Error) => {
          this.alert.error(error.message);
        }).finally(() => {
          this.isSubmitButtonsDisabled = false;
        });
      }
    }).catch((error: Error) => {
      this.alert.error(error.message);
      this.isSubmitButtonsDisabled = false;
    });
  }

  publishPost() {
    this.addPost(PostStatus.Published);
  }

}

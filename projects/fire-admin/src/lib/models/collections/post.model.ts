import { Observable } from 'rxjs';

export interface PostData {
  id?: string,
  lang?: string,
  title: string,
  slug: string,
  date: number,
  image?: File|string|Observable<string>,
  content: string,
  status: PostStatus,
  categories: string[],
  createdAt?: number,
  updatedAt?: number,
  isTranslatable?: boolean
}

export enum PostStatus {
  Draft = 'draft',
  Published = 'published',
  Trash = 'trash'
}

export interface Post {
  [key: string]: PostData // key == lang
}

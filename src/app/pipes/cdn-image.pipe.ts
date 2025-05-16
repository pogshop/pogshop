import { Pipe, PipeTransform } from '@angular/core';

export const cdnImage = (url: string): string => {
  if (!url) return '';

  if (url.includes('storage.googleapis.com/pogshop-387c5.firebasestorage.app')) {
    const path = url.split('.app')[1];
    return `https://cdn.pogshop.gg${path}`;
  }

  return url;
};

@Pipe({
  name: 'cdnImage',
  standalone: true
})
export class CdnImagePipe implements PipeTransform {
  transform(value: string): string {
    return cdnImage(value);
  }
}
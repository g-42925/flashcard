import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'quickSearch'
})
export class QuickSearchPipe implements PipeTransform {
  transform(value:any[],args:any):any[] {
    var tmp:any[] = []

    if(args.searchType === 'romaji'){
      value.forEach((word,index) => {
        if(word.romaji.includes(args.filter)){
          tmp.push(word)
        }
      })
    }

    if(args.searchType === 'kanji'){
      value.forEach((word,index) => {
        if(word.original.includes(args.filter)){
          tmp.push(word)
        }
      })
    }

    if(args.searchType === 'mean'){
      value.forEach((word,index) => {
        if(word.mean.includes(args.filter)){
          tmp.push(word)
        }
      })
    }

    return tmp
  }

}

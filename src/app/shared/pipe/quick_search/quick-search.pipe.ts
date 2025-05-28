import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'quickSearch'
})
export class QuickSearchPipe implements PipeTransform {
  transform(value:any[],filter:string):any[] {
    var tmp:any[] = []
    value.forEach((word,index) => {
      if(word.romaji.includes(filter)){
        tmp.push(word)
      }
    })

    return tmp
  }

}

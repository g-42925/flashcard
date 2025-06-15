import { Router } from '@angular/router'
import { CommonModule } from '@angular/common';
import { Component,OnInit,ViewChildren,QueryList,ElementRef,inject} from '@angular/core';

@Component({
  selector: 'app-result',
  imports: [CommonModule],
  templateUrl: './result.component.html',
  styleUrl: './result.component.css'
})
export class ResultComponent{
  router = inject(Router)
  whsState:any[] = window.history.state.state
  @ViewChildren('retype') retypeFields!: QueryList<ElementRef>;

  kanjiViewMode = false
  romajiReveal = false
  revealId = ''
  selected = ''

  reveal(id:string):void{
    this.romajiReveal = true
    this.revealId = id

    var el = this.retypeFields.find(rF => {
      var {id} = rF.nativeElement
      return id === this.revealId
    })

    if(el){
      var [filter] = this.whsState.filter(f => {
        return f.id === this.revealId
      })
      el.nativeElement.value = filter.romaji
      el.nativeElement.disabled = true
    }
  }

  
  onChange(event:any,romaji:string,index:number){
    if(event.target.value === romaji && index != this.whsState.length -1){
      this.whsState = this.whsState.filter((x,i) => i != index)
      this.retypeFields[0].focus()


      // var nextIndexWord = this.whsState[index + 1]
      // var el = this.retypeFields.find(rF => {
      //   var {id} = rF.nativeElement
      //   return id === nextIndexWord.id
      // })
      
      // if(el){
      //   el.nativeElement.focus()
        // this.whsState = this.whsState.filter((x,i) => {
        //   return i != index
        // })
      // }
    }

    if(event.target.value === romaji && index === this.whsState.length -1){
      this.router.navigateByUrl('/exercise')
    }
    
  }
}

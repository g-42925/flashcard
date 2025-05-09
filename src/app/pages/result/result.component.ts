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
  correctList:any[] = []
  whsState:any[] = window.history.state.state
  @ViewChildren('retype') retypeFields!: QueryList<ElementRef>;

  romajiReveal = false
  revealId = ''

  reveal(id:string){
    this.romajiReveal = true
    this.revealId = id
  }

  onChange(event:any,romaji:string,index:number){
    if(event.target.value === romaji && index != this.whsState.length -1){
      var nextIndexWord = this.whsState[index + 1]
      var el = this.retypeFields.find(rF => {
        var {id} = rF.nativeElement
        return id === nextIndexWord.id
      })
      
      if(el){
        el.nativeElement.focus()
      }

      this.correctList = [
        ...this.correctList,
        romaji
      ]
    }

    if(event.target.value === romaji && index === this.whsState.length -1){
      this.router.navigateByUrl('/exercise')
    }
    
  }
}

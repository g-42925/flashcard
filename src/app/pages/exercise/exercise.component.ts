import { Router } from '@angular/router'
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient,HttpClientModule } from '@angular/common/http';
import { NgSelectModule } from '@ng-select/ng-select';
import { Component,OnInit,inject,HostListener } from '@angular/core';

@Component({
  selector: 'app-exercise',
  templateUrl: './exercise.component.html',
  styleUrl: './exercise.component.css',
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    NgSelectModule
  ],
})
export class ExerciseComponent implements OnInit {
  router = inject(Router)
  index = 0
  newWord = ''
  words:any[] = []
  inSubmitProcess = false
  dropDownValue:any[] = []
  updateMode = false
  submitMode = false
  http = inject(HttpClient)
  updateValue:Update = {}
  forgottenWords:any[] = []
  previousSubmitted = ''

  submit(){   
    this.inSubmitProcess = true 

    var [original,romaji,mean] = this.newWord.split(' - ')

    var submitParams = {original,romaji,mean,addedAt:'5/7'}

    var [filter] = this.words.filter(word => word.original === original)

    if(!filter) this.http.post('http://localhost:8000/',submitParams).subscribe({
      next : r => {
        this.inSubmitProcess = false
        this.previousSubmitted = this.newWord
        setTimeout(() => {
          this.newWord = ''
        },500)
      },
      error:e => {
        alert(e.message)
      }
    })

    if(filter){
      alert('already exist')
    }
  }

  update(){
    this.http.put('http://localhost:8000/',this.updateValue).subscribe(r => {
      this.updateMode = false
    });
  }

  delete(id:string){
    this.http.delete(`http://localhost:8000/${id}`).subscribe(r => {
      window.location.reload()
    });
  }

  ngOnInit(){
    this.http.get<any[]>('http://localhost:8000/?category=all').subscribe(r => {
      this.words = r
      this.updateValue = {
        ...r[0]
      }
      this.dropDownValue = r.map(w => {
        return `${w.original} (${w.romaji})`
      })
    });
  }

  goTo(value:any){
    this.index = this.dropDownValue.indexOf(value)
  }

  setForget(){
    this.forgottenWords = [
      ...this.forgottenWords,
      this.words[this.index]
    ]
  }

  setNewIndex(eventType:string){
    if(eventType === 'previously'){
      this.index = this.index-1
    }
    else{
      if(this.index < this.words.length -1){
        this.index = this.index+1
      }
      else{
        this.index = 0
      }
    }

    this.updateValue = {
      ...this.words[this.index]
    }
  }

  viewResult(){
    var state = {state:this.forgottenWords}
    this.router.navigateByUrl('/result',state);
  }

  @HostListener('window:keydown', ['$event']) handleKeyDown(event: KeyboardEvent) {
    if(event.key === 'Shift') this.setNewIndex('increment')
  }

  onPaste(e: any){
    e.preventDefault();
    const text = e.dataTransfer?.getData('text');
    if(text != this.previousSubmitted){
      this.newWord = text
      this.submit()
    }
    else{
      alert('error')
    }

    
  }
}


interface Update{
  id?:string,
  original?:string,
  romaji?:string,
  mean?:string,
  addedAt?:string
}

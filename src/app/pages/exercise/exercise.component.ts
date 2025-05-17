import { Router } from '@angular/router'
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient,HttpClientModule,HttpHeaders } from '@angular/common/http';
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

  async submit(params? : string[]){   
    this.inSubmitProcess = true

    if(params){
      const [original,romaji,mean] = params[0].split(' / ')
      const [filter] = this.words.filter(word => word.original === original)
      const url = 'https://68282ac66b7628c5291263ef.mockapi.io/cards'

      if(params.length > 1){
        if(!filter) this.http.post(url,{original,romaji,mean}).subscribe({
          next:r => {
            var f = params.filter((w,idx) => {
              return idx > 0
            })
            this.submit(
              f
            )
          },
          error:e => {
            alert(e.message)
          }
        })
        if(filter){
          alert('this word is already exist')
          var f = params.filter((w,idx) => {
            return idx > 0
          })
          this.submit(
            f
          )
        }
      }

      if(params.length < 2){
        if(!filter) this.http.post(url,submitParams).subscribe({
          next:r => {
            this.inSubmitProcess = false
            this.newWord = ''
          },
          error:e => {
            this.inSubmitProcess = false
            this.newWord = ''
            alert(e.message)
          }
        })

        if(filter){
          this.newWord = ''
          this.inSubmitProcess = false
          alert('this word is already exist')
        }
      }
    }
    
    if(!params){
      this.submit(this.newWord.split('\n'))
    }
  }

  

  update(){
    const headers = new HttpHeaders({'localtonet-skip-warning':'ok'});
    this.http.put('http://localhost:8000/',this.updateValue,{headers,withCredentials:true}).subscribe(r => {
      this.updateMode = false
    });
  }

  delete(id:string){
    const headers = new HttpHeaders({'localtonet-skip-warning':'ok'});
    this.http.delete(`http://localhost:8000/${id}`,{headers,withCredentials:true}).subscribe(r => {
      window.location.reload()
    });
  }

  ngOnInit(){    
    this.http.get<any[]>('https://68282ac66b7628c5291263ef.mockapi.io/cards').subscribe(r => {
      this.words = r
      this.updateValue = {
        ...r[0]
      }
      this.dropDownValue = r.map((w,index) => {
        return `${index+1}. ${w.original} (${w.romaji})`
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

  @HostListener('window:keydown',['$event']) handleKeyDown(event: KeyboardEvent) {
    if(event.key === 'Shift') this.setNewIndex('increment')
  }
}


interface Update{
  id?:string,
  original?:string,
  romaji?:string,
  mean?:string,
  addedAt?:string
}

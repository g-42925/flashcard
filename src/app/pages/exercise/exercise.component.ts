import { shuffle } from 'lodash'
import { Router } from '@angular/router'
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { NgSelectModule } from '@ng-select/ng-select';
import { Component,OnInit,inject,HostListener } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-exercise',
  templateUrl: './exercise.component.html',
  styleUrl: './exercise.component.css',
  imports: [
    CommonModule,
    FormsModule,
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
  source = environment.source
  
  async submit(params? : string[]){   
    this.inSubmitProcess = true

    var current = this.words

    var headers = new HttpHeaders({
      'ngrok-skip-browser-warning':'true'
    })

    var config = {
      headers:headers,
      withCredentials:true
    }

    if(params){
      const [original,hiragana,romaji,mean] = params[0].split(' / ')
      const [filter] = current.filter(word => word.original === original)
      const submitParameter = {original,hiragana,romaji,mean}

      if(params.length > 0){
        if(!filter) this.http.post<any>(this.source,submitParameter,config).subscribe({
          next:r => {
            var submitted = `${original} / ${hiragana} / ${romaji} / ${mean}\n`

            this.newWord = this.newWord.replace(`${submitted}`,"")

            var [target] = (r as any[]).filter(w => {
              return w.original === original
            })

            if(this.words.length < 1){
              this.words = r as any[]

              this.updateValue = {
                ...(r as any)[0]
              }
            }
            else{
              this.words = [
                ...this.words,
                target
              ]
            }

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
          if(f.length > 0){
            this.submit(
              f
            )
          }
          else{
            alert('done')
          }
        }
      }

      if(params.length < 2){
        this.http.post(this.source,submitParameter,config).subscribe({
          next:r => {
            var [target] = (r as any[]).filter(w => {
              return w.original === original
            })

            if(this.words.length < 1){
              this.words = r as any[]

              this.updateValue = {
                ...(r as any)[0]
              }
            }
            else{
              this.words = [
                ...this.words,
                target
              ]
            }

            this.inSubmitProcess = false
          },
          error:e => {
            this.inSubmitProcess = false
            alert(e.message)
          }
        })
      }
    }
    
    if(!params){
      this.submit(
        this.newWord.split('\n')
      )
    }
  }

  
  update(){
    var headers = new HttpHeaders({'ngrok-skip-browser-warning':'ok'})
    var url = `${this.source}/${this.words[this.index].id}`
    var config = {headers,withCredentials:true}
   
    this.http.put<any[]>(this.source,this.updateValue,config).subscribe(r => {
      this.updateMode = false

      var index1 = this.words.findIndex(w => {
        return w.id === this.words[this.index].id
      })

      var index2 = r.findIndex(w => {
        return w.id === this.words[this.index].id
      })

      this.words[index1] = r[index2]
    });
  }

  delete(id:string){
    var headers = new HttpHeaders({'ngrok-skip-browser-warning':'ok'})
    this.http.delete(`${this.source}/${id}`,{headers,withCredentials:true}).subscribe(r => {
      this.words = this.words.filter(w => w.id != id)
    });
  }

  ngOnInit(){
    var headers = new HttpHeaders({'ngrok-skip-browser-warning':'ok'})
    this.http.get<any[]>(this.source,{headers,withCredentials:true}).subscribe(r => {
      this.words = shuffle(
        r
      )
      this.updateValue = {
        ...this.words[0]
      }
    });
  }

  goTo(value:any){
    this.index = this.dropDownValue.indexOf(value)

    this.updateValue = {
      ...this.words[this.index]
    }
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
    this.router.navigateByUrl('/result',{state});
  }

  @HostListener('window:keydown',['$event']) handleKeyDown(event: KeyboardEvent) {
    if(event.key === 'ArrowLeft') this.setNewIndex('previously')
    if(event.key === 'ArrowRight') this.setNewIndex('next')

    if(event.key === 'Shift'){
      if(this.updateMode){
        setTimeout(() => {
          this.updateMode = false
        })
      }
      
      if(!this.updateMode){
        this.setForget()
        this.updateMode = true
      }
    }
  }

  tidy(){
    this.newWord = this.newWord.replace(/\n{2,}/g, "\n")
  }

  getDropDownValue(){
    return this.words.map((w,index) => {
      return `${index+1}. ${w.original} (${w.romaji})`
    })
  }
}


interface Update{
  id?:string,
  original?:string,
  romaji?:string,
  mean?:string,
  addedAt?:string,
  hiragana?:string
}

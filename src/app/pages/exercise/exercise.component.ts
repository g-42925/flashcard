import { shuffle } from 'lodash'
import { Router } from '@angular/router'
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { NgSelectModule } from '@ng-select/ng-select';
import { Component,OnInit,inject,HostListener } from '@angular/core';
import { environment } from '../../../environments/environment';
import { QuickSearchPipe } from '../../shared/pipe/quick_search/quick-search.pipe'
@Component({
  selector: 'app-exercise',
  templateUrl: './exercise.component.html',
  styleUrl: './exercise.component.css',
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    QuickSearchPipe
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
  reviewMode = false
  quickSearchMode = false
  comparation:any[] = []
  filter = ''
  compareMode = false
  searchType = "romaji"
  
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
      const [exist] = current.filter(word => word.original === original)
      const submitParameter = {original,hiragana,romaji,mean}

      if(params.length > 1){
        if(!exist) this.http.post<any>(this.source,submitParameter,config).subscribe({
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
        if(exist){
          var failedToSubmitWord = `${original} / ${hiragana} / ${romaji} / ${mean}\n`

          this.newWord = this.newWord.replace(`${failedToSubmitWord}`,`${original} / ${hiragana} / ${romaji} / ${mean} (already exist)\n`)

          var f = params.filter((w,idx) => {
            return idx > 0
          })
          this.submit(
            f
          )
        }
      }

      if(params.length === 1){
        if(!exist) this.http.post(this.source,submitParameter,config).subscribe({
          next:r => {
            var submitted = `${original} / ${hiragana} / ${romaji} / ${mean}`

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

            this.inSubmitProcess = false
          },
          error:e => {
            this.inSubmitProcess = false
            alert(e.message)
          }
        })
        if(exist){
          var failedToSubmitWord = `${original} / ${hiragana} / ${romaji} / ${mean}`

          this.newWord = this.newWord.replace(`${failedToSubmitWord}`,`${original} / ${hiragana} / ${romaji} / ${mean} (already exist)`)

        }
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
   
    this.http.put<any[]>(`${this.source}/${this.updateValue.id}`,this.updateValue,config).subscribe(r => {
      this.updateMode = false

      var index1 = this.words.findIndex(w => w.id === this.words[this.index].id)

      var index2 = r.findIndex(w => w.id === this.words[this.index].id)

      var index3 = this.forgottenWords.findIndex(w => w.id === this.words[this.index].id)

      this.words[index1] = r[index2]
      this.forgottenWords[index3] = r[index2]
    });
  }

  delete(id:string){
    var headers = new HttpHeaders({'ngrok-skip-browser-warning':'ok'})
    this.http.delete(`${this.source}/${id}`,{headers,withCredentials:true}).subscribe(r => {
      var index = this.words.findIndex(w => w.id === id)

      this.updateValue = this.words[index + 1]

      this.words = this.words.filter(w => w.id != id)

      this.forgottenWords = this.forgottenWords.filter(w => {
        return w.id != id
      })
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

  goTo(value:string){
    var index = this.words.findIndex(w => {
      return w.original === value
    })

    this.updateValue = this.words[index]

    this.index = index
    
    this.quickSearchMode = false
  }

  setForget(){
    var word = this.words[this.index]
    var [filter] = this.forgottenWords.filter(
      w => w.original === word.original
    )

    if(!filter){
      this.forgottenWords = [
        ...this.forgottenWords,
        this.words[this.index]
      ]
    }
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
    var state = {state:shuffle(this.forgottenWords)}
    this.router.navigateByUrl('/result',{state});
  }

  @HostListener('window:keydown',['$event']) handleKeyDown(event: KeyboardEvent) {
    if(event.key === 'ArrowLeft') {
      var rule1 = !this.submitMode && !this.updateMode
      var rule2 = !this.compareMode && !this.reviewMode
      if(rule1 && rule2 && !this.quickSearchMode){
        this.setNewIndex('previously')
       
      }
    }

  

    if(event.key === 'ArrowRight') {
      var rule1 = !this.submitMode && !this.updateMode
      var rule2 = !this.compareMode && !this.reviewMode
      if(rule1 && rule2 && !this.quickSearchMode){
        this.setNewIndex('next')
      }
    }


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


    if(event.key === 'F1'){
      if(this.compareMode && this.comparation.length > 0) {
        this.comparation = []
      }
 
      if(!this.compareMode && this.comparation.length < 1){
        this.reviewMode = false
        this.quickSearchMode = !this.quickSearchMode
      }
      else{
        this.reviewMode = false
        this.quickSearchMode = false
        this.compareMode = !this.compareMode
      }
    }

    if(event.key === 'F2'){
      this.reviewMode = false
      this.compareMode = false
      this.quickSearchMode = !this.quickSearchMode
    }

    if(event.key === 'F8'){
      if(this.forgottenWords.length < 1){
        alert('no mistake has been made this far')
      }
      else{
        this.compareMode = false
        this.quickSearchMode = false
        this.reviewMode = !this.reviewMode
      }
    }

    if(event.key === 'F9'){
      //this.forgottenWords = this.words
      let list = '';
      this.words.forEach((w,index) => {
        if(list !== ''){
          list = `${list}\n${w.original} / ${w.hiragana} / ${w.romaji} / ${w.mean}`;
        }
        else{
          list = `${w.original} / ${w.hiragana} / ${w.romaji} / ${w.mean}`;
        }
        if(index === 499){
          navigator.clipboard.writeText(list)
            .then(r => alert('done'))
        }
      })
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

  compare(i:any){
    var [filter] = this.comparation.filter(
      w => w.original === i.original
    )
    
    if(!filter && this.comparation.length < 2){
      this.comparation = [
        ...this.comparation,
        i
      ]
    }
  }

  copy(v:string){
    navigator.clipboard.writeText(v)
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

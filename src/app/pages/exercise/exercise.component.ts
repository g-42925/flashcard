import { shuffle } from 'lodash'
import { ActivatedRoute,Router } from '@angular/router'
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { NgSelectModule } from '@ng-select/ng-select';
import { ViewChild,ElementRef,Component,OnInit,inject,HostListener } from '@angular/core';
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
  list = ''
  answer:any[] = []
  sentence = ''
  exerciseMode = ''
  router = inject(Router)
  route = inject(ActivatedRoute)
  index = 0
  newWord = ''
  tmpWords:any[] = []
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
  quickSearchMode = false
  filter = ''
  searchType = "romaji"
  comparation:any[] = []
  comparationMode = false
  quickReviewMode = false

  @ViewChild('sentenceRef') sentenceRef!: ElementRef<HTMLTextAreaElement>

  compare(i:any){
    var [filter] = this.comparation.filter(c => {
      return c.original === i.original
    })

    if(!filter && this.comparation.length < 3){
      this.comparation = [
        ...this.comparation,
        i
      ]
    }
  }

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
    this.http.delete(`${this.source}/${id}`,{headers,withCredentials:true}).subscribe({
      next:r => {
        var index = this.words.findIndex(w => w.id === id)

        this.updateValue = this.words[index + 1]

        this.words = this.words.filter(w => w.id != id)

        this.forgottenWords = this.forgottenWords.filter(w => {
          return w.id != id
        })
      },
      error:e => {
        alert(e.message)
      }
    })
  }

  ngOnInit(){
    var headers = new HttpHeaders({'ngrok-skip-browser-warning':'ok'})

    this.exerciseMode = this.route.snapshot.queryParamMap.get('mode') ?? 'flashcard'

    this.http.get<any[]>(this.source,{headers,withCredentials:true}).subscribe(r => {
      if(this.exerciseMode === 'flashcard'){
        this.words = shuffle(
          r
        )
        this.updateValue = {
          ...this.words[0]
        }
      }
      if(this.exerciseMode === 'sentence'){
        this. words = shuffle(r)

        this.words.forEach(w => {
          this.sentence = `${this.sentence}${w.original}`
        })
      }
    });
  }

  goTo(value:string){
    var index = this.words.findIndex(w => {
      return w.original === value
    })

    this.updateValue = this.words[index]

    this.index = index + 1
    
    this.quickSearchMode = false
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

  @HostListener('window:keydown',['$event']) handleKeyDown(event: KeyboardEvent) {
    if(event.key === 'ArrowLeft') {
      var rule1 = !this.submitMode && !this.updateMode
      if(rule1 && !this.quickSearchMode){
        this.setNewIndex('previously')   
      }
    }

    if(event.key === 'ArrowRight') {
      var rule1 = !this.submitMode && !this.updateMode
      if(rule1 && !this.quickSearchMode){
        this.setNewIndex('next')
      }
    }


    if(event.key === 'Shift' && this.exerciseMode === 'sentence'){
      var selected = window.getSelection()
      var reference = this.sentenceRef.nativeElement
      var selectedString = selected ? selected?.toString() : ''
      var [filter1] = this.words.filter(w => w.original === selectedString)

      if(filter1){
        this.words = shuffle(this.words.filter(w =>  w.original != filter1.original))

        this.sentence = ''

        this.words.forEach(w => {
          this.sentence = `${this.sentence}${w.original}`
        })

        var [filter2] = this.answer.filter(w => {
            return w === filter1.original
        })

        if(!filter2) this.answer = [
          filter1,
          ...this.answer
        ]

        setTimeout(() => {
          reference.focus()
          reference.setSelectionRange(0,0)
        })
      }
    }

    if(event.key === 'Shift' && this.exerciseMode === 'flashcard'){
      if(!this.updateMode) this.skip(this.index)

      this.updateMode = !this.updateMode
    }

    if(event.key === 'F1'){
      if(this.comparationMode){
        this.comparation = []
      }

      if(this.comparation.length < 1 && !this.comparationMode){
        this.quickSearchMode = true
      }
      else{        
        this.quickReviewMode = false
        this.quickSearchMode = false
        this.comparationMode = !this.comparationMode
      }
    }


    if(event.key === 'F2'){
      this.quickReviewMode = false
      this.quickSearchMode = !this.quickSearchMode
      this.comparationMode  = false
    }

    if(event.key === 'F8'){
      this.quickSearchMode = false
      this.comparationMode = false
      this.quickReviewMode = !this.quickReviewMode
    }

    if(event.key === 'F9'){
      this.words.forEach((w,index) => {
        if(this.list !== ''){
          this.list = `${this.list}\n${w.original} / ${w.hiragana} / ${w.romaji} / ${w.mean}`;
        }
        else{
          this.list = `${w.original} / ${w.hiragana} / ${w.romaji} / ${w.mean}`;
        }
        if(index === 499){
          navigator.clipboard.writeText(this.list).then(r => alert('done'))
        }
      })
    }
  }

  tidy(){
    this.newWord = this.newWord.replace(/\n{2,}/g, "\n")
  }

  copy(v:string){
    navigator.clipboard.writeText(v)
  }  

  undo(){
    var last = this.answer[0]
    var randIdx = Math.floor(Math.random() * (this.words.length - 1)) + 1;
    
    this.sentence = ''
    this.words.splice(randIdx,0,last)
    
    this.words.forEach(w => {
      this.sentence = `${this.sentence}${w.original}`
    })
    this.answer = this.answer.filter(a => {
      return a.original != last.original
    })
  }

  skip(index:number){
    var [filter1] = this.words.filter((w,i) => {
      return i === index
    })

    var [filter2] = this.forgottenWords.filter(
      w => w.original === filter1.original
    )
 

    if(!filter2) {
      this.forgottenWords = [
        filter1,
        ...this.forgottenWords,
      ] 
    }
  }

  review(){
  	this.router.navigate(['/result'],{state:{state:this.forgottenWords}})
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
